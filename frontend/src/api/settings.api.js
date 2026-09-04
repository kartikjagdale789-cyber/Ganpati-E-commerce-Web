import api from './axios';
export const settingsAPI = {
  get   : ()     => api.get('/settings'),
  update: (data) => api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
