import API from './axios';

export const getQRCodeAPI      = (bookingId) => API.get(`/tickets/${bookingId}/qr`);
export const sendTicketEmailAPI = (bookingId) => API.post(`/tickets/${bookingId}/send-email`);
export const validateTicketAPI = (data)      => API.post('/tickets/validate', data);