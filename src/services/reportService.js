import api from './api';

const reportService = {
  getOverview: () => api.get('/admin/reports/overview'),
  exportData: (type, params = {}) => api.get('/admin/reports/export', {
    params: { type, ...params },
    responseType: 'blob',
  }),
};

export default reportService;
