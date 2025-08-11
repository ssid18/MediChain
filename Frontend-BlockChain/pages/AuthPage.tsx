
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Spinner from '../components/Spinner';
import { ShieldCheckIcon, BuildingStorefrontIcon } from '../constants';

const SignInForm: React.FC<{onForgot: () => void}> = ({onForgot}) => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await authContext?.login(username, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="w-full h-full px-12 flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Sign In</h1>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-md text-sm w-full">{error}</div>}
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <a href="#" onClick={(e) => { e.preventDefault(); onForgot(); }} className="text-sm text-slate-400 hover:text-violet-300 transition-colors">Forgot your password?</a>
            <button type="submit" disabled={loading} className="w-full max-w-xs py-3 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider hover:bg-violet-700 transition-colors disabled:bg-slate-500 flex justify-center">
                {loading ? <Spinner size="sm"/> : "Sign In"}
            </button>
        </form>
    );
};

const DoctorSignUpPrompt: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full px-12 flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Doctor Registration</h1>
            <ShieldCheckIcon className="w-16 h-16 text-violet-400 my-4" />
            <p className="text-slate-300">
                Doctor registration requires professional verification. Please proceed to our secure registration portal.
            </p>
            <button
                onClick={() => navigate('/doctor-signup')}
                className="w-full max-w-xs py-3 mt-2 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider hover:bg-violet-700 transition-colors"
            >
                Proceed to Registration
            </button>
        </div>
    );
};

const PharmacistSignUpPrompt: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full px-12 flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Pharmacist Registration</h1>
            <BuildingStorefrontIcon className="w-16 h-16 text-violet-400 my-4" />
            <p className="text-slate-300">
                Pharmacist registration requires professional verification. Please proceed to our secure registration portal.
            </p>
            <button
                onClick={() => navigate('/pharmacist-signup')}
                className="w-full max-w-xs py-3 mt-2 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider hover:bg-violet-700 transition-colors"
            >
                Proceed to Registration
            </button>
        </div>
    );
};

const GhostButton: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} className={`px-10 py-2 rounded-full bg-transparent border-2 border-white text-white font-bold uppercase tracking-wider transition-transform hover:scale-105 focus:outline-none`}>
      {children}
    </button>
);
  
const AuthPage: React.FC = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [role, setRole] = useState<'doctor' | 'pharmacist'>('doctor');
  
    const getRoleButtonClass = (buttonRole: 'doctor' | 'pharmacist') => 
        `px-8 py-3 text-sm font-bold uppercase rounded-full transition-all duration-300 focus:outline-none ${
        role === buttonRole 
        ? 'bg-violet-600 text-white shadow-lg' 
        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
        }`;

    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="bg-slate-800/50 border border-slate-700/50 p-2 rounded-full flex gap-2">
            <button onClick={() => setRole('doctor')} className={getRoleButtonClass('doctor')}>Doctor</button>
            <button onClick={() => setRole('pharmacist')} className={getRoleButtonClass('pharmacist')}>Pharmacist</button>
        </div>

        <div className={`auth-container w-full h-[650px] rounded-3xl shadow-2xl bg-slate-800 relative z-30 ${isSignUpActive ? 'right-panel-active' : ''}`}>
            <div className="form-container sign-up-container">
                {role === 'doctor' ? <DoctorSignUpPrompt /> : <PharmacistSignUpPrompt />}
            </div>
            <div className="form-container sign-in-container">
                <SignInForm onForgot={() => alert('Password recovery feature coming soon!')} />
            </div>
            <div className="overlay-container">
                <div className="overlay">
                <div className="overlay-panel overlay-left">
                    <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
                    <p className="text-md text-slate-200 mt-4 mb-6 px-4">To stay connected, please login with your personal info</p>
                    <GhostButton onClick={() => setIsSignUpActive(false)}>
                    Sign In
                    </GhostButton>
                </div>
                <div className="overlay-panel overlay-right">
                    {role === 'doctor' ? (
                        <>
                            <h1 className="text-3xl font-bold text-white">Hello, Doctor!</h1>
                            <p className="text-md text-slate-200 mt-4 mb-6 px-4">New here? Register to get verified and start.</p>
                            <GhostButton onClick={() => setIsSignUpActive(true)}>
                            Register
                            </GhostButton>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-white">Hello, Pharmacist!</h1>
                            <p className="text-md text-slate-200 mt-4 mb-6 px-4">New here? Register your pharmacy to get started.</p>
                            <GhostButton onClick={() => setIsSignUpActive(true)}>
                                Register
                            </GhostButton>
                        </>
                    )}
                </div>
                </div>
            </div>
        </div>

        <div className="w-full p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="font-bold text-white mb-3 text-base">For Demo Purposes</h3>
            <ul className="space-y-2 list-disc list-inside">
                <li>
                    If you are a <strong className="text-violet-300">Doctor</strong>, select the "Doctor" toggle and proceed to registration. Use a valid license format (e.g., a 6-10 digit number) and Government ID (Aadhaar/PAN format).
                </li>
                <li>
                    If you are a <strong className="text-violet-300">Pharmacist</strong>, select the "Pharmacist" toggle. You must register via the dedicated page to get verified. Once registered, you can sign in here.
                </li>
                <li>You can use any username and password. After registration, use the same credentials to log in.</li>
            </ul>
        </div>
      </div>
    );
  };
  
  export default AuthPage;