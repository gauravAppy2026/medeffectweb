import React, { useState, useEffect, useCallback } from 'react';
import auditService from '../services/auditService';

const ACTION_COLORS = {
  LOGIN: 'bg-green-100 text-green-700',
  LOGIN_FAILED: 'bg-red-100 text-red-700',
  CREATE: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  EXPORT: 'bg-purple-100 text-purple-700',
  PASSWORD_CHANGE: 'bg-orange-100 text-orange-700',
  REGISTER: 'bg-teal-100 text-teal-700',
};

const ACTION_OPTIONS = [
  'LOGIN', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PASSWORD_CHANGE',
];

const RESOURCE_OPTIONS = [
  'auth', 'orders', 'doctors', 'users', 'insurance', 'products', 'shipments', 'reports', 'cms', 'upload',
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filters.action) params.action = filters.action;
      if (filters.resource) params.resource = filters.resource;
      if (filters.search) params.search = filters.search;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const res = await auditService.getLogs(params);
      const data = res.data?.data || res.data;
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchStats = async () => {
    try {
      const res = await auditService.getStats();
      setStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: '', resource: '', search: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getActionBadge = (action) => {
    const base = action?.replace('_FAILED', '');
    const color = ACTION_COLORS[action] || ACTION_COLORS[base] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1E293B]">Audit Logs</h1>
        <p className="text-sm text-[#6C7490] mt-1">HIPAA compliance activity tracking</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-sm text-[#6C7490]">Today's Events</p>
            <p className="text-2xl font-semibold text-[#1E293B] mt-1">{stats.todayCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-sm text-[#6C7490]">This Week</p>
            <p className="text-2xl font-semibold text-[#1E293B] mt-1">{stats.weekCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-sm text-[#6C7490]">Failed Logins (7d)</p>
            <p className={`text-2xl font-semibold mt-1 ${stats.failedLogins > 0 ? 'text-red-600' : 'text-[#1E293B]'}`}>
              {stats.failedLogins}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#6C7490] mb-1">Search</label>
            <input
              type="text"
              placeholder="Email, description, endpoint..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:border-[#0089FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6C7490] mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0089FF]"
            >
              <option value="">All Actions</option>
              {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#6C7490] mb-1">Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0089FF]"
            >
              <option value="">All Resources</option>
              {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#6C7490] mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0089FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6C7490] mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0089FF]"
            />
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-[#6C7490] hover:text-[#1E293B] border border-[#E2E8F0] rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex justify-between items-center">
          <span className="text-sm text-[#6C7490]">{total} total events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">Time</th>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">Action</th>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">User</th>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">Description</th>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">IP</th>
                <th className="text-left px-4 py-3 text-[#6C7490] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6C7490]">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6C7490]">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log._id || i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 text-[#475569] whitespace-nowrap text-xs">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3">
                      <div className="text-[#1E293B] text-xs">{log.userEmail || '-'}</div>
                      <div className="text-[#94A3B8] text-xs">{log.userRole || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-[#475569] max-w-xs truncate text-xs">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs">{log.ipAddress || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${log.statusCode && log.statusCode < 400 ? 'text-green-600' : 'text-red-500'}`}>
                        {log.statusCode || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E2E8F0] flex justify-between items-center">
            <span className="text-sm text-[#6C7490]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
