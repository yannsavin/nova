import apiClient from './apiClient';

const notificationService = {
  getAll:      ()   => apiClient.get('/notifications'),
  markRead:    (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: ()   => apiClient.put('/notifications/read-all'),
};

export default notificationService;
