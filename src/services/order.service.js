import api from './api';

export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  markAsPaid: (id) => api.patch(`/orders/${id}/mark-paid`),
};
