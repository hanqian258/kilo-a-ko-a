import React from 'react';

export const LoadingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8 animate-in fade-in duration-500">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-teal-500/60 font-black uppercase tracking-[0.3em] text-xs animate-pulse">
        Loading...
      </p>
    </div>
  );
};
