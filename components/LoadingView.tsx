import React from 'react';

export const LoadingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 opacity-25"></div>
        <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-teal-600 font-bold text-lg animate-pulse">Loading...</p>
    </div>
  );
};
