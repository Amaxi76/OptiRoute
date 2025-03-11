import React from 'react';

const TabButton = ({ onClick, children, isActive }) => {
  return (
    <button
      className={`
        bg-[var(--primary-color)] 
        font-bold 
        py-2 
        px-4 
        rounded-md 
        hover:bg-opacity-90 
        hover:text-[var(--primary-color)] 
        transition-colors
        ${isActive ? 'text-[var(--primary-color)]' : 'text-black bg-opacity-20'}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton;
