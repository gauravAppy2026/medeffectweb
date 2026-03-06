import api from './api';

const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getStatusCounts: () => api.get('/orders/status-counts'),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  assignSalesRep: (id, salesRepId) => api.put(`/admin/orders/${id}/assign`, { salesRepId }),
  updateTracking: (id, trackingNumber) => api.put(`/admin/orders/${id}/tracking`, { trackingNumber }),
};

export default orderService;
