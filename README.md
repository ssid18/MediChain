# 🏥 MediChain – AI + Blockchain Powered Prescription Verification

**Secure. Transparent. Fraud-proof.**  
MediChain is a prescription verification system that ensures the authenticity of medical prescriptions using AI and blockchain.  
It helps prevent medical fraud, promotes trust in healthcare, and makes prescription validation accessible — even in remote areas.

---

## 🎯 Problem Statement

**Prescription fraud and tampering are major issues in healthcare**, leading to:

- Misuse of restricted medicines  
- Black market circulation  
- Forged doctor signatures and details  
- Difficulty in verifying authenticity, especially in rural areas  

---

## 💡 Our Solution

MediChain combines AI-based prescription data extraction with blockchain storage to create a tamper-proof verification system.

1. **Upload Prescription** → Doctor or patient uploads a typed prescription.  
2. **AI Extraction** → Key details (doctor ID, medicine name, dosage, date) are parsed.  
3. **Blockchain Storage** → Prescription hash & metadata are stored on a public blockchain.  
4. **QR Code Verification** → Each verified prescription gets a QR code for instant authentication.  
5. **Secure Lookup** → Pharmacists or patients scan the QR code to validate authenticity.  

---

## 🎯 Key Features

- **Digital Prescription Generation** – Doctors can issue secure, typed prescriptions.  
- **Unique QR Code for Each Prescription** – Encodes verification details for fast scanning.  
- **Instant Verification** – Pharmacies can scan and verify prescriptions in real time.  
- **Secure Doctor Database** – Only registered and verified doctors can issue prescriptions.  
- **Blockchain-Ready Architecture** – Option to store verification records on blockchain for immutability and audit trail.  
- **Offline-Friendly** – Verification works even with minimal internet connectivity (QR scan + local database check).  
- **User-Friendly Web App** – Simple UI for doctors, pharmacies, and admins.  

---

## 🛠️ Tech Stack

**Frontend:** React.js, Tailwind CSS, qrcode.react  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Blockchain:** Solidity, Polygon Mumbai Testnet, Ethers.js, MetaMask  
**AI Integration:** OpenAI GPT-4o (for extracting key data from typed prescriptions)  

---


## 📂 Project Structure


```plaintext
medichain/
│
├── backend/        # Backend server & APIs
├── frontend/       # React frontend
├── contracts/      # Smart contracts
├── docs/           # Documentation & diagrams
└── README.md
```

---


## 📌 Demo Flow

1. **Doctor Login** → Doctor enters prescription details.  
2. **AI Parsing** → GPT-4o extracts and formats key data.  
3. **Blockchain Storage** → Prescription hash stored on Polygon Mumbai.  
4. **QR Code Generation** → QR linked to verification API.  
5. **Verification** → Anyone can scan QR to check blockchain authenticity.  

---

## 🌟 Future Scope

- OCR for handwritten prescriptions  
- Integrate with national e-health systems  
- Add analytics dashboard for regulator insights (prescribing patterns, anomalies)  
- A mobile app for rural pharmacists with offline sync  

---

## 👥 Built by Team Void

- **@ssid18** – AI & Blockchain Integration  
- **@Dakshx07** – Frontend Development  
- **@lakshitsoni26** – Backend & API Development  

---