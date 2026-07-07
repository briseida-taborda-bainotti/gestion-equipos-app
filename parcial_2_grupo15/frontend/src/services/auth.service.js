import api from './api.js';
export const loginService = (data) => api.post('/auth/login', data);
export const registerService = (data) => api.post('/auth/register', data);