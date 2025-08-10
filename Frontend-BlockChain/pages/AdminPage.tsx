import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Role as RoleEnum } from '../types';
import { mockBlockchainService } from '../services/mockBlockchainService';
import type { BlockchainRecord } from '../types';

// Mock data as per requirements
const initialMockUsers: (User & { status: 'active' | 'inactive' })[] = [
    { id: 'doc1', username: 'dr.anil', fullName: 'Dr. Anil Kapoor', role: RoleEnum.Doctor, status: 'active' },
    { id: 'pharm1', username: 'pharma.one', fullName: 'Wellness Pharmacy', role: RoleEnum.Pharmacist, status: 'active' },
    { id: 'doc2', username: 'dr.priya', fullName: 'Dr. Priya Sharma', role: RoleEnum.Doctor, status: 'inactive' },
    { id: 'pharm2', username: 'medplus', fullName: 'MedPlus', role: RoleEnum.Pharmacist, status: 'active' },
    { id: 'doc3', username: 'dr.sanjay', fullName: 'Dr. Sanjay Gupta', role: RoleEnum.Doctor, status: 'active' },
];

const ADMIN_KEY = 'yoursecretkey'; // As per requirements

const AdminPage: React.FC = () => {
    const [accessKey, setAccessKey] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [keyError, setKeyError] = useState('');

    const [users, setUsers] = useState(initialMockUsers);
    const [prescriptionLogs, setPrescriptionLogs] = useState<BlockchainRecord[]>([]);
    const [syncStatus, setSyncStatus] = useState<'Offline: Queued' | 'Syncing...' | 'Online'>('Online');

    // New user form state
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<RoleEnum>(RoleEnum.Doctor);

    useEffect(() => {
        if(isUnlocked) {
            setPrescriptionLogs(mockBlockchainService.getAllTransactions().slice(0, 5));
        }
    }, [isUnlocked]);
    
    // --- Handlers ---
    const handleKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessKey === ADMIN_KEY) {
            setIsUnlocked(true);
            setKeyError('');
        } else {
            setKeyError('Invalid key. Access denied.');
        }
    };
    
    const toggleUserStatus = (userId: string) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
        alert('Status updated for user ' + userId);
    };
    
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName) return;
        const newUser: User & { status: 'active' | 'inactive' } = {
            id: `new-${Date.now()}`,
            username: newUserName,
            fullName: newUserName,
            role: newUserRole,
            status: 'active',
        };
        setUsers([...users, newUser]);
        setNewUserName('');
    };

    const toggleSyncStatus = () => {
        const statuses: ('Offline: Queued' | 'Syncing...' | 'Online')[] = ['Online', 'Offline: Queued', 'Syncing...'];
        const currentIndex = statuses.indexOf(syncStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        setSyncStatus(statuses[nextIndex]);
    };
    
    if (!isUnlocked) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700/50 w-full">
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-slate-400 mb-6">Please enter the key to access the panel.</p>
                    <form onSubmit={handleKeySubmit} className="space-y-4">
                        <input
                            type="password"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            placeholder="Enter access key..."
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        {keyError && <p className="text-red-400 text-sm">{keyError}</p>}
                        <button type="submit" className="w-full py-3 rounded-md bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 md:px-8 py-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400 mb-8">System overview and management tools.</p>
            <div className="p-4 mb-8 bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm">
                <strong>Note for Judges:</strong> This is a frontend-only mock implementation. User and log data are stored in local state. In Round 2, this will be integrated with a backend (e.g., MongoDB Atlas for users, Polygon Mumbai Testnet for hashes).
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: User & Prescription Tables */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User Management */}
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
                        {/* This comment explains future backend integration for this specific feature */}
                        {/* TODO: Fetch users from a dedicated user management API endpoint */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400 font-mono">{user.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{user.fullName || user.username}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{user.role}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100/10 text-green-300' : 'bg-red-100/10 text-red-300'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <button onClick={() => toggleUserStatus(user.id)} className="text-violet-400 hover:text-violet-300 text-xs">Toggle Status</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Prescription Logs */}
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white mb-4">Prescription Logs</h2>
                        {/* TODO: Fetch real-time logs from the blockchain indexer or database */}
                        <div className="overflow-x-auto">
                           <table className="min-w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Doctor</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Prescription ID (Hash)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {prescriptionLogs.map(log => (
                                        <tr key={log.hash}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{log.data.doctorName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-violet-400 font-mono" title={log.hash}>{log.hash.substring(0, 20)}...</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Sidebar: Add User & System Status */}
                <div className="space-y-8">
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
                        <h3 className="text-xl font-bold text-white mb-4">Add New Mock User</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label htmlFor="newUserName" className="block text-sm font-medium text-slate-300 mb-1">User Name</label>
                                <input type="text" id="newUserName" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-violet-500 sm:text-sm" placeholder="e.g., dr.newbie" />
                            </div>
                            <div>
                                <label htmlFor="newUserRole" className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                <select id="newUserRole" value={newUserRole} onChange={e => setNewUserRole(e.target.value as RoleEnum)} className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-violet-500 sm:text-sm">
                                    <option value={RoleEnum.Doctor}>Doctor</option>
                                    <option value={RoleEnum.Pharmacist}>Pharmacist</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2 rounded-md bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors">Add User</button>
                        </form>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700/50">
                        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Sync Status:</span>
                                <span className="font-semibold text-white">{syncStatus}</span>
                            </div>
                            <button onClick={toggleSyncStatus} className="w-full text-sm py-2 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-700">Toggle Sync Status</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
