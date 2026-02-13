import React, { useState } from 'react';
import { X, Mail, Smartphone, Bell, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface NotificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ isOpen, onClose, userEmail, userId }) => {
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'subscribers'), {
        uid: userId,
        email: email,
        phoneNumber: phone || null,
        timestamp: serverTimestamp(),
        source: 'web_app'
      });

      localStorage.setItem('hasHandledNotifications', 'true');
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Error subscribing: ", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNoThanks = () => {
    localStorage.setItem('hasHandledNotifications', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        {!success ? (
          <>
            <div className="relative h-32 bg-teal-600 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <img src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600" alt="background" className="w-full h-full object-cover" />
               </div>
               <div className="relative z-10 bg-white p-4 rounded-full shadow-lg text-teal-600">
                  <Bell size={32} className="animate-bounce" />
               </div>
               <button onClick={handleNoThanks} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors" aria-label="Close" title="Close">
                 <X size={24} />
               </button>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight italic font-serif">Stay Connected to the Reef</h3>
              <p className="text-slate-600 mb-8 font-medium">
                Would you like to receive email or text updates when we post new coral data?
              </p>

              <form onSubmit={handleSubscribe} className="space-y-4 mb-6">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567890"
                    pattern="[0-9]{10,15}"
                    title="Please enter a valid phone number (10-15 digits)"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-4 text-left">Numbers only (no dashes)</p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-100"
                  >
                    Subscribe
                  </Button>
                  <button type="button" onClick={handleNoThanks} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors uppercase tracking-widest pt-2">
                    No Thanks
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">You're on the list!</h3>
            <p className="text-slate-600 font-medium">
              We'll keep you updated on the reef's health.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
