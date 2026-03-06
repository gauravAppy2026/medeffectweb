import React from 'react';

export default function IconButton({ icon, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-[46px] h-[46px] border border-[#e2e8f0] rounded-[10px] shadow-sm bg-white flex items-center justify-center hover:bg-gray-50 transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[#64748b] text-[20px]">{icon}</span>
    </button>
  );
}
