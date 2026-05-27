import API from './axios';

export const registerAPI = (data) => API.post('/auth/register', data);
export const loginAPI    = (data) => API.post('/auth/login', data);
export const getMeAPI    = ()     => API.get('/auth/me');