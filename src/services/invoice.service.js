import api from './api';

export const invoiceService = {
  getInvoices: () => api.get('/invoices'),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  generateInvoice: (data) => api.post('/invoices/generate', data),
};
