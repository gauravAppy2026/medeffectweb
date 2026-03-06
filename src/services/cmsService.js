import api from './api';

const cmsService = {
  getAll: () => api.get('/admin/cms'),
  getByKey: (key) => api.get(`/cms/${key}`),
  update: (key, data) => api.put(`/admin/cms/${key}`, data),
};

export default cmsService;
