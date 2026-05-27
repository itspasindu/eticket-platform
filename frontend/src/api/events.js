import API from './axios';

export const getEventsAPI     = (params) => API.get('/events', { params });
export const getEventByIdAPI  = (id)     => API.get(`/events/${id}`);
export const createEventAPI   = (data)   => API.post('/events', data);
export const updateEventAPI   = (id, data) => API.put(`/events/${id}`, data);
export const deleteEventAPI   = (id)     => API.delete(`/events/${id}`);
export const publishEventAPI  = (id)     => API.put(`/events/${id}/publish`);
export const getMyEventsAPI   = ()       => API.get('/events/organizer/my-events');