import api from './api';

export const returnService = {
  getReturns: () => api.get('/returns'),
  processReturn: (data) => api.post('/returns', data),
};
