import api from './api';

export const settingService = {
  getAdminSettings: () => api.get('/settings/admin'),
  updateAdminSettings: (data) => api.put('/settings/admin', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSupplierSettings: () => api.get('/settings/supplier'),
  updateSupplierSettings: (data) => api.put('/settings/supplier', data),
  getCustomerSettings: () => api.get('/settings/customer'),
  updateCustomerSettings: (data) => api.put('/settings/customer', data),
  getSystemSettings: (category) => api.get(`/settings/system/${category}`),
  updateSystemSettings: (category, data) => {
    // Check if data is FormData
    if (data instanceof FormData) {
      return api.put(`/settings/system/${category}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/settings/system/${category}`, data);
  }
};
