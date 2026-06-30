import api from './api';

export const productService = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Variant CRUD
  createVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId, data) => api.put(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId) => api.delete(`/products/variants/${variantId}`),
};
