import api from './api';

const ivrService = {
  getIVRRequests: (params) => api.get('/ivr', { params }),
  getIVRById: (id) => api.get(`/ivr/${id}`),
  getStatusCounts: () => api.get('/ivr/status-counts'),
  updateIVR: (id, data) => api.put(`/admin/ivr/${id}`, data),
};

export default ivrService;
