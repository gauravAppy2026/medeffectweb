import React from 'react';

export default function SearchBar({ placeholder = 'Search...', className = '', value, onChange }) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#97a3b6] text-[20px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-[46px] pl-10 pr-4 border border-[#e2e8f0] rounded-[10px] shadow-sm text-sm text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
      />
    </div>
  );
}
