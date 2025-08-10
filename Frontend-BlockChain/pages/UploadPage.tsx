
import React, { useState, useContext, ChangeEvent, useEffect } from 'react';
import QRCode from 'qrcode';
import { geminiService } from '../services/geminiService';
import { mockBlockchainService } from '../services/mockBlockchainService';
import { generateHash } from '../utils/crypto';
import type { PrescriptionData } from '../types';
import { AuthContext } from '../App';
import Spinner from '../components/Spinner';
import { CheckCircleIcon, QrCodeIcon, CloudUploadIcon } from '../constants';
import { offlineSyncService } from '../services/offlineSyncService';
import CopyButton from '../components/CopyButton';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<{ data: PrescriptionData; hash: string; isQueued?: boolean } | null>(null);
  const authContext = useContext(AuthContext);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError('');
    }
  };
  
  useEffect(() => {
    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (result && result.hash && !result.isQueued) {
        const canvas = document.getElementById('qr-canvas-upload');
        if (canvas) {
            const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${result.hash}`;
            QRCode.toCanvas(canvas, verifyUrl, { width: 112, margin: 1, color: { dark: '#FFFFFF', light: '#00000000' } }, (error) => {
                if (error) console.error('QR Code generation failed:', error);
            });
        }
    }
  }, [result]);

  const handleSubmit = async () => {
    if (!file || !authContext?.user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }
    
    // Check if offline
    if (!navigator.onLine) {
        try {
            await offlineSyncService.queuePrescription(file, authContext.user.id, authContext.user.role);
            setResult({ data: { patientName: 'N/A', doctorName: 'N/A', date: 'N/A', medicineNames: [], dosages: [] }, hash: 'Pending sync...', isQueued: true });
            setFile(null); // Clear file after queuing
            setPreview(null);
        } catch (err: any) {
            setError(err.message || 'Failed to queue prescription for offline sync.');
        }
        return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const extractedData = await geminiService.extractPrescriptionData(file);
      const dataHash = await generateHash(extractedData);

      mockBlockchainService.storePrescription({
        hash: dataHash,
        data: extractedData,
        uploaderId: authContext.user.id,
        uploaderRole: authContext.user.role,
      });

      setResult({ data: extractedData, hash: dataHash });
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700/50">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Upload & Verify Prescription</h1>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">Upload an image for AI-powered validation and blockchain recording. Your upload will be queued automatically if you're offline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">1. Upload Image</h2>
            <label htmlFor="file-upload" className="relative cursor-pointer group flex flex-col justify-center items-center w-full min-h-[350px] p-6 border-2 border-slate-600 border-dashed rounded-xl hover:border-violet-500 transition-colors bg-slate-900/50">
              <div className="space-y-4 text-center">
                {preview ? (
                  <img src={preview} alt="Prescription preview" className="mx-auto max-h-64 rounded-md object-contain" />
                ) : (
                  <>
                    <CloudUploadIcon className="mx-auto h-20 w-20 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    <div className="flex text-lg text-slate-400 justify-center">
                        <span className="font-semibold text-violet-400 group-hover:text-violet-300">
                          Click to upload
                        </span>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-sm text-slate-500">PNG or JPG (max 10MB)</p>
                  </>
                )}
              </div>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
            </label>
            {file && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-4 px-4 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all flex-grow"
                >
                    {isLoading ? 'Processing...' : 'Analyze and Record'}
                </button>
                 <button
                    onClick={resetState}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex justify-center py-4 px-6 border border-slate-600 shadow-sm text-base font-medium rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-white">2. Get Result</h2>
             <div className="flex items-center justify-center min-h-[350px] bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                {isLoading && <Spinner size="lg" text="AI is analyzing the prescription..." />}
                {error && <div className="text-red-300 bg-red-500/10 border border-red-500/30 p-6 rounded-xl w-full text-center">{error}</div>}
                {result && (
                  <div className="w-full bg-slate-800 p-6 rounded-xl border border-green-500/30 shadow-lg animate-fade-in">
                     {result.isQueued ? (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <CheckCircleIcon className="h-12 w-12 text-yellow-400"/>
                                <h3 className="text-2xl font-bold text-yellow-300">Queued for Sync</h3>
                            </div>
                            <p className="text-slate-300">This prescription has been saved locally and will be processed automatically when you're back online.</p>
                        </>
                     ) : (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <CheckCircleIcon className="h-12 w-12 text-green-400"/>
                                <h3 className="text-2xl font-bold text-green-300">Analysis Complete</h3>
                            </div>
                            <div className="space-y-3 text-slate-300">
                                <p><strong>Patient:</strong> {result.data.patientName}</p>
                                {result.data.patientAge && <p><strong>Age:</strong> {result.data.patientAge}</p>}
                                {result.data.patientGender && <p><strong>Gender:</strong> {result.data.patientGender}</p>}
                                <p><strong>Doctor:</strong> {result.data.doctorName}</p>
                                <p><strong>Date:</strong> {result.data.date}</p>
                                <p><strong>Medicines:</strong> {result.data.medicineNames.join(', ')}</p>
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <p className="font-semibold text-slate-200 mb-2">Blockchain Record:</p>
                                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-400">Verification Hash</span>
                                                <CopyButton textToCopy={result.hash} />
                                            </div>
                                            <p className="font-mono text-sm break-all text-violet-300 mt-1">{result.hash}</p>
                                        </div>
                                        <div className="text-center">
                                            <QrCodeIcon className="h-6 w-6 mx-auto text-slate-400 mb-1"/>
                                            <canvas id="qr-canvas-upload"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                     )}
                  </div>
                )}
                {!isLoading && !error && !result && (
                  <div className="text-center text-slate-500">
                    <p className="text-lg">Your analysis results will appear here.</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
