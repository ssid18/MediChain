
import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { mockBlockchainService } from '../services/mockBlockchainService';
import { generateHash } from '../utils/crypto';
import type { BlockchainRecord, PrescriptionData } from '../types';
import { AuthContext } from '../App';
import Spinner from '../components/Spinner';
import { CheckCircleIcon, XCircleIcon, PrintIcon, LogoIcon, APP_NAME, APP_NAME_SUB, QrCodeIcon, ClipboardIcon } from '../constants';
import { useNavigate } from 'react-router-dom';
import CopyButton from '../components/CopyButton';

const PrintablePrescription: React.FC<{ record: BlockchainRecord }> = ({ record }) => (
    <div className="bg-white text-black p-8 font-sans">
        <header className="flex justify-between items-start pb-4 border-b-2 border-slate-600">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{record.data.doctorName}</h1>
                <p className="text-slate-600">Verified by {APP_NAME}</p>
            </div>
            <div className="flex items-center gap-2">
                <LogoIcon className="h-8 w-8"/>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{APP_NAME}</span>
                    <span className="text-sm font-bold text-slate-600 tracking-tight leading-tight">{APP_NAME_SUB}</span>
                </div>
            </div>
        </header>
        <main className="mt-8">
            <h2 className="text-center font-bold text-xl mb-6">PRESCRIPTION</h2>
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
                <div>
                    <p className="text-sm text-slate-600">Patient Name</p>
                    <p className="font-semibold text-lg">{record.data.patientName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-600">Date Issued</p>
                    <p className="font-semibold text-lg">{record.data.date}</p>
                </div>
                {record.data.patientAge && (
                    <div>
                        <p className="text-sm text-slate-600">Age</p>
                        <p className="font-semibold text-lg">{record.data.patientAge}</p>
                    </div>
                )}
                {record.data.patientGender && (
                     <div>
                        <p className="text-sm text-slate-600">Gender</p>
                        <p className="font-semibold text-lg">{record.data.patientGender}</p>
                    </div>
                )}
            </div>
            <div className="mt-6">
                <p className="text-lg font-bold mb-2">&#8478;</p>
                <table className="w-full">
                    <thead className="border-b border-slate-400">
                        <tr>
                            <th className="text-left font-semibold py-2">Medicine</th>
                            <th className="text-left font-semibold py-2">Dosage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {record.data.medicineNames.map((name, index) => (
                            <tr key={index} className="border-b border-slate-200">
                                <td className="py-3 pr-2">{name}</td>
                                <td className="py-3">{record.data.dosages[index]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
        <footer className="mt-16 pt-4 text-center text-xs text-slate-500 border-t border-slate-300">
            <div className="flex justify-center my-4">
                <canvas id="qr-canvas-print"></canvas>
            </div>
            <p><strong>Verification Hash:</strong></p>
            <p className="font-mono break-all">{record.hash}</p>
            <p className="mt-2">&copy; {new Date().getFullYear()} {APP_NAME}. This prescription is digitally signed and verified.</p>
        </footer>
    </div>
);

const LivePrescriptionPreview: React.FC<{
    patientData: { patientName: string; patientAge: string; patientGender: string; date: string; };
    medicines: { name: string; dosage: string }[];
    doctorName: string;
}> = ({ patientData, medicines, doctorName }) => {
    return (
        <div className="bg-white text-black p-8 font-sans rounded-xl shadow-2xl border border-slate-200/50">
            <header className="flex justify-between items-start pb-4 border-b-2 border-slate-400">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{doctorName || '[Doctor Name]'}</h1>
                    <p className="text-slate-600">Verified by {APP_NAME}</p>
                </div>
                <div className="flex items-center gap-2">
                    <LogoIcon className="h-8 w-8"/>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{APP_NAME}</span>
                        <span className="text-sm font-bold text-slate-600 tracking-tight leading-tight">{APP_NAME_SUB}</span>
                    </div>
                </div>
            </header>
            <main className="mt-8">
                <h2 className="text-center font-bold text-xl mb-6 uppercase tracking-wider">Prescription</h2>
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
                    <div>
                        <p className="text-sm text-slate-600">Patient Name</p>
                        <p className="font-semibold text-lg break-words">{patientData.patientName || <span className="text-slate-400">[Patient Name]</span>}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Date Issued</p>
                        <p className="font-semibold text-lg">{patientData.date ? new Date(patientData.date + 'T00:00:00').toLocaleDateString() : <span className="text-slate-400">[Date]</span>}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Age</p>
                        <p className="font-semibold text-lg">{patientData.patientAge || <span className="text-slate-400">N/A</span>}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-600">Gender</p>
                        <p className="font-semibold text-lg">{patientData.patientGender || <span className="text-slate-400">N/A</span>}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-3xl font-serif text-slate-700 mb-2">&#8478;</p>
                    <table className="w-full">
                        <thead className="border-b border-slate-400">
                            <tr>
                                <th className="text-left font-semibold py-2">Medicine</th>
                                <th className="text-left font-semibold py-2">Dosage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.length > 0 ? medicines.map((med, index) => (
                                <tr key={index} className="border-b border-slate-200">
                                    <td className="py-3 pr-2 font-medium break-words">{med.name}</td>
                                    <td className="py-3 text-slate-700 break-words">{med.dosage}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={2} className="py-8 text-center text-slate-500 italic">No medicines added yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            <footer className="mt-16 pt-4 text-center text-xs text-slate-500 border-t border-slate-300">
                <p>This is a real-time preview of the digital prescription.</p>
                <p className="mt-2">&copy; {new Date().getFullYear()} {APP_NAME}. This prescription will be digitally signed upon generation.</p>
            </footer>
        </div>
    );
};

const GeneratePrescriptionPage: React.FC = () => {
    const [patientData, setPatientData] = useState({
        patientName: '',
        patientAge: '',
        patientGender: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [currentMedicine, setCurrentMedicine] = useState({ name: '', dosage: '' });
    const [medicines, setMedicines] = useState<{ name: string, dosage: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<BlockchainRecord | null>(null);
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handlePatientDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPatientData({ ...patientData, [e.target.name]: e.target.value });
    };
    
    const handleMedicineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMedicine({ ...currentMedicine, [e.target.name]: e.target.value });
    };

    const handleAddMedicine = () => {
        if (currentMedicine.name && currentMedicine.dosage) {
            setMedicines(prev => [...prev, currentMedicine]);
            setCurrentMedicine({ name: '', dosage: '' });
        }
    };

    const handleRemoveMedicine = (indexToRemove: number) => {
        setMedicines(medicines.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientData.patientName || medicines.length === 0 || !authContext?.user) {
            setError('Please fill in patient name and add at least one medicine.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const prescriptionData: PrescriptionData = {
                ...patientData,
                doctorName: authContext.user.username,
                date: new Date(patientData.date).toLocaleDateString(),
                medicineNames: medicines.map(m => m.name),
                dosages: medicines.map(m => m.dosage),
            };

            const dataHash = await generateHash(prescriptionData);

            const newRecord = mockBlockchainService.storePrescription({
                hash: dataHash,
                data: prescriptionData,
                uploaderId: authContext.user.id,
                uploaderRole: authContext.user.role,
            });

            setResult(newRecord);
            setMedicines([]);
            setPatientData({ patientName: '', patientAge: '', patientGender: '', date: new Date().toISOString().split('T')[0] });
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (result && result.hash) {
            const verifyUrl = `${window.location.origin}${window.location.pathname}#/verify?hash=${result.hash}`;
            
            const canvasSuccess = document.getElementById('qr-canvas-success');
            if (canvasSuccess) {
                QRCode.toCanvas(canvasSuccess, verifyUrl, { width: 96, margin: 1, color: { dark: '#FFFFFF', light: '#00000000' } }, (error) => {
                    if (error) console.error('QR Code generation failed for success screen:', error);
                });
            }
            
            const canvasPrint = document.getElementById('qr-canvas-print');
            if (canvasPrint) {
                 QRCode.toCanvas(canvasPrint, verifyUrl, { width: 128, margin: 1 }, (error) => {
                    if (error) console.error('QR Code generation failed for print:', error);
                });
            }
        }
    }, [result]);

    if (result) {
        return (
            <>
                <div id="printable-area" className="hidden print:block">
                    <PrintablePrescription record={result} />
                </div>
                <div className="max-w-2xl mx-auto text-center animate-fade-in">
                    <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700/50">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">Prescription Generated Successfully</h2>
                        <p className="text-slate-400 mt-2 mb-6">The prescription has been signed and recorded on the blockchain.</p>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Verification Hash</span>
                                        <CopyButton textToCopy={result.hash} />
                                    </div>
                                    <p className="font-mono text-sm break-all text-violet-300 mt-1">{result.hash}</p>
                                </div>
                                <div className="text-center pl-4">
                                    <QrCodeIcon className="h-6 w-6 mx-auto text-slate-400 mb-1"/>
                                    <canvas id="qr-canvas-success"></canvas>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
                            <button onClick={() => window.print()} className="w-full inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700">
                                <PrintIcon className="w-5 h-5 mr-2"/> Download PDF / Print
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="w-full inline-flex justify-center py-2 px-4 border border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700">
                                Back to Dashboard
                            </button>
                        </div>
                         <button onClick={() => setResult(null)} className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-violet-400 hover:text-violet-300 no-print">
                            Generate Another Prescription
                        </button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Interactive Prescription Generator</h1>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">Create a secure prescription. The document preview on the right will update as you type.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700/50">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3 mb-6">Patient Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="patientName" className="block text-sm font-medium text-slate-300">Patient Full Name</label>
                                    <input type="text" name="patientName" id="patientName" value={patientData.patientName} onChange={handlePatientDataChange} required className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
                                        <input type="date" name="date" id="date" value={patientData.date} onChange={handlePatientDataChange} required className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="patientAge" className="block text-sm font-medium text-slate-300">Patient Age</label>
                                        <input type="text" name="patientAge" id="patientAge" value={patientData.patientAge} onChange={handlePatientDataChange} placeholder="e.g., 35" className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="patientGender" className="block text-sm font-medium text-slate-300">Patient Gender</label>
                                    <select name="patientGender" id="patientGender" value={patientData.patientGender} onChange={handlePatientDataChange} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3 mb-6">Medications</h2>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                {medicines.map((med, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-md mb-2 animate-fade-in" style={{ animationDuration: '300ms' }}>
                                        <div>
                                            <p className="font-medium text-slate-200">{med.name}</p>
                                            <p className="text-sm text-slate-400">{med.dosage}</p>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveMedicine(index)} className="text-red-400 hover:text-red-300">
                                            <XCircleIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))}
                                {medicines.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No medicines added yet.</p>}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                                    <div className="md:col-span-1">
                                        <label htmlFor="medicineName" className="block text-sm font-medium text-slate-300">Medicine Name</label>
                                        <input type="text" name="name" id="medicineName" value={currentMedicine.name} onChange={handleMedicineChange} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" placeholder="e.g., Paracetamol" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="dosage" className="block text-sm font-medium text-slate-300">Dosage & Instructions</label>
                                        <div className="flex gap-2">
                                            <input type="text" name="dosage" id="dosage" value={currentMedicine.dosage} onChange={handleMedicineChange} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" placeholder="e.g., 500mg, twice a day" />
                                            <button type="button" onClick={handleAddMedicine} className="mt-1 px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700">Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {error && <div className="text-red-300 bg-red-500/10 p-3 rounded-md text-sm">{error}</div>}
                        <div className="pt-4">
                            <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500 disabled:bg-slate-600">
                                {isLoading ? <Spinner size="sm" /> : 'Sign & Generate Prescription'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="lg:sticky top-28">
                    <LivePrescriptionPreview 
                        patientData={patientData} 
                        medicines={medicines} 
                        doctorName={authContext?.user?.username || ''} 
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneratePrescriptionPage;
