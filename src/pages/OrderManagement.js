import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import IconButton from '../components/IconButton';
import StatusBadge from '../components/StatusBadge';
import orderService from '../services/orderService';

const tabs = ['All', 'Pending', 'Approved', 'Shipped', 'Rejected'];

/* ─── 3-dot Actions Dropdown ─── */
function ActionsDropdown({ onView }) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 80);
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
      >
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} bg-white border border-[#e2e8f0] rounded-lg shadow-lg w-[120px] z-30 py-1`}>
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#0f172a]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748b]">visibility</span>
            View
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Order Details Modal ─── */
function OrderDetailsModal({ order, onClose, onAction }) {
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reset modal state whenever a different order is opened
  useEffect(() => {
    if (order) {
      setNote('');
      setTrackingNumber('');
      setActionLoading(false);
    }
  }, [order?._id]);

  if (!order) return null;

  const salesRepName = order.salesRep
    ? `${order.salesRep.firstName || ''} ${order.salesRep.lastName || ''}`.trim()
    : 'Unassigned';

  const initials = salesRepName
    .split(' ')
    .map((n) => n[0] || '')
    .join('');

  const handleStatusAction = async (status) => {
    setActionLoading(true);
    try {
      const payload = { status };
      if (status === 'rejected' && note.trim()) {
        payload.rejectionReason = note.trim();
      }
      if (note.trim()) {
        payload.note = note.trim();
      }
      await orderService.updateOrder(order._id, payload);
      onAction();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    setActionLoading(true);
    try {
      // Save tracking number first
      await orderService.updateTracking(order._id, trackingNumber.trim());
      // Then update status to shipped
      const payload = { status: 'shipped' };
      if (note.trim()) payload.note = note.trim();
      await orderService.updateOrder(order._id, payload);
      onAction();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const isSubmitted = order.status === 'submitted' || order.status === 'pending';
  const isApproved = order.status === 'approved';

  // Get existing note for read-only display
  const existingNote = (() => {
    const latestNote = (order.statusHistory || []).slice().reverse().find(
      (h) => h.note && !h.note.startsWith('Status changed to') && h.note !== 'Order created'
    )?.note;
    return order.rejectionReason || latestNote || '';
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[14px] shadow-xl w-[380px] max-h-[90vh] overflow-y-auto p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#0f172a]">Order Details</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#0f172a] rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">cancel</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-[#0f172a]">{order.orderId}</p>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-1 mb-5">
          <span className="w-2 h-2 rounded-full bg-[#363998]" />
          <span className="text-xs font-medium text-[#64748b] capitalize">Normal Priority</span>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-[#64748b]">Order Date</p>
            <p className="text-xs font-semibold text-[#0f172a]">{orderDate}</p>
          </div>
          <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">Products</p>
          {(order.lineItems && order.lineItems.length > 0 ? order.lineItems : [{ product: order.product, quantity: order.quantity }]).map((item, idx) => (
            <div key={idx} className={`flex items-center justify-between py-2 ${idx > 0 ? 'border-t border-[#f0f2f5]' : ''}`}>
              <div>
                <p className="text-xs font-semibold text-[#0f172a]">{item.product?.name || 'N/A'}</p>
                <p className="text-[10px] text-[#64748b]">Qty: {item.quantity}</p>
              </div>
              {item.product?.price && (
                <p className="text-xs font-semibold text-[#0089ff]">${item.product.price}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tracking number display for shipped orders */}
        {order.trackingNumber && (
          <div className="mb-5">
            <p className="text-[10px] font-medium text-[#64748b] mb-0.5">Tracking Number</p>
            <p className="text-xs font-semibold text-[#0089ff]">{order.trackingNumber}</p>
          </div>
        )}

        <div className="h-px bg-[#e2e8f0] mb-4" />

        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">
          Sales Representative
        </p>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[34px] h-[34px] rounded-full bg-[#e6f1ff] flex items-center justify-center text-[13px] font-semibold text-[#0f172a]">
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0f172a]">{salesRepName}</p>
            <p className="text-xs font-medium text-[#64748b]">{order.salesRep?.email || ''}</p>
          </div>
        </div>

        {/* Step 1: Pending/Submitted — Approve or Reject */}
        {isSubmitted && (
          <>
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-[80px] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-xs text-[#0f172a] placeholder:text-[#97a3b6] resize-none focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-5"
            />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleStatusAction('rejected')}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#f23e41] text-white text-sm font-semibold rounded-[10px] hover:bg-[#d93235] transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusAction('approved')}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </>
        )}

        {/* Step 2: Approved — Ship with tracking number */}
        {isApproved && (
          <>
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Tracking Number</p>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              className="w-full h-[42px] border border-[#e2e8f0] rounded-[10px] px-4 text-xs text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-4"
            />
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a shipping note..."
              className="w-full h-[80px] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-xs text-[#0f172a] placeholder:text-[#97a3b6] resize-none focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-5"
            />
            <div className="flex items-center justify-center">
              <button
                onClick={handleShip}
                disabled={actionLoading}
                className="h-[42px] px-8 bg-[#10b981] text-white text-sm font-semibold rounded-[10px] hover:bg-[#059669] transition-colors disabled:opacity-50"
              >
                Ship Order
              </button>
            </div>
          </>
        )}

        {/* Read-only note for processed orders */}
        {!isSubmitted && !isApproved && existingNote && (
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Note
            </p>
            <div className="rounded-[10px] px-4 py-3 text-xs font-medium bg-[#f0f9ff] border border-[#bae0ff] text-[#0f172a]">
              {existingNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'All') {
        const statusMap = { Pending: 'submitted' };
        params.status = statusMap[activeTab] || activeTab.toLowerCase();
      }
      if (search) params.search = search;

      const [ordersRes, countsRes] = await Promise.all([
        orderService.getOrders(params),
        orderService.getStatusCounts().catch(() => ({ data: { data: {} } })),
      ]);

      const data = ordersRes.data?.data?.data || [];
      setOrders(Array.isArray(data) ? data : []);
      setStatusCounts(countsRes.data?.data || {});
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const pendingCount = statusCounts.pending || statusCounts.submitted || 0;

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Review, verify and approve order requests from sales representatives."
      >
        <SearchBar
          placeholder="Search orders..."
          className="w-[243px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton icon="filter_list" />
        <IconButton icon="upload" />
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 h-10 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-[#0f172a] text-white'
                : 'bg-[#f7f8fb] text-[#64748b] hover:bg-[#e2e8f0]'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="w-4 h-4 bg-[#de524c] text-white text-[12px] font-medium rounded flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1fr_1.2fr_1fr_0.6fr_0.7fr_1fr_0.5fr] px-5 py-4">
              {['ORDER ID', 'PRODUCT', 'SALES REP', 'QUANTITY', 'STATUS', 'DATE', 'ACTIONS'].map((col) => (
                <span key={col} className="text-xs font-semibold text-[#64748b] uppercase">
                  {col}
                </span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {orders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#64748b]">No orders found</div>
            ) : (
              orders.map((order) => {
                const salesRepName = order.salesRep
                  ? `${order.salesRep.firstName || ''} ${order.salesRep.lastName || ''}`.trim()
                  : 'Unassigned';
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-[1fr_1.2fr_1fr_0.6fr_0.7fr_1fr_0.5fr] px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0f172a]">{order.orderId}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{
                      (order.lineItems && order.lineItems.length > 0)
                        ? order.lineItems.map((li) => li.product?.name || 'N/A').join(', ')
                        : (order.product?.name || 'N/A')
                    }</span>
                    <span className="text-xs font-medium text-[#0f172a]">{salesRepName}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{
                      (order.lineItems && order.lineItems.length > 0)
                        ? order.lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0)
                        : order.quantity
                    }</span>
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-medium text-[#0f172a]">{date}</span>
                    <ActionsDropdown onView={() => setSelectedOrder(order)} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAction={fetchOrders}
      />
    </div>
  );
}
