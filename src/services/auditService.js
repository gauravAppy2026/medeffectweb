import api from './api';

const auditService = {
  getLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getStats: () => api.get('/admin/audit-logs/stats'),
};

export default auditService;
