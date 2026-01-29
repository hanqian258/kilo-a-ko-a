import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { YUMIN_LOGO_URL } from '../../constants';
import { Button } from '../Button';
import { Mail, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../../utils/firebase';

interface LoginViewProps {
  onLogin: (user: User) => void;
  theme: 'light' | 'dark';
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Default to DONOR role
    const newUser: User = { id: Date.now().toString(), name: name || email.split('@')[0], email, role: UserRole.DONOR };
    onLogin(newUser);
  };

  const handleSocialLogin = async (provider: string) => {
    setIsSocialLoading(provider);
    try {
      let firebaseUser;
      if (provider === 'Google') {
        firebaseUser = await signInWithGoogle();
      }

      if (firebaseUser) {
        const newUser: User = {
           id: firebaseUser.uid,
           name: firebaseUser.displayName || 'User',
           email: firebaseUser.email || '',
           role: UserRole.DONOR
        };
        onLogin(newUser);
      }
    } catch (error) {
       console.error("Login failed", error);
    } finally {
       setIsSocialLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className={`p-12 rounded-[3rem] shadow-2xl border w-full max-w-md relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-center items-center gap-3 mb-10">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-xl">
              <img src={YUMIN_LOGO_URL} alt="Yumin Edu Logo" className="w-full h-full object-contain p-1" />
           </div>
           <div className="h-12 px-2 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl">
             <img src="/logo.webp" alt="Reef Teach Logo" className="h-8 w-auto object-contain" />
           </div>
        </div>

        <div className="text-center mb-10">
          <h2 className={`text-4xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>Kilo a Ko'a</h2>
          <div className={`flex justify-center mt-6 p-1 rounded-2xl w-fit mx-auto ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <button onClick={() => setIsSignUp(false)} className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${!isSignUp ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500'}`}>Log In</button>
            <button onClick={() => setIsSignUp(true)} className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isSignUp ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500'}`}>Sign Up</button>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={() => handleSocialLogin('Google')} className={`w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDark ? 'border-white/5 bg-white/5 text-white hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`} disabled={!!isSocialLoading}>
             {isSocialLoading === 'Google' ? (
               <Loader2 className="animate-spin w-5 h-5" />
             ) : (
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
             )}
            Continue with Google
          </button>
        </div>

        <div className="relative my-8 text-center">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'opacity-10' : 'opacity-100'}`}><div className="w-full border-t border-slate-200"></div></div>
          <span className={`relative px-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-[#0c1218] text-slate-600' : 'bg-white text-slate-400'}`}>or use credentials</span>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-6">
          {isSignUp && (
            <input type="text" placeholder="Full Name" className={`w-full p-4 rounded-xl border-2 transition-all font-bold text-base focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-white/5 border-transparent text-white placeholder:text-slate-700' : 'bg-slate-50 border-transparent text-slate-900 focus:bg-white'}`} value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email Address" className={`w-full p-4 rounded-xl border-2 transition-all font-bold text-base focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-white/5 border-transparent text-white placeholder:text-slate-700' : 'bg-slate-50 border-transparent text-slate-900 focus:bg-white'}`} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};