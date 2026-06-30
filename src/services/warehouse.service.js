import api from './api';

export const warehouseService = {
  getWarehouses: () => api.get('/warehouses'),
};
