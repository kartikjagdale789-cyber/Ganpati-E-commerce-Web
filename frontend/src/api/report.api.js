import api from './axios';
export const reportAPI = {
  dashboard  : ()     => api.get('/reports/dashboard'),
  sales      : (type) => api.get('/reports/sales', { params: { type } }),
  bestSelling: ()     => api.get('/reports/best-selling'),
  stock      : ()     => api.get('/reports/stock'),
};
