import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--primary-color)] border-t-transparent"></div>
      <p className="mt-4 text-gray-700">Traitement en cours...</p>
    </div>
  );
};

export default Spinner;
