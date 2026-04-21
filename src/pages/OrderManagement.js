import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import IconButton from '../components/IconButton';
import StatusBadge from '../components/StatusBadge';
import orderService from '../services/orderService';
import productService from '../services/productService';

const tabs = ['All', 'Submitted', 'Approved', 'Shipped', 'Cancelled'];

/* ─── 3-dot Actions Dropdown (portal-based) ─── */
function ActionsDropdown({ onView }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
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

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 120,
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
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg w-[120px] py-1"
        >
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#0f172a]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748b]">visibility</span>
            View
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Order Details Modal ─── */
function OrderDetailsModal({ order, onClose, onAction }) {
  const [note, setNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [shippedQuantities, setShippedQuantities] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [editableLineItems, setEditableLineItems] = useState([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

  // Reset modal state whenever a different order is opened
  useEffect(() => {
    if (order) {
      setNote('');
      setTrackingNumber('');
      setActionLoading(false);
      setRejectionReason('');
      setSelectedProductToAdd('');
      // Initialize shipped quantities with ordered quantities
      const items = (order.lineItems && order.lineItems.length > 0)
        ? order.lineItems
        : [{ product: order.product, quantity: order.quantity }];
      const initial = {};
      items.forEach((item) => {
        const pid = item.product?._id || item.product;
        if (pid) initial[pid] = item.quantity;
      });
      setShippedQuantities(initial);
      // Initialize editable line items
      setEditableLineItems(items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })));
      // Fetch products for the selector
      productService.getProducts().then((res) => {
        const data = res.data?.data?.data || res.data?.data || [];
        setAllProducts(Array.isArray(data) ? data : []);
      }).catch(() => setAllProducts([]));
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

  const isSubmitted = order.status === 'submitted' || order.status === 'pending';
  const isApproved = order.status === 'approved';

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const payload = { status: 'approved' };
      if (note.trim()) payload.note = note.trim();
      // Send updated line items
      const lineItems = editableLineItems.map((item) => ({
        product: item.product?._id || item.product,
        quantity: Number(item.quantity),
      }));
      if (lineItems.length > 0) payload.lineItems = lineItems;
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
      const payload = { status: 'shipped', trackingNumber: trackingNumber.trim() };
      if (note.trim()) payload.note = note.trim();
      // Build shipped items array
      const shippedItems = Object.entries(shippedQuantities).map(([product, shippedQuantity]) => ({
        product,
        shippedQuantity: Number(shippedQuantity),
      }));
      if (shippedItems.length > 0) payload.shippedItems = shippedItems;
      // Send updated line items
      const lineItems = editableLineItems.map((item) => ({
        product: item.product?._id || item.product,
        quantity: Number(item.quantity),
      }));
      if (lineItems.length > 0) payload.lineItems = lineItems;
      await orderService.updateOrder(order._id, payload);
      onAction();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const payload = { status: 'cancelled' };
      if (rejectionReason.trim()) payload.rejectionReason = rejectionReason.trim();
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

  // Get existing admin note from statusHistory for read-only display
  const existingAdminNote = (() => {
    const latestNote = (order.statusHistory || []).slice().reverse().find(
      (h) => h.note && !h.note.startsWith('Status changed to') && h.note !== 'Order created'
    )?.note;
    return order.rejectionReason || latestNote || '';
  })();

  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const product = allProducts.find((p) => p._id === selectedProductToAdd);
    if (!product) return;
    // Don't add duplicates
    if (editableLineItems.some((item) => (item.product?._id || item.product) === product._id)) return;
    setEditableLineItems((prev) => [...prev, { product, quantity: 1 }]);
    // Initialize shipped quantity for new product
    setShippedQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    setSelectedProductToAdd('');
  };

  const handleRemoveLineItem = (index) => {
    const item = editableLineItems[index];
    const pid = item.product?._id || item.product;
    setEditableLineItems((prev) => prev.filter((_, i) => i !== index));
    setShippedQuantities((prev) => {
      const copy = { ...prev };
      delete copy[pid];
      return copy;
    });
  };

  const handleLineItemQtyChange = (index, qty) => {
    setEditableLineItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Number(qty) } : item));
    const pid = editableLineItems[index].product?._id || editableLineItems[index].product;
    setShippedQuantities((prev) => ({ ...prev, [pid]: Number(qty) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[14px] shadow-xl w-[420px] max-h-[90vh] overflow-y-auto p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#0f172a]">Order Details</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#0f172a] rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">cancel</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <p className="text-sm font-semibold text-[#0f172a]">{order.orderId}</p>
          <StatusBadge status={order.status} />
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-[#64748b]">Order Date</p>
            <p className="text-xs font-semibold text-[#0f172a]">{orderDate}</p>
          </div>
          <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">Products</p>
          {editableLineItems.map((item, idx) => {
            const pid = item.product?._id || item.product;
            const hasShipped = item.shippedQuantity != null && !isSubmitted && !isApproved;
            return (
              <div key={idx} className={`py-2 ${idx > 0 ? 'border-t border-[#f0f2f5]' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0f172a]">{item.product?.name || 'N/A'}</p>
                    {(isSubmitted || isApproved) ? (
                      <div className="flex items-center gap-2 mt-1">
                        <label className="text-[10px] text-[#64748b] whitespace-nowrap">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemQtyChange(idx, e.target.value)}
                          className="w-[60px] h-[28px] border border-[#e2e8f0] rounded-[6px] px-2 text-xs text-[#0f172a] text-center focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
                        />
                        <button
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-[#f23e41] hover:text-[#d93235] ml-1"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-[#64748b]">Ordered Qty: {item.quantity}</p>
                        {hasShipped && (
                          <p className="text-[10px] font-medium text-[#10b981]">Shipped Qty: {item.shippedQuantity}</p>
                        )}
                      </>
                    )}
                  </div>
                  {item.product?.price && (
                    <p className="text-xs font-semibold text-[#0089ff]">${item.product.price}</p>
                  )}
                </div>
                {isApproved && (
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-[10px] text-[#64748b] whitespace-nowrap">Ship Qty:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={shippedQuantities[pid] ?? item.quantity}
                      onChange={(e) => setShippedQuantities((prev) => ({ ...prev, [pid]: e.target.value }))}
                      className="w-[70px] h-[30px] border border-[#e2e8f0] rounded-[6px] px-2 text-xs text-[#0f172a] text-center focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
                    />
                    <span className="text-[10px] text-[#64748b]">/ {item.quantity}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add product selector for submitted/approved orders */}
          {(isSubmitted || isApproved) && allProducts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#f0f2f5]">
              <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">Add Product</p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 h-[32px] border border-[#e2e8f0] rounded-[6px] px-2 text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] bg-white"
                >
                  <option value="">Select a product...</option>
                  {allProducts
                    .filter((p) => !editableLineItems.some((item) => (item.product?._id || item.product) === p._id))
                    .map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProductToAdd}
                  className="h-[32px] px-3 bg-[#0089ff] text-white text-xs font-medium rounded-[6px] hover:bg-[#0077e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          )}
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

        {/* Note from Customer - always show if exists */}
        {order.comment && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
              Note from Customer
            </p>
            <div className="rounded-[10px] px-4 py-3 text-xs font-medium bg-[#f9fafc] border border-[#e2e8f0] text-[#0f172a]">
              {order.comment}
            </div>
          </div>
        )}

        {/* Submitted orders — Approve or Cancel */}
        {isSubmitted && (
          <>
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Note from MedEffects</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-[80px] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-xs text-[#0f172a] placeholder:text-[#97a3b6] resize-none focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-5"
            />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#f23e41] text-white text-sm font-semibold rounded-[10px] hover:bg-[#d93235] transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#10b981] text-white text-sm font-semibold rounded-[10px] hover:bg-[#059669] transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </>
        )}

        {/* Approved orders — Ship or Cancel */}
        {isApproved && (
          <>
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Tracking Number</p>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              className="w-full h-[42px] border border-[#e2e8f0] rounded-[10px] px-4 text-xs text-[#0f172a] placeholder:text-[#97a3b6] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-4"
            />
            <p className="text-[12px] font-medium text-[#0f172a] mb-2">Note from MedEffects</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-[80px] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-xs text-[#0f172a] placeholder:text-[#97a3b6] resize-none focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] mb-5"
            />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#f23e41] text-white text-sm font-semibold rounded-[10px] hover:bg-[#d93235] transition-colors disabled:opacity-50"
              >
                Cancel Order
              </button>
              <button
                onClick={handleShip}
                disabled={actionLoading}
                className="h-[42px] px-5 bg-[#10b981] text-white text-sm font-semibold rounded-[10px] hover:bg-[#059669] transition-colors disabled:opacity-50"
              >
                Ship
              </button>
            </div>
          </>
        )}

        {/* Read-only notes for shipped/cancelled orders */}
        {!isSubmitted && !isApproved && (
          <>
            {existingAdminNote && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                  Note from MedEffects
                </p>
                <div className="rounded-[10px] px-4 py-3 text-xs font-medium bg-[#f0f9ff] border border-[#bae0ff] text-[#0f172a]">
                  {existingAdminNote}
                </div>
              </div>
            )}
          </>
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
        const statusMap = { Submitted: 'submitted', Approved: 'approved', Shipped: 'shipped', Cancelled: 'cancelled' };
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

  const submittedCount = statusCounts.submitted || statusCounts.pending || 0;

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
            {tab === 'Submitted' && submittedCount > 0 && (
              <span className="w-4 h-4 bg-[#de524c] text-white text-[12px] font-medium rounded flex items-center justify-center">
                {submittedCount}
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
            <div className="grid grid-cols-[0.9fr_1.1fr_1fr_1fr_0.9fr_0.8fr_0.7fr_0.9fr_0.4fr] px-5 py-4 gap-2">
              {['ORDER ID', 'PRODUCT', 'PRACTICE', 'PATIENT', 'SALES REP', 'QTY', 'STATUS', 'DATE', 'ACTIONS'].map((col) => (
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
                const practiceName = order.doctor?.department || '—';
                const patientName = order.patientName ||
                  (order.patient
                    ? `${order.patient.firstName || ''} ${order.patient.lastName || ''}`.trim()
                    : '') || '—';
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-[0.9fr_1.1fr_1fr_1fr_0.9fr_0.8fr_0.7fr_0.9fr_0.4fr] px-5 py-4 gap-2 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0f172a] truncate">{order.orderId}</span>
                    <span className="text-xs font-medium text-[#0f172a] truncate" title={
                      (order.lineItems && order.lineItems.length > 0)
                        ? order.lineItems.map((li) => li.product?.name || 'N/A').join(', ')
                        : (order.product?.name || 'N/A')
                    }>{
                      (order.lineItems && order.lineItems.length > 0)
                        ? order.lineItems.map((li) => li.product?.name || 'N/A').join(', ')
                        : (order.product?.name || 'N/A')
                    }</span>
                    <span className="text-xs font-medium text-[#0f172a] truncate" title={practiceName}>{practiceName}</span>
                    <span className="text-xs font-medium text-[#0f172a] truncate" title={patientName}>{patientName}</span>
                    <span className="text-xs font-medium text-[#0f172a] truncate" title={salesRepName}>{salesRepName}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{
                      (order.lineItems && order.lineItems.length > 0)
                        ? order.lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0)
                        : order.quantity
                    }</span>
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-medium text-[#0f172a] truncate">{date}</span>
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
