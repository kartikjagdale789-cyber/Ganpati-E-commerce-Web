import api from './axios';
export const qrAPI = {
  generate: (data) => api.post('/qr/generate', data),
};
