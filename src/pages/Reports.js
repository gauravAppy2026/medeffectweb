import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import reportService from '../services/reportService';

const reportCards = [
  { title: 'Daily Order Summary', icon: 'description', type: 'orders', daily: true },
  { title: 'All Orders Report', icon: 'assignment', type: 'orders', daily: false },
  { title: 'IVR Reports', icon: 'description', type: 'ivr' },
];

export default function Reports() {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (card) => {
    const key = card.daily ? `${card.type}-daily` : card.type;
    setExporting(key);
    try {
      const params = {};
      if (card.daily) {
        const today = new Date().toISOString().split('T')[0];
        params.dateFrom = today;
        params.dateTo = today;
      }
      const res = await reportService.exportData(card.type, params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = card.daily ? 'daily-' : '';
      a.download = `${prefix}${card.type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export report');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Download comprehensive reports."
      />

      <div className="flex items-start gap-5">
        {reportCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm w-[270px] p-5"
          >
            <div className="w-[40px] h-[40px] bg-[#eaf4ff] rounded-[10px] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#0089ff] text-[24px]">
                {card.icon}
              </span>
            </div>

            <p className="text-[13px] font-semibold text-[#0f172a] leading-[22px] mb-4">
              {card.title}
            </p>

            <button
              onClick={() => handleExport(card)}
              disabled={exporting === (card.daily ? `${card.type}-daily` : card.type)}
              className="flex items-center gap-1.5 h-[30px] px-3 border border-[#0089ff] rounded-[6px] bg-white hover:bg-[#f0f7ff] transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[#0089ff] text-[20px]">
                {exporting === (card.daily ? `${card.type}-daily` : card.type) ? 'hourglass_empty' : 'download'}
              </span>
              <span className="text-[12px] font-medium text-[#0089ff] leading-[22px]">
                {exporting === (card.daily ? `${card.type}-daily` : card.type) ? 'Exporting...' : 'Export'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
