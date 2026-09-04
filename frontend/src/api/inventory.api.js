import api from './axios';
export const inventoryAPI = {
  getAll   : (params) => api.get('/inventory', { params }),
  getOne   : (id)     => api.get(`/inventory/${id}`),
  create   : (data)   => api.post('/inventory', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update   : (id, data) => api.put(`/inventory/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove   : (id)     => api.delete(`/inventory/${id}`),
  updateQty: (id, qty) => api.patch(`/inventory/${id}/qty`, { qty }),
};
