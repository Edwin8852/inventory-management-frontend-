import api from './api';

export const billingService = {
  createOrder: (data) => api.post('/orders', data),
  getInvoices: () => api.get('/invoices'),
};
