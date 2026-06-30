import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  setupAdmin: (data) => api.post('/auth/setup-admin', data),
  logout: () => {
    // Backend is stateless JWT, so logout is purely frontend handled,
    // but we define it here for service completeness.
    return Promise.resolve();
  }
};
