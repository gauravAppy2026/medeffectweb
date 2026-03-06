import api from './api';

const shipmentService = {
  getShipments: (params) => api.get('/admin/shipments', { params }),
  createShipment: (data) => api.post('/admin/shipments', data),
  updateShipment: (id, data) => api.put(`/admin/shipments/${id}`, data),
};

export default shipmentService;
