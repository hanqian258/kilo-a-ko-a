import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { UserRole } from '../types';

interface RoleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (newRole: UserRole) => void;
}

export const RoleVerificationModal: React.FC<RoleVerificationModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!isOpen) return null;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const adminCode = import.meta.env.VITE_ADMIN_CODE || 'CORAL2026';

    if (code.toLowerCase().trim() === adminCode.toLowerCase()) {
      setIsVerified(true);
      setError('');
    } else {
      setError('Invalid Access Code');
    }
  };

  const handleConfirmRole = () => {
    if (selectedRole) {
      onVerify(selectedRole);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 p-8 pb-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
            {isVerified ? <ShieldCheck size={32} className="text-teal-500" /> : <Lock size={32} />}
          </div>
          <h3 className="text-2xl font-black text-slate-800 italic font-serif">
            {isVerified ? 'Identity Verified' : 'Organization Access'}
          </h3>
          <p className="text-slate-500 font-medium mt-2">
            {isVerified ? 'Please select your role within the organization.' : 'Enter your organization code to unlock scientist and admin features.'}
          </p>
        </div>

        {!isVerified ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="Access Code"
                className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-center text-lg placeholder:font-medium"
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-rose-500 text-sm font-bold mt-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-12 text-base font-black uppercase tracking-widest">
              Verify Access
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole(UserRole.SCIENTIST)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedRole === UserRole.SCIENTIST
                    ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-black text-lg mb-1">Scientist</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">Field Data</div>
              </button>

              <button
                onClick={() => setSelectedRole(UserRole.ADMIN)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedRole === UserRole.ADMIN
                    ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="font-black text-lg mb-1">Admin</div>
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">Full Access</div>
              </button>
            </div>

            <Button
              onClick={handleConfirmRole}
              disabled={!selectedRole}
              className="w-full h-12 text-base font-black uppercase tracking-widest mt-4"
            >
              Update Role
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
