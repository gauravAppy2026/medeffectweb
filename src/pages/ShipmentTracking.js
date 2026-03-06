import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import shipmentService from '../services/shipmentService';

const statusConfig = {
  in_transit: { label: 'In Transit', bg: 'bg-[rgba(226,231,251,0.6)]', text: 'text-[#363998]' },
  completed: { label: 'Completed', bg: 'bg-[rgba(222,252,237,0.6)]', text: 'text-[#007a55]' },
  pending: { label: 'Pending', bg: 'bg-[#fff8db]', text: 'text-[#c25e16]' },
  delivered: { label: 'Delivered', bg: 'bg-[#defced]', text: 'text-[#007a55]' },
};

/* ─── 3-dot Actions Dropdown with status change ─── */
function ActionsDropdown({ currentStatus, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const statusOptions = Object.entries(statusConfig).filter(
    ([key]) => key !== currentStatus
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
      >
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#e2e8f0] rounded-lg shadow-lg w-[170px] z-30 py-1">
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
        </div>
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

/* ─── Add Tracking Info view ─── */
function AddTrackingForm({ onCancel, onSave }) {
  const [orderId, setOrderId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!trackingNumber) {
      setError('Tracking number is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await shipmentService.createShipment({
        order: orderId,
        trackingNumber,
        carrier,
      });
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Tracking Info"
        subtitle="Monitor shipments and manage tracking information."
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-xs font-medium text-[#64748b] mb-2">Order ID</label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order ID"
          className="w-full h-[46px] px-4 border border-[#e2e8f0] rounded-[10px] text-sm text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium text-[#64748b] mb-2">Tracking ID</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking ID"
          className="w-full h-[46px] px-4 border border-[#e2e8f0] rounded-[10px] text-sm text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium text-[#64748b] mb-2">Carrier</label>
        <input
          type="text"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          placeholder="e.g. UPS, FedEx, DHL"
          className="w-full h-[46px] px-4 border border-[#e2e8f0] rounded-[10px] text-sm text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="h-[46px] px-6 border border-[#e2e8f0] rounded-[10px] text-sm font-medium text-[#64748b] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-[46px] px-6 bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ShipmentTracking() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

  if (showAddForm) {
    return (
      <AddTrackingForm
        onCancel={() => setShowAddForm(false)}
        onSave={() => { setShowAddForm(false); fetchShipments(); }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Shipment Tracking"
        subtitle="Monitor shipments and manage tracking information."
      >
        <PrimaryButton onClick={() => setShowAddForm(true)}>
          + Add Tracking Info
        </PrimaryButton>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.4fr] px-8 py-4">
              {['ORDER ID', 'TRACKING ID', 'STATUS', 'ACTIONS'].map((col) => (
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
                const status = statusConfig[shipment.status] || statusConfig.pending;
                const orderId = shipment.order?.orderId || shipment.orderId || 'N/A';
                return (
                  <div
                    key={shipment._id}
                    className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.4fr] px-8 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0f172a]">{orderId}</span>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#f9fafc] text-xs font-medium text-[#64748b]">
                        {shipment.trackingNumber}
                      </span>
                      <CopyButton text={shipment.trackingNumber} />
                    </div>

                    <span
                      className={`inline-flex items-center justify-center w-fit px-2.5 py-0.5 rounded-md text-xs font-medium ${status.bg} ${status.text}`}
                    >
                      {status.label}
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
