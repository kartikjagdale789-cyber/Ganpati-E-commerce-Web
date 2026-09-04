import api from './axios';
export const invoiceAPI = {
  getAll        : (params) => api.get('/invoices', { params }),
  getDues       : ()       => api.get('/invoices/dues'),
  getOne        : (id)     => api.get(`/invoices/${id}`),
  create        : (data)   => api.post('/invoices', data),
  receivePayment: (id, data) => api.post(`/invoices/${id}/payment`, data),
};
