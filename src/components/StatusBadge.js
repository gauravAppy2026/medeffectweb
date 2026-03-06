import React from 'react';

const statusStyles = {
  pending: 'bg-[#fff8db] text-[#c25e16]',
  approved: 'bg-[#e6f1ff] text-[#2958e8]',
  shipped: 'bg-[#eef1fd] text-[#363998]',
  delivered: 'bg-[#defced] text-[#007a55]',
  rejected: 'bg-[#ffebec] text-[#f23e41]',
  active: 'bg-[#defced] text-[#007a55]',
  critical: 'text-[#f23e41]',
  urgent: 'text-[#eaa13b]',
  normal: 'text-[#363998]',
};

export default function StatusBadge({ status, size = 'default' }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === 'critical' || status === 'urgent' || status === 'normal') {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'critical' ? 'bg-[#f23e41]' :
            status === 'urgent' ? 'bg-[#eaa13b]' : 'bg-[#363998]'
          }`}
        />
        <span className={`text-[11px] font-medium uppercase ${style}`}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-medium ${style} ${
        size === 'small' ? 'text-[10px] px-2 py-0' : ''
      }`}
    >
      {label}
    </span>
  );
}
