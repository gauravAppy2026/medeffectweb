import React from 'react';

const statusStyles = {
  pending: 'bg-[#fff8db] text-[#c25e16]',
  submitted: 'bg-[#fff8db] text-[#c25e16]',
  approved: 'bg-[#e6f1ff] text-[#2958e8]',
  shipped: 'bg-[#defced] text-[#007a55]',
  in_transit: 'bg-[rgba(226,231,251,0.6)] text-[#363998]',
  completed: 'bg-[#defced] text-[#007a55]',
  delivered: 'bg-[#defced] text-[#007a55]',
  cancelled: 'bg-[#ffebec] text-[#f23e41]',
  rejected: 'bg-[#ffebec] text-[#f23e41]',
  covered: 'bg-[#defced] text-[#007a55]',
  not_covered: 'bg-[#eef1fd] text-[#363998]',
  active: 'bg-[#defced] text-[#007a55]',
  critical: 'text-[#f23e41]',
  urgent: 'text-[#eaa13b]',
  normal: 'text-[#363998]',
};

export default function StatusBadge({ status, size = 'default' }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
  // Display friendly labels for statuses
  const displayMap = { submitted: 'Submitted', in_transit: 'In Transit', not_covered: 'Not Covered' };
  const label = displayMap[status] || (status.charAt(0).toUpperCase() + status.slice(1));

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
