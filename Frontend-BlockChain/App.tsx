
import React, { useState, useMemo, createContext, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { User, Role, PharmacistRegistrationData, DoctorRegistrationData } from './types';
import { authService } from './services/authService';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import VerifyPage from './pages/VerifyPage';
import GeneratePrescriptionPage from './pages/GeneratePrescriptionPage';
import DoctorDirectoryPage from './pages/DoctorDirectoryPage';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import Spinner from './components/Spinner';
import { Role as RoleEnum } from './types';
import ProtectedRoute from './components/ProtectedRoute';
import PharmacistSignUpPage from './pages/PharmacistSignUpPage';
import DoctorSignUpPage from './pages/DoctorSignUpPage';
import AdminPage from './pages/AdminPage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  registerDoctor: (data: DoctorRegistrationData) => Promise<void>;
  registerPharmacist: (data: PharmacistRegistrationData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/auth' || location.pathname === '/pharmacist-signup' || location.pathname === '/doctor-signup';
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return <Spinner text="Initializing auth..."/>
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className={`flex-grow flex px-4 pt-28 pb-8 ${isAuthPage ? 'items-center justify-center' : ''}`}>
                <Routes>
                    {!authContext.user ? (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/pharmacist-signup" element={<PharmacistSignUpPage />} />
                            <Route path="/doctor-signup" element={<DoctorSignUpPage />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/dashboard" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Doctor, RoleEnum.Pharmacist, RoleEnum.Admin]}>
                                    <DashboardPage />
                                </ProtectedRoute>
                            } />
                            
                            <Route path="/upload" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Doctor, RoleEnum.Pharmacist, RoleEnum.Admin]}>
                                    <UploadPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/verify" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Pharmacist, RoleEnum.Admin]}>
                                    <VerifyPage />
                                </ProtectedRoute>
                            } />
                            
                            <Route path="/generate" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Doctor]}>
                                    <GeneratePrescriptionPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/directory" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Doctor, RoleEnum.Pharmacist, RoleEnum.Admin]}>
                                    <DoctorDirectoryPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/admin" element={
                                <ProtectedRoute allowedRoles={[RoleEnum.Admin]}>
                                    <AdminPage />
                                </ProtectedRoute>
                            } />
                            
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </>
                    )}
                </Routes>
            </main>
        </div>
    );
}


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    login: async (username: string, password: string) => {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
    },
    registerDoctor: async (data: DoctorRegistrationData) => {
        await authService.registerDoctor(data);
    },
    registerPharmacist: async (data: PharmacistRegistrationData) => {
        await authService.registerPharmacist(data);
    },
    logout: () => {
      authService.logout();
      setUser(null);
    }
  }), [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Spinner text="Loading App..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;