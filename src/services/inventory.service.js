import api from './api';
import { productService } from './product.service';

export const inventoryService = {
  // Fetching stock overview from the backend
  getInventory: () => api.get('/stocks/overview'),
  
  // These map to standard manual stock adjustment logic
  stockIn: (data) => api.post('/stocks/in', data),
  stockOut: (data) => api.post('/stocks/out', data),
  
  // If a stock movement history endpoint exists
  getStockHistory: (productId) => api.get(`/stocks/history/${productId}`)
};
