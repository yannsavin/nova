// frontend/src/services/userService.js
// Service pour les utilisateurs

import apiClient from './apiClient';

const userService = {
  // Enregistrement
  register: (data) => {
    return apiClient.post('/auth/register', data);
  },

  // Connexion
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, mot_de_passe: password });
  },

  // Déconnexion
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  // Obtenir le profil utilisateur
  getUserProfile: (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Mettre à jour le profil
  updateProfile: (id, data) => {
    return apiClient.put(`/users/${id}`, data);
  },

  // Obtenir l'utilisateur courant
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },

  // Changer le mot de passe
  changePassword: (oldPassword, newPassword) => {
    return apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  // Obtenir un utilisateur par ID
  getUserById: (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Obtenir l'historique d'achat
  getPurchaseHistory: (userId) => {
    return apiClient.get(`/users/${userId}/purchases`);
  },
};

export default userService;
