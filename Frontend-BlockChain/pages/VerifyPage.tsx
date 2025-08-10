import React, { useState, FormEvent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockBlockchainService } from '../services/mockBlockchainService';
import type { BlockchainRecord } from '../types';
import Spinner from '../components/Spinner';
import { CheckCircleIcon, XCircleIcon, HashIcon } from '../constants';
import CopyButton from '../components/CopyButton';

const VerifyPage: React.FC = () => {
  const [hash, setHash] = useState<string>('');
  const [result, setResult] = useState<'valid' | 'invalid' | 'idle'>('idle');
  const [record, setRecord] = useState<BlockchainRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();

  const handleVerification = (hashToVerify: string) => {
    if (!hashToVerify) return;
    setIsLoading(true);
    setResult('idle');
    setRecord(null);

    // Simulate network delay
    setTimeout(() => {
      const foundRecord = mockBlockchainService.verifyHash(hashToVerify.trim());
      if (foundRecord) {
        setRecord(foundRecord);
        setResult('valid');
      } else {
        setResult('invalid');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleVerification(hash);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hashFromUrl = params.get('hash');
    if (hashFromUrl) {
      setHash(hashFromUrl);
      handleVerification(hashFromUrl);
    }
  }, [location]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Verify Prescription Hash</h1>
        <p className="text-slate-400 mb-12 max-w-2xl">Enter a prescription's unique SHA-256 hash to verify its authenticity on the mock blockchain ledger.</p>

        <form onSubmit={handleSubmit} className="w-full max-w-xl mb-12">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <HashIcon className="h-6 w-6 text-slate-500" />
              </div>
              <input
                type="text"
                name="hash"
                id="hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-4 pl-14 pr-4 text-white placeholder-slate-500 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter SHA-256 hash..."
              />
            </div>
             <button
                type="submit"
                disabled={isLoading || !hash}
                className="mt-4 w-full inline-flex items-center justify-center py-4 px-6 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500 disabled:bg-slate-600 disabled:border-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Spinner size="sm" /> : 'Verify Authenticity'}
              </button>
        </form>

        <div className="w-full max-w-3xl min-h-[250px] flex items-center justify-center bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          {isLoading && <Spinner size="md" text="Verifying on blockchain..." />}
          
          {result !== 'idle' && !isLoading && (
             <div className="w-full animate-fade-in">
              {result === 'valid' && record ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-200 p-8 w-full rounded-xl" role="alert">
                  <div className="flex items-start gap-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 flex-shrink-0"/>
                    <div className="text-left">
                        <p className="font-bold text-2xl">Prescription is Valid</p>
                        <p className="text-md text-green-300">This record was found on the blockchain and is authentic.</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-green-500/20 text-left text-base grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <div><span className="font-semibold text-green-100">Timestamp:</span><br/>{new Date(record.timestamp).toLocaleString()}</div>
                      <div><span className="font-semibold text-green-100">Patient Name:</span><br/>{record.data.patientName}</div>
                      {record.data.patientAge && <div><span className="font-semibold text-green-100">Patient Age:</span><br/>{record.data.patientAge}</div>}
                      {record.data.patientGender && <div><span className="font-semibold text-green-100">Patient Gender:</span><br/>{record.data.patientGender}</div>}
                      <div className="sm:col-span-2"><span className="font-semibold text-green-100">Prescribed by:</span><br/>{record.data.doctorName}</div>
                      <div className="sm:col-span-2"><span className="font-semibold text-green-100">Medicines:</span><br/>{record.data.medicineNames.join(', ')}</div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-green-500/20">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-bold text-green-100">Verification Hash:</p> 
                            <p className="font-mono text-sm break-all mt-1">{record.hash}</p>
                        </div>
                        <CopyButton textToCopy={record.hash} />
                    </div>
                  </div>
                </div>
              ) : result === 'invalid' && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 w-full rounded-xl" role="alert">
                    <div className="flex items-center gap-6">
                        <XCircleIcon className="h-12 w-12 text-red-400 flex-shrink-0"/>
                        <div className="text-left">
                            <p className="font-bold text-2xl">Prescription is Invalid</p>
                            <p className="text-md text-red-300">No record with this hash was found on the blockchain. The prescription may be fraudulent or the hash incorrect.</p>
                        </div>
                    </div>
                </div>
              )}
             </div>
          )}
          
          {result === 'idle' && !isLoading && !hash && (
              <div className="text-center text-slate-500 space-y-4">
                <HashIcon className="h-16 w-16 mx-auto text-slate-600"/>
                <p className="text-lg">Verification results will appear here.</p>
              </div>
          )}
        </div>
    </div>
  );
};

export default VerifyPage;