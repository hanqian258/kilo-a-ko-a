import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingViewProps {
  theme?: 'light' | 'dark';
}

export const LoadingView: React.FC<LoadingViewProps> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-[50vh] flex flex-col items-center justify-center gap-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      <Loader2 className="animate-spin text-teal-500" size={48} />
      <p className="font-bold uppercase tracking-widest text-xs animate-pulse">Loading...</p>
    </div>
  );
};
