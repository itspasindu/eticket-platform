import API from "./axios";

export const chatAPI = (payload) => API.post("/ai/chat", payload);

export const generateDescriptionAPI = (payload) =>
  API.post("/ai/generate-description", payload);

export const getSimilarRecommendationsAPI = (eventId) =>
  API.get(`/ai/recommendations/similar/${eventId}`);

export const getPersonalizedRecommendationsAPI = (userId) =>
  API.get(`/ai/recommendations/personalized/${userId}`);
