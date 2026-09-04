import api from './axios';
export const customerAPI = {
  getAll     : ()   => api.get('/customers'),
  getDues    : ()   => api.get('/customers/dues'),
  getInvoices: (id) => api.get(`/customers/${id}/invoices`),
};
