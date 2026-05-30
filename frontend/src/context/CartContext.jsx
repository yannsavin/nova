// frontend/src/context/CartContext.jsx
// Contexte du panier

import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children, user }) => {
  const cartKey = user?.id ? `cart_${user.id}` : 'cart_guest';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Charger le bon panier quand l'utilisateur change
  useEffect(() => {
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, [cartKey]);

  // Mettre à jour le localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(items));
    calculateTotal();
  }, [items, cartKey]);

  const calculateTotal = () => {
    const newTotal = items.reduce(
      (sum, item) => sum + item.prix_unitaire * item.quantite,
      0
    );
    setTotal(newTotal);
  };

  const addItem = (product, quantity = 1) => {
    const existingItem = items.find((item) => item.id === product.id);
    const prix_unitaire = product.prix_unitaire ?? product.prix_achat_immediat ?? 0;

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.id === product.id
            ? { ...item, quantite: item.quantite + quantity }
            : item
        )
      );
    } else {
      setItems([...items, { ...product, prix_unitaire, quantite: quantity }]);
    }
  };

  const removeItem = (productId) => {
    setItems(items.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems(
        items.map((item) =>
          item.id === productId ? { ...item, quantite: quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};