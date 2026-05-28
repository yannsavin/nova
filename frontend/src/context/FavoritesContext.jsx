import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

const getKey = (userId) => `nova_favorites_${userId ?? 'guest'}`;

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.id ?? null;

  const [favoriteIds, setFavoriteIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getKey(userId))) || []; }
    catch { return []; }
  });

  // Recharge les favoris quand l'utilisateur change (connexion / déconnexion)
  useEffect(() => {
    try { setFavoriteIds(JSON.parse(localStorage.getItem(getKey(userId))) || []); }
    catch { setFavoriteIds([]); }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(getKey(userId), JSON.stringify(favoriteIds));
  }, [favoriteIds, userId]);

  const toggleFavorite = (product) => {
    const id = typeof product === 'object' ? product.id : product;
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFavorite = (productId) => favoriteIds.includes(productId);

  const removeStaleFavorites = (validIds) => {
    setFavoriteIds(prev => prev.filter(id => validIds.includes(id)));
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite, removeStaleFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};
