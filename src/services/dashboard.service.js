import api from './api';

export const dashboardService = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getSupplierDashboard: () => api.get('/dashboard/supplier'),
  getCustomerDashboard: () => api.get('/dashboard/customer'),
};
