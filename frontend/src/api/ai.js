import axios from "axios";

const AI_URL = "https://eticket-platform-2.onrender.com";

export const chatAPI = (payload) => axios.post(`${AI_URL}/chat`, payload);

export const generateDescriptionAPI = (payload) =>
  axios.post(`${AI_URL}/generate-description`, payload);

export const getSimilarRecommendationsAPI = (eventId) =>
  axios.get(`${AI_URL}/recommendations/similar/${eventId}`);

export const getPersonalizedRecommendationsAPI = (userId) =>
  axios.get(`${AI_URL}/recommendations/personalized/${userId}`);

