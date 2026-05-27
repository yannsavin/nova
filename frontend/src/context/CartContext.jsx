// frontend/src/context/CartContext.jsx
// Contexte du panier

import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Charger le panier depuis le localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Mettre à jour le localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    calculateTotal();
  }, [items]);

  const calculateTotal = () => {
    const newTotal = items.reduce(
      (sum, item) => sum + item.prix_unitaire * item.quantite,
      0
    );
    setTotal(newTotal);
  };

  const addItem = (product, quantity = 1) => {
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.id === product.id
            ? { ...item, quantite: item.quantite + quantity }
            : item
        )
      );
    } else {
      setItems([...items, { ...product, quantite: quantity }]);
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
