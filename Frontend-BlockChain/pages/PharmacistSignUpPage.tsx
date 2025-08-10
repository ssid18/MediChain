
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import Spinner from '../components/Spinner';
import type { PharmacistRegistrationData } from '../types';

// New type for the form data, extending the registration data with a UI-only field
type PharmacistSignUpFormData = PharmacistRegistrationData & {
    confirmPassword: string;
};

const PharmacistSignUpPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<PharmacistSignUpFormData>({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        pharmacyName: '',
        pharmacyLicenseNumber: '',
        governmentId: '',
        phoneNumber: '',
        email: '',
        physicalAddress: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validateField = (name: string, value: string): string => {
        if (!value) return 'This field is required.';
        switch (name) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address.';
            case 'phoneNumber':
                return /^\+91\d{10}$/.test(value) ? '' : 'Must be in +91XXXXXXXXXX format.';
            case 'pharmacyLicenseNumber':
                return /^\d{6,10}$/.test(value) ? '' : 'Must be 6-10 digits.';
            case 'governmentId':
                return /^(\d{12}|[A-Z]{5}[0-9]{4}[A-Z]{1})$/.test(value) ? '' : 'Invalid Aadhaar (12 digits) or PAN format.';
             case 'password':
                return value.length >= 6 ? '' : 'Password must be at least 6 characters.';
            case 'confirmPassword':
                return value === formData.password ? '' : 'Passwords do not match.';
            default:
                return '';
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        const newErrors: Record<string, string> = {};
        let hasErrors = false;
        (Object.keys(formData) as Array<keyof PharmacistSignUpFormData>).forEach(key => {
            const error = validateField(key, formData[key] as string);
            if (error) {
                newErrors[key] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registrationData } = formData;
            await authContext?.registerPharmacist(registrationData);
            alert('Signup successful! Please proceed to log in.');
            navigate('/auth');
        } catch (err: any) {
            setApiError(err.message || 'Verification failed. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillWithDemoData = () => {
        setFormData({
            username: 'pharma.demo',
            password: 'password123',
            confirmPassword: 'password123',
            fullName: 'Mr. Pharma Demo',
            pharmacyName: 'Demo Pharmacy',
            pharmacyLicenseNumber: '87654321',
            governmentId: '123456789012',
            phoneNumber: '+919123456789',
            email: 'pharma.demo@medichain.com',
            physicalAddress: '456 Demo Avenue, Pharma Town',
        });
        setErrors({});
    };

    const inputClass = (name: keyof typeof formData) => 
      `w-full bg-slate-700/50 border rounded-md py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm ` +
      (errors[name] ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-violet-500');

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700/50">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Pharmacist Verification</h1>
                <p className="text-slate-400">Please provide your professional details for verification.</p>
                <button type="button" onClick={fillWithDemoData} className="mt-2 text-xs text-violet-400 hover:text-violet-300">
                    (Click to fill with demo data for testing. Demo password is "password123")
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {apiError && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-md text-sm w-full">{apiError}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                  <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} className={inputClass('username')} required />
                  {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} className={inputClass('fullName')} required />
                  {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={inputClass('password')} required />
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>
                 <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={inputClass('confirmPassword')} required />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>

              <hr className="border-slate-700" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="pharmacyName" className="block text-sm font-medium text-slate-300 mb-1">Pharmacy Name</label>
                  <input type="text" name="pharmacyName" id="pharmacyName" value={formData.pharmacyName} onChange={handleChange} onBlur={handleBlur} className={inputClass('pharmacyName')} required />
                  {errors.pharmacyName && <p className="mt-1 text-xs text-red-400">{errors.pharmacyName}</p>}
                </div>
                 <div>
                  <label htmlFor="pharmacyLicenseNumber" className="block text-sm font-medium text-slate-300 mb-1">Pharmacy License No.</label>
                  <input type="text" name="pharmacyLicenseNumber" id="pharmacyLicenseNumber" placeholder="e.g., 12345678" value={formData.pharmacyLicenseNumber} onChange={handleChange} onBlur={handleBlur} className={inputClass('pharmacyLicenseNumber')} required />
                  {errors.pharmacyLicenseNumber && <p className="mt-1 text-xs text-red-400">{errors.pharmacyLicenseNumber}</p>}
                </div>
                 <div>
                  <label htmlFor="governmentId" className="block text-sm font-medium text-slate-300 mb-1">Government ID (Aadhaar/PAN)</label>
                  <input type="text" name="governmentId" id="governmentId" value={formData.governmentId} onChange={handleChange} onBlur={handleBlur} className={inputClass('governmentId')} required />
                   {errors.governmentId && <p className="mt-1 text-xs text-red-400">{errors.governmentId}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={inputClass('email')} required />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
                 <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input type="tel" name="phoneNumber" id="phoneNumber" placeholder="+919876543210" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur} className={inputClass('phoneNumber')} required />
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>}
                </div>
              </div>
              <div>
                  <label htmlFor="physicalAddress" className="block text-sm font-medium text-slate-300 mb-1">Physical Address</label>
                  <textarea name="physicalAddress" id="physicalAddress" rows={3} value={formData.physicalAddress} onChange={handleChange} onBlur={handleBlur} className={inputClass('physicalAddress')} required />
                  {errors.physicalAddress && <p className="mt-1 text-xs text-red-400">{errors.physicalAddress}</p>}
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all">
                  {loading ? <Spinner size="sm" text="Verifying details..."/> : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
    );
};

export default PharmacistSignUpPage;