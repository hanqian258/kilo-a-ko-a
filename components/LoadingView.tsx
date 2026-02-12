import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
      <p className="text-teal-600 font-bold uppercase tracking-widest text-sm animate-pulse">
        Loading Resources...
      </p>
    </div>
  );
};
