import api from './api.js';
export const getEquipos = (params) => api.get('/equipos', { params });