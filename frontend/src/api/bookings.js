import API from './axios';

export const createBookingAPI  = (data) => API.post('/bookings', data);
export const getMyBookingsAPI  = ()     => API.get('/bookings/my');
export const getBookingByIdAPI = (id)   => API.get(`/bookings/${id}`);
export const confirmBookingAPI = (id, data) => API.put(`/bookings/${id}/confirm`, data);
export const cancelBookingAPI  = (id)   => API.put(`/bookings/${id}/cancel`);