

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
    APP_NAME, 
    APP_NAME_SUB, 
    ShieldCheckIcon, 
    CpuChipIcon, 
    CubeTransparentIcon, 
    ChevronRightIcon,
    UserIcon,
    BuildingStorefrontIcon,
    PencilIcon,
    CheckBadgeIcon,
    LockClosedIcon,
    DirectoryIcon,
    WifiSlashIcon,
    AcademicCapIcon,
    GlobeAltIcon,
    GenerateIcon,
    CloudUploadIcon,
    VerifyIcon,
} from '../constants';

const HeroCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; }> = ({ icon, title, subtitle }) => (
    <div className={`flex-shrink-0 flex items-center gap-4 p-4 mx-auto rounded-xl shadow-lg bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 w-64 h-28`}>
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-900/50 rounded-lg">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-white text-sm whitespace-nowrap">{title}</h4>
            <p className="text-slate-400 text-xs">{subtitle}</p>
        </div>
    </div>
);

const PillarCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="group h-64 [perspective:1000px]">
        <div className="flip-card-inner relative h-full w-full rounded-xl shadow-xl">
            <div className="flip-card-front absolute flex flex-col items-center justify-center h-full w-full rounded-xl bg-slate-800 p-6 border border-slate-700/80">
                <div className="p-3 bg-slate-700 rounded-full mb-4">
                    {icon}
                </div>
                <h3 className="mt-2 text-xl font-bold text-white text-center">{title}</h3>
            </div>
            <div className="flip-card-back absolute flex flex-col items-center justify-center h-full w-full rounded-xl bg-violet-800 p-6 border border-violet-700 text-center">
                <p className="text-slate-200">{description}</p>
            </div>
        </div>
    </div>
);

