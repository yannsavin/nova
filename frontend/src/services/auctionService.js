import apiClient from './apiClient';

const auctionService = {
  getAuction: (productId) => apiClient.get(`/products/${productId}/auction`),
  placeBid: (productId, amount) => apiClient.post(`/products/${productId}/auction`, { amount }),
  closeAuction: (productId) => apiClient.post(`/products/${productId}/auction/close`),
  getHistory: (productId) => apiClient.get(`/products/${productId}/auction/history`),
};

export default auctionService;
