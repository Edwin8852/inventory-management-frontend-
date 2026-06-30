import api from './api';

export const supplierService = {
  getSuppliers: () => api.get('/suppliers'),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  getProfile: () => api.get('/suppliers/profile'),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`)
};
