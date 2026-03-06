import api from './api';

const doctorService = {
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getDoctorById: (id) => api.get(`/admin/doctors/${id}`),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
};

export default doctorService;
