import React from 'react';

export default function StatCard({ label, value, change, icon }) {
  return (
    <div className="bg-[#f7f8fb] rounded-[10px] p-5 min-w-[160px] flex-1">
      <div className="w-10 h-10 bg-white rounded-[10px] shadow-sm flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">{icon}</span>
      </div>
      <p className="text-[13px] font-medium text-[#64748b] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#0f172a]">{value}</span>
        <span className="text-[13px] font-semibold text-[#10b981]">{change}</span>
      </div>
    </div>
  );
}
