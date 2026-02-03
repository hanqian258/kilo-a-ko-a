import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="w-12 h-12 border-4 border-slate-200 dark:border-white/10 border-t-teal-600 dark:border-t-teal-500 rounded-full animate-spin"></div>
  </div>
);
