
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
import { Shield, Sparkles, AlertCircle, Terminal, User as UserIcon } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [showDevLogin, setShowDevLogin] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.targetRole) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [user, navigate]);

  // Helper to decode the Google JWT (if real)
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const processUserAndRedirect = (userData: any) => {
    // Check if user already has saved preferences in local storage
    const existingRaw = localStorage.getItem('user');
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing.email === userData.email) {
        const merged = { ...existing, ...userData };
        login(merged);
        if (merged.targetRole) {
          navigate('/dashboard');
          return;
        }
      }
    }

    login(userData);
    navigate('/profile-setup');
  };

  const handleCredentialResponse = (response: any) => {
    const payload = decodeJwt(response.credential);
    if (!payload) {
      // If payload is null (like in the demo bypass), we use a high-quality mock
      const demoUser = {
        name: 'Demo Student',
        email: 'student@university.edu',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
        targetRole: '',
        skills: [],
        graduationYear: '2025',
        currentLevel: 'Beginner' as const
      };
      processUserAndRedirect(demoUser);
    } else {
      const googleUser = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        targetRole: '',
        skills: [],
        graduationYear: '2025',
        currentLevel: 'Beginner' as const
      };
      processUserAndRedirect(googleUser);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            // Note: This ID is a placeholder. Real OAuth requires a client_id registered for your domain.
            client_id: '1065445353526-mrtre7f9o0p6p0v0p0p0p0p0p0p0p0.apps.googleusercontent.com',
            callback: handleCredentialResponse,
          });

          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
            });
          }
        } catch (err) {
          console.warn('Google Sign-In initialization failed (likely due to invalid Client ID).');
        }
      }
    };

    const checkInterval = setInterval(() => {
      if (window.google) {
        initializeGoogleSignIn();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6 transition-colors duration-500">
      <div className="max-w-md w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        <div className="relative inline-block">
          <img src="/logo.png" alt="Synapse Logo" className="w-24 h-24 object-contain shadow-2xl shadow-brand-500/40 relative z-10 rounded-[2rem]" />
          <div className="absolute -inset-4 bg-brand-500 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse"></div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black dark:text-white tracking-tighter sm:text-5xl">Synapse</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-tight">
            The intelligent engine for your career takeoff.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="w-full">
                <button
                  onClick={() => login()}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or Instant Access</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-slate-800"></div>
              </div>

              <button
                onClick={() => handleCredentialResponse({ credential: null })}
                className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 active:scale-95"
              >
                <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
                Continue as Guest
              </button>
            </div>

            <div className="p-5 bg-white dark:bg-slate-950 rounded-2xl border dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <AlertCircle size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Auth Note</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Real Google Login requires a domain-verified Client ID. For this MVP, use the <b>Guest Access</b> to test all features immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Shield size={20} />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Verified</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Sparkles size={20} />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">AI Ready</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <UserIcon size={20} />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Personal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
