import React from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <h2 className="text-2xl font-black italic font-serif mb-6 text-slate-900 dark:text-white">Privacy Policy</h2>

        <div className="prose dark:prose-invert text-sm max-h-[60vh] overflow-y-auto pr-2 text-slate-600 dark:text-slate-300">
          <p className="mb-4"><strong className="text-slate-900 dark:text-white">Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p className="mb-4">
            At <strong>Kilo a Ko'a</strong>, we prioritize your privacy. This policy outlines how we handle your data.
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2">1. Data Collection</h3>
          <p className="mb-4">
            We collect basic profile information (name, email, avatar) when you sign in via Google or Apple. This is used solely for authentication and user identification within the app (e.g., attributing your coral observations).
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2">2. Data Storage</h3>
          <p className="mb-4">
            Your user profile data is stored securely using Google Firebase services. Community contributions (images, logs) are stored in our database. Some data may be cached locally on your device to improve performance ("Offline Mode").
          </p>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2">3. Contact</h3>
          <p className="mb-4">
            If you have any questions or wish to request data deletion, please contact the Yumin Edu team.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
           <button
             onClick={onClose}
             className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all shadow-lg"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
};
