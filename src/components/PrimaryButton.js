import React from 'react';

export default function PrimaryButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`h-[46px] px-5 bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors flex items-center gap-1 ${className}`}
    >
      {children}
    </button>
  );
}
