import api from './api';

export const paymentService = {
  getPayments: () => api.get('/payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  recordPayment: (data) => api.post('/payments', data),
  verifyPayment: (id, status) => api.post(`/payments/${id}/verify`, { status }),
};
