import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { YUMIN_LOGO_URL } from '../../constants';
import { Button } from '../Button';
import { Chrome, Apple, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { loadUser } from '../../utils/storage';

interface LoginViewProps {
  onLogin: (user: User) => void;
  theme: 'light' | 'dark';
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Manual login is kept as a fallback/demo (mock implementation)
    // In a full Firebase app, we would use signInWithEmailAndPassword
    const newUser: User = {
      id: Date.now().toString(),
      name: name || email.split('@')[0],
      email,
      role: UserRole.DONOR
    };
    onLogin(newUser);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check for existing local profile to preserve role if available
      const localUser = loadUser();

      let finalUser: User;

      // If we have a local user and the ID matches (or we trust the local session for this device)
      // Note: Firebase UID is the source of truth for ID.
      // If the local user ID matches the firebase ID, we keep the local data (Role).
      if (localUser && localUser.id === firebaseUser.uid) {
         finalUser = localUser;
      } else {
         // Create new user or overwrite with default role (DONOR)
         // We do not check Firestore as per instructions.
         finalUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Marine Steward',
            email: firebaseUser.email || '',
            role: UserRole.DONOR,
            avatarUrl: firebaseUser.photoURL || undefined
         };
      }

      onLogin(finalUser);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    alert("Apple Sign In coming soon!");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className={`p-12 rounded-[3rem] shadow-2xl border w-full max-w-md relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-center items-center gap-3 mb-10">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-xl">
              <img src={YUMIN_LOGO_URL} alt="Yumin Edu" className="w-full h-full object-contain p-1" />
           </div>
           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl">
             R
           </div>
        </div>

        <div className="text-center mb-10">
          <h2 className={`text-4xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>Kilo a Ko'a</h2>
          <div className={`flex justify-center mt-6 p-1 rounded-2xl w-fit mx-auto ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <button onClick={() => setIsSignUp(false)} className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${!isSignUp ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500'}`}>Log In</button>
            <button onClick={() => setIsSignUp(true)} className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isSignUp ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : 'text-slate-500'}`}>Sign Up</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600">
            <AlertCircle size={20} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDark ? 'border-white/5 bg-white/5 text-white hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Chrome size={20} className="text-rose-500" />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
          >
            <Apple size={20} /> Continue with Apple
          </button>
        </div>

        <div className="relative my-8 text-center">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'opacity-10' : 'opacity-100'}`}><div className="w-full border-t border-slate-200"></div></div>
          <span className={`relative px-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-[#0c1218] text-slate-600' : 'bg-white text-slate-400'}`}>or use credentials</span>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-6">
          {isSignUp && (
            <input type="text" placeholder="Full Name" className={`w-full p-4 rounded-xl border-2 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-white/5 border-transparent text-white placeholder:text-slate-700' : 'bg-slate-50 border-transparent text-slate-900 focus:bg-white'}`} value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email Address" className={`w-full p-4 rounded-xl border-2 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${isDark ? 'bg-white/5 border-transparent text-white placeholder:text-slate-700' : 'bg-slate-50 border-transparent text-slate-900 focus:bg-white'}`} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};
