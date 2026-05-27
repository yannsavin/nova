// frontend/src/context/AuthContext.jsx
// Contexte d'authentification

import React, { createContext, useState, useEffect } from 'react';
import userService from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Charger l'utilisateur courant au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await userService.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await userService.login(email, password);
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion',
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await userService.register(data);
      if (response.data.success) {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Erreur lors de l'inscription" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur lors de l'inscription",
      };
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
