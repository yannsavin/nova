// frontend/src/services/productService.js
// Service pour les produits

import apiClient from './apiClient';

const productService = {
  // Récupérer tous les produits avec filtres
  getProducts: (params = {}) => {
    return apiClient.get('/products', { params });
  },

  // Récupérer un produit par ID
  getProductById: (id) => {
    return apiClient.get(`/products/${id}`);
  },

  // Rechercher des produits
  searchProducts: (query, filters = {}) => {
    return apiClient.get('/products', {
      params: {
        q: query,
        ...filters,
      },
    });
  },

  // Obtenir les produits d'un vendeur
  getVendorProducts: (vendorId, page = 1) => {
    return apiClient.get(`/vendors/${vendorId}/products`, {
      params: { page },
    });
  },

  // Créer un produit (vendeur)
  createProduct: (data) => {
    return apiClient.post('/products', data);
  },

  // Mettre à jour un produit
  updateProduct: (id, data) => {
    return apiClient.put(`/products/${id}`, data);
  },

  // Supprimer un produit
  deleteProduct: (id) => {
    return apiClient.delete(`/products/${id}`);
  },

  // Ajouter aux favoris
  addToFavorites: (productId) => {
    return apiClient.post(`/products/${productId}/favorite`);
  },

  // Retirer des favoris
  removeFromFavorites: (productId) => {
    return apiClient.delete(`/products/${productId}/favorite`);
  },

  // Obtenir les catégories
  getCategories: () => {
    return apiClient.get('/categories');
  },
};

export default productService;
