import apiClient from './apiClient';

const adminService = {
  // Utilisateurs
  getUsers:    ()        => apiClient.get('/admin/users'),
  updateUser:  (id, data)=> apiClient.put(`/admin/users/${id}`, data),

  // Produits
  getProducts:    ()   => apiClient.get('/admin/products'),
  hideProduct:    (id) => apiClient.put(`/admin/products/${id}/hide`),
  restoreProduct: (id) => apiClient.put(`/admin/products/${id}/restore`),
  deleteProduct:  (id) => apiClient.delete(`/admin/products/${id}`),
};

export default adminService;
