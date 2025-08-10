import { GoogleGenAI, Type } from "@google/genai";
import type { PrescriptionData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        medicineNames: {
            type: Type.ARRAY,
            description: "List of all medicine names found in the prescription.",
            items: { type: Type.STRING },
        },
        dosages: {
            type: Type.ARRAY,
            description: "List of dosages corresponding to each medicine. E.g., '1 tablet 3 times a day'.",
            items: { type: Type.STRING },
        },
        doctorName: {
            type: Type.STRING,
            description: "The name of the doctor who wrote the prescription.",
        },
        patientName: {
            type: Type.STRING,
            description: "The name of the patient.",
        },
        patientAge: {
            type: Type.STRING,
            description: "The age of the patient (e.g., '35 years', '6 months').",
        },
        patientGender: {
            type: Type.STRING,
            description: "The gender of the patient (e.g., 'Male', 'Female', 'Other').",
        },
        date: {
            type: Type.STRING,
            description: "The date the prescription was issued.",
        },
    },
    required: ["medicineNames", "dosages", "doctorName", "patientName", "date"],
};


function fileToGenerativePart(base64: string, mimeType: string) {
    return {
      inlineData: {
        data: base64,
        mimeType
      },
    };
  }

export const geminiService = {
  extractPrescriptionData: async (
    imageFile: File
  ): Promise<PrescriptionData> => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const imagePart = fileToGenerativePart(base64, imageFile.type);

    const prompt = `You are an expert Optical Character Recognition (OCR) and data extraction system for medical prescriptions. Analyze the following prescription image and extract the key information. The image may contain handwritten text, which you must interpret accurately.
    
    Extract the following details and return them ONLY as a valid JSON object matching the provided schema:
    1.  **medicineNames**: An array of strings, with each string being a medicine name.
    2.  **dosages**: An array of strings, with each string being the dosage instructions for the corresponding medicine.
    3.  **doctorName**: The full name of the doctor.
    4.  **patientName**: The full name of the patient.
    5.  **patientAge**: The patient's age.
    6.  **patientGender**: The patient's gender.
    7.  **date**: The date the prescription was written.

    If any information is unclear or not present, use a placeholder like "N/A" or an empty array. Do not add any explanatory text outside of the JSON object.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [imagePart, {text: prompt}] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const jsonText = response.text.trim();
      const data = JSON.parse(jsonText) as PrescriptionData;
      return data;
    } catch (error) {
      console.error("Error processing prescription with Gemini:", error);
      throw new Error("Failed to analyze prescription. The image might be unclear or the format is not supported.");
    }
  },
};