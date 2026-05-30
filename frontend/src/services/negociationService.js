import apiClient from './apiClient';

const negociationService = {
  getOrCreate:          (produitId) => apiClient.post(`/negociations/product/${produitId}`),
  getMessages:          (id)        => apiClient.get(`/negociations/${id}/messages`),
  sendMessage:          (id, data)  => apiClient.post(`/negociations/${id}/messages`, data),
  getUserNegociations:  ()          => apiClient.get('/negociations'),
};

export default negociationService;
