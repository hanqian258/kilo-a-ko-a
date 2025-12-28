import React, { useState } from 'react';
import { X, Mail, Smartphone, Bell, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, userName }) => {
  const [step, setStep] = useState<'invite' | 'success'>('invite');
  const [prefs, setPrefs] = useState({ email: true, text: false });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onClose();
        // Reset for next time if needed, though usually one-shot
      }, 2500);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        {step === 'invite' ? (
          <>
            <div className="relative h-32 bg-teal-600 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <img src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600" alt="background" className="w-full h-full object-cover" />
               </div>
               <div className="relative z-10 bg-white p-4 rounded-full shadow-lg text-teal-600">
                  <Bell size={32} className="animate-bounce" />
               </div>
               <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight italic font-serif">Welcome, {userName}!</h3>
              <p className="text-slate-600 mb-8 font-medium">
                Would you like to receive real-time updates when our scientists log new coral monitoring photos at Kahalu‘u?
              </p>

              <div className="space-y-3 mb-8">
                <button 
                  onClick={() => setPrefs({...prefs, email: !prefs.email})}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${prefs.email ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Mail size={20} />
                    <span className="font-bold">Email Notifications</span>
                  </div>
                  {prefs.email && <CheckCircle2 size={18} />}
                </button>

                <button 
                  onClick={() => setPrefs({...prefs, text: !prefs.text})}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${prefs.text ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-100 text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} />
                    <span className="font-bold">Text Alerts</span>
                  </div>
                  {prefs.text && <CheckCircle2 size={18} />}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleSubscribe} 
                  isLoading={loading}
                  className="h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-teal-100"
                  disabled={!prefs.email && !prefs.text}
                >
                  Stay Connected
                </Button>
                <button onClick={onClose} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors uppercase tracking-widest pt-2">
                  Maybe Later
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">You're Subscribed!</h3>
            <p className="text-slate-600 font-medium">
              We'll notify you the moment a new observation is logged in the Kilo a Ko'a gallery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};