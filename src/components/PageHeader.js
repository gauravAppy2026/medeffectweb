import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#0f172a] leading-snug">{title}</h1>
        {subtitle && (
          <p className="text-[15px] text-[#64748b] mt-1">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
