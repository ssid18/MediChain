import React, { useState, useMemo, useEffect } from 'react';
import { DEMO_DOCTORS, DoctorIcon, ShieldCheckIcon } from '../constants';
import { authService } from '../services/authService';
import type { User } from '../types';

interface DirectoryDoctor {
    id: string;
    name: string;
    clinic: string;
    isVerified: boolean;
}

const DoctorDirectoryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allDoctors, setAllDoctors] = useState<DirectoryDoctor[]>([]);

    useEffect(() => {
        const demoData: DirectoryDoctor[] = DEMO_DOCTORS.map(d => ({...d, name: d.name, clinic: d.clinic, isVerified: false}));
        
        const registeredDoctorsData: DirectoryDoctor[] = authService.getVerifiedDoctors().map(user => ({
            id: user.id,
            name: user.username,
            clinic: 'Digital Practitioner', // Default clinic for registered users
            isVerified: true,
        }));
        
        // Prevent duplicates if a registered user has the same name as a demo user
        const combined = [...demoData];
        registeredDoctorsData.forEach(regDoc => {
            if (!combined.some(demoDoc => demoDoc.name.toLowerCase() === regDoc.name.toLowerCase())) {
                combined.push(regDoc);
            }
        });

        setAllDoctors(combined);
    }, []);

    const filteredDoctors = useMemo(() => {
        if (!searchTerm) {
            return allDoctors;
        }
        return allDoctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allDoctors]);

    return (
        <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in">
            <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700/50">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Doctor Directory</h1>
                <p className="text-slate-400 mb-6">Browse and search for verified medical professionals in the system.</p>
                
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, clinic, or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor, index) => (
                            <div key={doctor.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700/80 hover:border-violet-500/50 hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-slate-700 rounded-full">
                                        <DoctorIcon className="h-8 w-8 text-violet-400"/>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{doctor.name}</h3>
                                            {doctor.isVerified && (
                                                <div title="Verified Practitioner">
                                                     <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 font-mono">{doctor.id}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-300">{doctor.clinic}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 md:col-span-3 text-center py-8">No doctors found matching your search.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDirectoryPage;