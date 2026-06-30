import api from './api';

export const purchaseService = {
  // Uses existing backend PurchaseOrder endpoints
  getPurchases: () => api.get('/purchase-orders'),
  createPurchase: (data) => api.post('/purchase-orders', data),
  getPurchaseById: (id) => api.get(`/purchase-orders/${id}`),
  updatePurchaseStatus: (id, status) => api.put(`/purchase-orders/${id}/status`, { status }),
  // Some endpoints might be customized depending on backend structure
};
