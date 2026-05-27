// frontend/src/services/setupService.js
// Service pour initialiser les données du site

import apiClient from './apiClient';

const setupService = {
  // Initialiser la base de données
  initializeDatabase: () => {
    return apiClient.get('/setup');
  },

  // Générer les produits de démonstration
  generateDemoProducts: () => {
    return apiClient.post('/products/generate-demo');
  },

  // Générer les images pour les produits existants
  generateImages: () => {
    return apiClient.post('/products/generate-images');
  },
};

export default setupService;
