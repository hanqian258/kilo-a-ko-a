import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { YUMIN_LOGO_URL } from '../../constants';
import { Loader2 } from 'lucide-react';
import { signInWithGoogle, db } from '../../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginViewProps {
  onLogin: (user: User) => void;
  theme: 'light' | 'dark';
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme }) => {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleGoogleLogin = async () => {
    setIsSocialLoading(true);
    setError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) return;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      let appUser: User;

      if (userSnap.exists()) {
        const data = userSnap.data();
        appUser = {
          id: firebaseUser.uid,
          name: data.name || firebaseUser.displayName || 'User',
          email: data.email || firebaseUser.email || '',
          role: data.role || UserRole.DONOR,
          avatarUrl: firebaseUser.photoURL || undefined,
          attendedEvents: data.attendedEvents,
          readArticles: data.readArticles,
          badges: data.badges,
        };
      } else {
        appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: UserRole.DONOR,
          avatarUrl: firebaseUser.photoURL || undefined,
        };
        await setDoc(userRef, appUser, { merge: true });
      }

      onLogin(appUser);
    } catch (err) {
      console.error("Login failed", err);
      setError("Sign-in failed. Please try again.");
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className={`p-12 rounded-[3rem] shadow-2xl border w-full max-w-md relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0c1218] border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-center items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-xl">
            <img src={YUMIN_LOGO_URL} alt="Yumin Edu Logo" className="w-full h-full object-contain p-1" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className={`text-4xl font-black italic font-serif ${isDark ? 'text-white' : 'text-slate-900'}`}>Kilo a Ko'a</h2>
          <p className={`mt-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to join our coral community</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isSocialLoading}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs border-2 transition-all ${isDark ? 'border-white/5 bg-white/5 text-white hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
          >
            {isSocialLoading ? (
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

          {error && (
            <p className="text-red-500 text-sm font-bold text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
