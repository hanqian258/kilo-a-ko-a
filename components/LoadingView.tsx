import React from 'react';

export const LoadingView: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"
        aria-label="Loading content"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
