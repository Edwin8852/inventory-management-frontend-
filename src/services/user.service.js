import api from './api';

export const userService = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