const InteractiveHowItWorks: React.FC = () => {
    const steps = [
        { id: 'upload', title: 'Upload or Generate', description: 'Doctors can digitally author prescriptions directly on the platform, ensuring clarity and precision from the start. Pharmacists can effortlessly upload a photo of a physical prescription, which is immediately prepared for analysis.', icon: <CloudUploadIcon className="h-24 w-24 text-violet-400" /> },
        { id: 'analyze', title: 'AI Analysis & Hashing', description: 'Our powerful AI engine scans the document, intelligently extracting key data like patient name, medicines, and dosages—even from complex handwriting. This verified data is then cryptographically converted into a unique, tamper-proof SHA-256 hash.', icon: <CpuChipIcon className="h-24 w-24 text-violet-400" /> },
        { id: 'record', title: 'Record on Blockchain', description: 'The secure hash is permanently recorded on the MediChain ledger. This entry, which includes a timestamp and the uploader\'s verified ID, creates an unchangeable, auditable record of the prescription\'s authenticity.', icon: <CubeTransparentIcon className="h-24 w-24 text-violet-400" /> },
        { id: 'verify', title: 'Verify Anywhere, Instantly', description: 'With the prescription\'s unique hash, any authorized user can instantly confirm its validity from any connected device. This simple lookup queries the blockchain, providing immediate assurance that the prescription is legitimate and unaltered.', icon: <VerifyIcon className="h-24 w-24 text-violet-400" /> },
    ];

    const [activeStep, setActiveStep] = useState(steps[0].id);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const stepId = entry.target.getAttribute('data-step-id');
                        if (stepId) {
                            setActiveStep(stepId);
                        }
                    }
                });
            },
            {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0,
            }
        );

        const currentRefs = stepRefs.current;
        currentRefs.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            currentRefs.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    return (
        <section id="how-it-works" className="py-24 bg-slate-900/70">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Secure, Seamless</h2>
                    <p className="max-w-2xl mx-auto text-slate-400 mb-20">
                        Our streamlined process ensures every prescription is authentic and accounted for.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-16">
                    <div className="md:w-1/2 sticky-panel">
                        <div className="relative w-64 h-64 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center">
                             {steps.map(step => (
                                <div key={step.id} className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${activeStep === step.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                                    {step.icon}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                ref={el => { stepRefs.current[index] = el; }}
                                data-step-id={step.id}
                                className="min-h-[60vh] flex flex-col justify-center py-12"
                            >
                                <p className="text-violet-400 font-semibold mb-2">Step {index + 1}</p>
                                <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Toast: React.FC<{ message: string; show: boolean; onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);
    if (!show) return null;
    return (
        <div className="w-full bg-violet-700 text-white px-6 py-3 border-b border-violet-400 flex items-center justify-center gap-3 animate-fade-in">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4 text-violet-200 hover:text-white focus:outline-none">✕</button>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    const allHeroCards = [
        { icon: <UserIcon className="w-6 h-6 text-violet-400"/>, title: 'Verified Doctor', subtitle: 'Dr. Priya Sharma' },
        { icon: <BuildingStorefrontIcon className="w-6 h-6 text-violet-400"/>, title: 'Secure Pharmacy', subtitle: 'Community Health' },
        { icon: <PencilIcon className="w-6 h-6 text-violet-400"/>, title: 'Digital Prescription', subtitle: 'Paracetamol 500mg' },
        { icon: <CheckBadgeIcon className="w-6 h-6 text-violet-400"/>, title: 'AI Validation', subtitle: 'Accuracy: 99.8%' },
        { icon: <ShieldCheckIcon className="w-6 h-6 text-violet-400"/>, title: 'End-to-End Security', subtitle: 'Role-based access' },
        { icon: <CubeTransparentIcon className="w-6 h-6 text-violet-400"/>, title: 'Immutable Ledger', subtitle: 'Tamper-proof records' },
        { icon: <CpuChipIcon className="w-6 h-6 text-violet-400"/>, title: 'Advanced OCR', subtitle: 'Reads handwriting' },
        { icon: <LockClosedIcon className="w-6 h-6 text-violet-400"/>, title: 'Data Privacy', subtitle: 'Secure by design' },
    ];

    const [carouselAngle, setCarouselAngle] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isHovered) {
            autoRotateRef.current = setInterval(() => {
                setCarouselAngle((prev) => prev + 0.3);
            }, 16);
        } else if (autoRotateRef.current) {
            clearInterval(autoRotateRef.current);
        }
        return () => {
            if (autoRotateRef.current) clearInterval(autoRotateRef.current);
        };
    }, [isHovered]);

    const handleCarouselMouseEnter = () => setIsHovered(true);
    const handleCarouselMouseLeave = () => setIsHovered(false);

    const handleCardClick = (card: typeof allHeroCards[number]) => {
        if (!authContext?.user) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setToast({ show: true, message: 'Please sign up or log in to access this feature!' });
            setTimeout(() => navigate('/auth'), 3000);
        } else {
            alert(`Selected: ${card.title} - You can now access this feature!`);
        }
    };

    const featureScrollerItems = [
        { icon: <CpuChipIcon className="w-5 h-5 text-violet-400"/>, text: "AI-Powered Extraction" },
        { icon: <CubeTransparentIcon className="w-5 h-5 text-violet-400"/>, text: "Immutable Blockchain" },
        { icon: <ShieldCheckIcon className="w-5 h-5 text-violet-400"/>, text: "Instant Verification" },
        { icon: <LockClosedIcon className="w-5 h-5 text-violet-400"/>, text: "Secure & Compliant" },
        { icon: <DirectoryIcon className="w-5 h-5 text-violet-400"/>, text: "Role-Based Access" },
        { icon: <GenerateIcon className="w-5 h-5 text-violet-400"/>, text: "Digital Generation" },
        { icon: <WifiSlashIcon className="w-5 h-5 text-violet-400"/>, text: "Offline Capable" },
    ];
    
    const pillars = [
        { icon: <AcademicCapIcon className="h-10 w-10 text-violet-300"/>, title: 'AI Precision', description: 'Leverage state-of-the-art AI to accurately extract and structure data from any prescription, handwritten or digital.'},
        { icon: <CubeTransparentIcon className="h-10 w-10 text-violet-300"/>, title: 'Blockchain Immutability', description: 'Every verified prescription is hashed and recorded on a tamper-proof ledger, ensuring ultimate data integrity.'},
        { icon: <ShieldCheckIcon className="h-10 w-10 text-violet-300"/>, title: 'End-to-End Security', description: 'With role-based access and digital signatures, our platform is built to be secure from upload to verification.'},
        { icon: <GlobeAltIcon className="h-10 w-10 text-violet-300"/>, title: 'Universal Access', description: 'A responsive, lightweight interface ensures MediChain works on any device, anywhere, even with low connectivity.'},
    ];

    return (
        <div className="animate-fade-in w-full">
            {toast.show && (
                <div className="fixed top-0 left-0 right-0 bg-violet-700 text-white px-6 py-3 border-b border-violet-400 flex items-center justify-center gap-3 animate-fade-in z-[60]">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="font-semibold">{toast.message}</span>
                    <button onClick={() => setToast({ show: false, message: '' })} className="ml-4 text-violet-200 hover:text-white focus:outline-none">✕</button>
                </div>
            )}
            
            <section id="hero" className="relative pt-24 pb-20 overflow-hidden hero-gradient">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-4">
                            The Future of Prescription Security
                        </h1>
                        <p className="mx-auto text-lg md:text-xl text-slate-300 mb-8">
                            {APP_NAME} leverages cutting-edge AI and an immutable blockchain ledger to eliminate fraud, enhance patient safety, and bring trust to healthcare.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                             {authContext?.user ? (
                                <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-lg hover:bg-violet-700 transition-colors text-base">
                                    Go to Your Dashboard
                                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                                </Link>
                             ) : (
                                <>
                                    <Link to="/pharmacist-signup" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-violet-600 border border-transparent rounded-md shadow-lg hover:bg-violet-700 transition-colors text-base">
                                        Pharmacist Sign Up
                                        <ChevronRightIcon className="w-5 h-5 ml-2" />
                                    </Link>
                                    <Link to="/auth" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-medium text-violet-300 bg-slate-800/50 border border-slate-700 rounded-md shadow-lg hover:bg-slate-800 transition-colors text-base">
                                        Doctor Sign Up / Login
                                    </Link>
                                </>
                             )}
                        </div>
                    </div>

                    <div className="mt-12 carousel-container">
                        <div className="scene"
                            onMouseEnter={handleCarouselMouseEnter}
                            onMouseLeave={handleCarouselMouseLeave}
                        >
                            <div className="carousel" style={{ transform: `rotateY(${carouselAngle}deg)` }}>
                                {allHeroCards.map((card, index) => {
                                    const angle = index * (360 / allHeroCards.length);
                                    const radius = 330; 
                                    const style = {
                                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                                    };
                                    return (
                                        <div
                                            className="carousel-card"
                                            style={style}
                                            key={index}
                                            tabIndex={0}
                                            role="button"
                                            onClick={() => handleCardClick(card)}
                                            onFocus={handleCarouselMouseEnter}
                                            onBlur={handleCarouselMouseLeave}
                                        >
                                            <div>
                                                <HeroCard {...card} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => window.scrollTo({ top: window.scrollY + 800, behavior: 'smooth' })}
                            className="w-16 h-16 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg border-4 border-violet-300 transition-all hover:scale-105 hover:shadow-xl"
                            title="Scroll down to see more content"
                        >
                            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                                <path d="M16 4V28M16 28L8 20M16 28L24 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
            
            <section id="features" className="py-20 bg-slate-900">
                <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <div className="flex w-max animate-scroll">
                        {[...featureScrollerItems, ...featureScrollerItems].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 px-8 py-4 mx-4 bg-slate-800/50 rounded-lg border border-slate-700/50 flex-shrink-0">
                                {item.icon}
                                <span className="text-white font-medium whitespace-nowrap">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <InteractiveHowItWorks />
            
            <section id="technology" className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Technology at the Core</h2>
                        <p className="max-w-2xl mx-auto text-slate-400 mb-16">
                            MediChain is built on four pillars of innovation to deliver a truly modern solution.
                        </p>
                    </div>
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pillars.map(pillar => <PillarCard key={pillar.title} {...pillar} />)}
                    </div>
                </div>
            </section>

            <footer className="bg-slate-900/80 border-t border-slate-700/50">
                <div className="container mx-auto px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-6 md:mb-0">
                             <div className="h-8 w-8">
                                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="6" y="5" width="4" height="14" rx="2" className="text-violet-500" fill="currentColor"/>
                                    <rect x="14" y="5" width="4" height="14" rx="2" className="text-violet-500/70" fill="currentColor"/>
                                </svg>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xl font-bold text-white tracking-tight leading-tight">{APP_NAME}</span>
                                <span className="text-sm font-bold text-slate-400 tracking-tight leading-tight">{APP_NAME_SUB}</span>
                             </div>
                        </div>
                        <div className="text-sm text-slate-500">
                             © {new Date().getFullYear()} MediChain. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;