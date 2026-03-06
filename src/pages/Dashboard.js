import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import reportService from '../services/reportService';
import orderService from '../services/orderService';
import ivrService from '../services/ivrService';

function RecentOrdersCard({ orders, onViewAll }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm flex-1">
      <div className="flex items-center justify-between px-5 py-4 bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
        <h3 className="text-base font-semibold text-[#0f172a]">Recent Orders</h3>
        <button onClick={onViewAll} className="text-[13px] font-medium text-[#2958e8] hover:underline">View All</button>
      </div>
      <div className="divide-y divide-[#e2e8f0]">
        {orders.length === 0 && (
          <div className="px-5 py-6 text-center text-xs text-[#64748b]">No recent orders</div>
        )}
        {orders.map((order) => (
          <div key={order._id || order.orderId} className="px-5 py-3.5 flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#0f172a]">{order.orderId}</p>
              <p className="text-xs font-medium text-[#64748b]">
                {order.patient?.firstName ? `${order.patient.firstName} ${order.patient.lastName}` : 'N/A'}
              </p>
              <p className="text-xs text-[#64748b]">{order.product?.name || 'N/A'}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingActionsCard({ orderCounts, ivrCounts }) {
  const actions = [
    {
      title: `${orderCounts.pending || orderCounts.submitted || 0} Orders Pending`,
      subtitle: 'Awaiting approval',
      icon: 'shopping_cart',
      bgColor: 'bg-[#fff8db]',
      btnColor: 'bg-[#eaa13b]',
      btnText: 'Review',
    },
    {
      title: `${ivrCounts.pending || 0} IVR Pending`,
      subtitle: 'Awaiting verification',
      icon: 'verified_user',
      bgColor: 'bg-[rgba(226,231,251,0.6)]',
      btnColor: 'bg-[#363998]',
      btnText: 'Verify',
    },
    {
      title: `${orderCounts.shipped || 0} Orders Shipped`,
      subtitle: 'In transit',
      icon: 'local_shipping',
      bgColor: 'bg-[rgba(222,252,237,0.6)]',
      btnColor: 'bg-[#007a55]',
      btnText: 'Track',
    },
  ];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm flex-1">
      <div className="px-5 py-4 bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
        <h3 className="text-base font-semibold text-[#0f172a]">Pending Actions</h3>
      </div>
      <div className="p-5 space-y-3">
        {actions.map((action, i) => (
          <div key={i} className={`${action.bgColor} opacity-70 rounded-[10px] px-4 py-3 flex items-center gap-3`}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#64748b] text-[18px]">{action.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0f172a]">{action.title}</p>
              <p className="text-[11px] text-[#64748b]">{action.subtitle}</p>
            </div>
            <button className={`${action.btnColor} text-white text-xs font-medium px-3 py-1 rounded-md shrink-0`}>
              {action.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentIVRCard({ ivrRequests, onViewAll }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm flex-1">
      <div className="flex items-center justify-between px-5 py-4 bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
        <h3 className="text-base font-semibold text-[#0f172a]">Recent IVR</h3>
        <button onClick={onViewAll} className="text-[13px] font-medium text-[#2958e8] hover:underline">View All</button>
      </div>
      <div className="divide-y divide-[#e2e8f0]">
        {ivrRequests.length === 0 && (
          <div className="px-5 py-6 text-center text-xs text-[#64748b]">No recent IVR requests</div>
        )}
        {ivrRequests.map((ivr, i) => {
          const firstName = ivr.patient?.firstName || '';
          const lastName = ivr.patient?.lastName || '';
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
          const name = `${firstName} ${lastName}`.trim();
          return (
            <div key={ivr._id || i} className="px-5 py-4 flex items-center gap-3">
              <div className="w-[46px] h-[46px] rounded-full bg-[#e6f1ff] flex items-center justify-center text-[#24315d] text-lg font-medium">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#24315d]">{name}</p>
                <p className="text-xs text-[#6c7490]">{ivr.requestId}</p>
              </div>
              <StatusBadge status={ivr.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentIVR, setRecentIVR] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [ivrCounts, setIvrCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [overviewRes, ordersRes, ivrRes, orderCountsRes, ivrCountsRes] = await Promise.all([
          reportService.getOverview().catch(() => ({ data: { data: {} } })),
          orderService.getOrders({ limit: 5 }).catch(() => ({ data: { data: { data: [] } } })),
          ivrService.getIVRRequests({ limit: 5 }).catch(() => ({ data: { data: { data: [] } } })),
          orderService.getStatusCounts().catch(() => ({ data: { data: {} } })),
          ivrService.getStatusCounts().catch(() => ({ data: { data: {} } })),
        ]);

        const overview = overviewRes.data?.data || {};
        const ordersOverview = overview.orders || {};
        const ivrOverview = overview.ivr || {};
        setStats([
          { label: "Today's Orders", value: ordersOverview.today || 0, icon: 'order_approve', change: '' },
          { label: 'Pending Orders', value: ordersOverview.pending || 0, icon: 'schedule', change: '' },
          { label: 'Shipped Today', value: overview.shippedToday || 0, icon: 'inventory_2', change: '' },
          { label: 'Active Sales Reps', value: overview.salesReps?.active || 0, icon: 'analytics', change: '' },
          { label: 'Total Orders (MTD)', value: ordersOverview.monthly || 0, icon: 'finance_mode', change: '' },
          { label: 'Approval Rate', value: `${overview.approvalRate || 0}%`, icon: 'check_circle', change: '' },
        ]);

        const ordersData = ordersRes.data?.data?.data || [];
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

        const ivrData = ivrRes.data?.data?.data || [];
        setRecentIVR(Array.isArray(ivrData) ? ivrData.slice(0, 5) : []);

        setOrderCounts(orderCountsRes.data?.data || {});
        setIvrCounts(ivrCountsRes.data?.data || {});
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
        <div className="flex items-center gap-2 h-[46px] px-4 border border-[#e2e8f0] rounded-[10px] shadow-sm bg-white">
          <span className="material-symbols-outlined text-[#64748b] text-[20px]">calendar_today</span>
          <span className="text-sm font-medium text-[#64748b]">{today}</span>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-6">
        <RecentOrdersCard orders={recentOrders} onViewAll={() => navigate('/orders')} />
        <PendingActionsCard orderCounts={orderCounts} ivrCounts={ivrCounts} />
        <RecentIVRCard ivrRequests={recentIVR} onViewAll={() => navigate('/ivr')} />
      </div>
    </div>
  );
}
