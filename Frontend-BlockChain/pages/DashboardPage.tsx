
import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../App';
import { mockBlockchainService } from '../services/mockBlockchainService';
import type { BlockchainRecord } from '../types';
import { DEMO_DOCTORS } from '../constants';
import { Link } from 'react-router-dom';
import CopyButton from '../components/CopyButton';
import { Role as RoleEnum } from '../types';

const DashboardPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [transactions, setTransactions] = useState<BlockchainRecord[]>([]);

  useEffect(() => {
    setTransactions(mockBlockchainService.getAllTransactions());
  }, []);

  const userTransactions = transactions.filter(
    (tx) => tx.uploaderId === authContext?.user?.id
  );
  
  const medicineFrequency = transactions.reduce((acc, tx) => {
    tx.data.medicineNames.forEach(med => {
        const normalizedMed = med.trim().toLowerCase();
        if(normalizedMed && normalizedMed !== 'n/a'){
            acc[normalizedMed] = (acc[normalizedMed] || 0) + 1;
        }
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(medicineFrequency).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 10);

  const renderAdminDashboard = () => (
    <>
      <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">System Analytics</h2>
        <p className="text-slate-400 mb-6">Top 10 prescribed medicines across the system.</p>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569"/>
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fill: '#94a3b8', fontSize: 12}}/>
              <YAxis allowDecimals={false} tick={{fill: '#94a3b8'}}/>
              <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem'}} labelStyle={{color: '#cbd5e1'}} itemStyle={{color: '#818cf8'}}/>
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} iconSize={10}/>
              <Bar dataKey="count" fill="#8b5cf6" name="Times Prescribed" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">All Transactions</h2>
        <TransactionList transactions={transactions} />
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">My Recent Activity</h2>
            {userTransactions.length > 0 ? (
                <TransactionList transactions={userTransactions} />
            ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">You have no recorded activity yet.</p>
                  <Link to="/upload" className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors">
                    Upload a Prescription
                  </Link>
                </div>
            )}
        </div>
         <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">Verified Doctors (Demo)</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Clinic/Hospital</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Doctor ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {DEMO_DOCTORS.slice(0,5).map(doctor => (
                            <tr key={doctor.id} className="hover:bg-slate-700/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doctor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{doctor.clinic}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{doctor.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="text-center mt-4">
                <Link to="/directory" className="text-sm font-medium text-violet-400 hover:text-violet-300">
                    View full directory &rarr;
                </Link>
            </div>
        </div>
    </>
  );
  
  const user = authContext?.user;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Welcome, <span className="text-violet-400">{user?.username}</span>
            {user?.role === RoleEnum.Pharmacist && user.pharmacyName && (
                <span className="text-2xl text-slate-400 font-normal"> from {user.pharmacyName}</span>
            )}
        </h1>
        <p className="text-slate-400 mb-8">Here's a summary of the system's activity.</p>
      {user?.role === 'Admin' ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
};

const TransactionList: React.FC<{ transactions: BlockchainRecord[] }> = ({ transactions }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Doctor</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Hash</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {transactions.slice(0, 5).map((tx) => (
            <tr key={tx.hash} className="hover:bg-slate-700/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tx.data.patientName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{tx.data.doctorName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-violet-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span title={tx.hash}>
                        {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 10)}
                    </span>
                    <CopyButton textToCopy={tx.hash} />
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);


export default DashboardPage;
