import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PageHeader from '../components/PageHeader';
import shipmentService from '../services/shipmentService';

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-[#fff8db]', text: 'text-[#c25e16]' },
  in_transit: { label: 'In Transit', bg: 'bg-[rgba(226,231,251,0.6)]', text: 'text-[#363998]' },
  completed: { label: 'Completed', bg: 'bg-[rgba(222,252,237,0.6)]', text: 'text-[#007a55]' },
};

/* ─── 3-dot Actions Dropdown with status change (portal-based) ─── */
function ActionsDropdown({ currentStatus, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, dropUp: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const statusOptions = Object.entries(statusConfig).filter(
    ([key]) => key !== currentStatus
  );

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropUp = spaceBelow < 180;
      setPos({
        top: dropUp ? rect.top + window.scrollY : rect.bottom + window.scrollY + 4,
        left: rect.right - 170,
        dropUp,
      });
    }
    setOpen(!open);
  };

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
      >
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: pos.dropUp ? undefined : pos.top,
            bottom: pos.dropUp ? `${window.innerHeight - pos.top + 4}px` : undefined,
            left: pos.left,
            zIndex: 9999,
          }}
          className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg w-[170px] py-1"
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">
            Change Status
          </p>
          {statusOptions.map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                onStatusChange(key);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#0f172a]"
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${config.bg} ${config.text}`}
              >
                {config.label}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Copy Tracking ID button ─── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="w-[18px] h-[18px] flex items-center justify-center hover:bg-gray-100 rounded"
      title="Copy tracking ID"
    >
      <span className="material-symbols-outlined text-[#64748b] text-[16px]">
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  );
}

/* ─── Main Page ─── */
export default function ShipmentTracking() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shipmentService.getShipments();
      const data = res.data?.data?.data || [];
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleStatusChange = async (shipment, newStatus) => {
    try {
      await shipmentService.updateShipment(shipment._id, { status: newStatus });
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <PageHeader
        title="Shipment Tracking"
        subtitle="Monitor shipments and manage tracking information. Shipments are auto-created when orders are approved & shipped."
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1fr_1fr_1.2fr_0.8fr_0.8fr_0.5fr] px-8 py-4">
              {['ORDER ID', 'PATIENT', 'TRACKING ID', 'ORDER STATUS', 'SHIPMENT STATUS', 'ACTIONS'].map((col) => (
                <span key={col} className="text-xs font-semibold text-[#64748b] uppercase">
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {shipments.length === 0 ? (
              <div className="px-8 py-8 text-center text-sm text-[#64748b]">No shipments found</div>
            ) : (
              shipments.map((shipment) => {
                const shipmentStatus = statusConfig[shipment.status] || statusConfig.pending;
                const orderId = shipment.order?.orderId || shipment.orderId || 'N/A';
                const patient = shipment.order?.patient;
                const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A';
                const orderStatus = shipment.order?.status || 'N/A';
                const orderStatusLabel = { submitted: 'Pending', in_transit: 'In Transit' }[orderStatus] || (orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1));
                return (
                  <div
                    key={shipment._id}
                    className="grid grid-cols-[1fr_1fr_1.2fr_0.8fr_0.8fr_0.5fr] px-8 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0f172a]">{orderId}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{patientName}</span>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#f9fafc] text-xs font-medium text-[#64748b]">
                        {shipment.trackingNumber}
                      </span>
                      <CopyButton text={shipment.trackingNumber} />
                    </div>

                    <span className="inline-flex items-center justify-center w-fit px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#eef1fd] text-[#363998]">
                      {orderStatusLabel}
                    </span>

                    <span
                      className={`inline-flex items-center justify-center w-fit px-2.5 py-0.5 rounded-md text-xs font-medium ${shipmentStatus.bg} ${shipmentStatus.text}`}
                    >
                      {shipmentStatus.label}
                    </span>

                    <ActionsDropdown
                      currentStatus={shipment.status}
                      onStatusChange={(newStatus) => handleStatusChange(shipment, newStatus)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
