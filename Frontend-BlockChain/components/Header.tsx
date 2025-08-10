import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
    APP_NAME, 
    LogoIcon, 
    UploadIcon, 
    VerifyIcon, 
    GenerateIcon, 
    DirectoryIcon, 
    DashboardIcon, 
    LogoutIcon,
    AdminIcon,
    ChevronDownIcon
} from '../constants';
import { Role as RoleEnum } from '../types';
import SyncStatusIndicator from './SyncStatusIndicator';

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    if (authContext) {
      authContext.logout();
      setMenuOpen(false);
      navigate('/auth');
    }
  };
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
             const targetElement = document.querySelector(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-white'
        : 'text-slate-400 hover:text-white'
    }`;

  const appNavLinks = [
    { to: "/upload", text: "Upload & Verify", icon: <UploadIcon className="h-5 w-5 mr-2" />, roles: [RoleEnum.Doctor, RoleEnum.Pharmacist, RoleEnum.Admin]},
    { to: "/generate", text: "Generate Prescription", icon: <GenerateIcon className="h-5 w-5 mr-2" />, roles: [RoleEnum.Doctor]},
    { to: "/verify", text: "Verify Hash", icon: <VerifyIcon className="h-5 w-5 mr-2" />, roles: [RoleEnum.Pharmacist, RoleEnum.Admin]},
    { to: "/directory", text: "Doctor Directory", icon: <DirectoryIcon className="h-5 w-5 mr-2" />, roles: [RoleEnum.Doctor, RoleEnum.Pharmacist, RoleEnum.Admin]},
  ];

  const landingNavLinks = [
    { href: "#features", text: "Features" },
    { href: "#how-it-works", text: "How It Works" },
    { href: "#technology", text: "Technology" },
  ];

  const filteredAppNavLinks = authContext?.user ? appNavLinks.filter(link => link.roles.includes(authContext.user!.role)) : [];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl shadow-violet-500/5 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <LogoIcon className="h-9 w-9"/>
            <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700/80">
            {authContext?.user ? (
                filteredAppNavLinks.map(link => (
                    <NavLink key={link.to} to={link.to} className={getNavLinkClass}>
                     {link.text}
                    </NavLink>
                ))
            ) : (
                landingNavLinks.map(link => (
                    <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        {link.text}
                    </a>
                ))
            )}
          </nav>
          

          <div className="flex items-center gap-3">
            {authContext?.user && <SyncStatusIndicator />}
            {!authContext?.user ? (
              <>
                <Link to="/auth" className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/auth" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity">
                  Sign Up
                </Link>
              </>
            ) : (
                <>
                    <Link to="/dashboard" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity">
                        Go to Dashboard
                    </Link>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center font-bold text-white text-lg">
                                {authContext.user.username.charAt(0).toUpperCase()}
                            </div>
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-slate-800/80 backdrop-blur-lg border border-slate-700 shadow-2xl focus:outline-none animate-fade-in" style={{animationDuration: '150ms'}}>
                                <div className="p-2">
                                    <div className="px-3 py-2 mb-2 border-b border-slate-700">
                                        <p className="text-sm font-semibold text-white truncate">{authContext.user.username}</p>
                                        <p className="text-xs text-slate-400">{authContext.user.role}</p>
                                    </div>
                                    <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={({isActive}) => `flex items-center w-full px-3 py-2 text-sm rounded-md ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300'} hover:bg-slate-700 hover:text-white`}>
                                        <DashboardIcon className="h-5 w-5 mr-3"/> Dashboard
                                    </NavLink>
                                    {authContext.user.role === RoleEnum.Admin && (
                                        <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({isActive}) => `flex items-center w-full px-3 py-2 text-sm rounded-md ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300'} hover:bg-slate-700 hover:text-white`}>
                                            <AdminIcon className="h-5 w-5 mr-3"/> Admin Panel
                                        </NavLink>
                                    )}
                                    <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                                        <LogoutIcon className="h-5 w-5 mr-3"/> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;