import API from './axios';

export const getSeatsByEventAPI = (eventId) => API.get(`/seats/event/${eventId}`);
export const lockSeatsAPI       = (data)    => API.post('/seats/lock', data);
export const releaseSeatsAPI    = (data)    => API.post('/seats/release', data);