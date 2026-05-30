import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/CartPage.css';

const CartPage = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const totalArticles = items.reduce((sum, i) => sum + i.quantite, 0);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Parcourez le catalogue pour ajouter des articles.</p>
        <Link to="/catalogue" className="cart-btn-primary">Voir le catalogue</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Mon Panier</h1>
        <span className="cart-count">{totalArticles} article{totalArticles > 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout">
        {/* Liste des articles */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image_principale ? `http://localhost:8000${item.image_principale}` : '/placeholder.jpg'}
                alt={item.titre}
                className="cart-item-img"
              />

              <div className="cart-item-info">
                <Link to={`/products/${item.id}`} className="cart-item-title">
                  {item.titre}
                </Link>
                <p className="cart-item-price-unit">
                  {Number(item.prix_unitaire).toFixed(2)} € / unité
                </p>
              </div>

              <div className="cart-item-qty">
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantite - 1)}>−</button>
                <span className="qty-value">
                  {item.quantite > 1
                    ? <><span className="qty-multiplier"></span>{item.quantite}</>
                    : item.quantite}
                </span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantite + 1)}>+</button>
              </div>

              <p className="cart-item-subtotal">
                {(item.prix_unitaire * item.quantite).toFixed(2)} €
              </p>

              <button className="cart-item-remove" onClick={() => removeItem(item.id)} title="Supprimer">✕</button>
            </div>
          ))}

          <button className="cart-btn-clear" onClick={clearCart}>Vider le panier</button>
        </div>

        {/* Récapitulatif */}
        <div className="cart-summary">
          <h2>Récapitulatif</h2>

          <div className="summary-lines">
            {items.map((item) => (
              <div key={item.id} className="summary-line">
                <span>
                  {item.titre.length > 25 ? item.titre.slice(0, 25) + '…' : item.titre}
                  {item.quantite > 1 && <span className="summary-qty"> ×{item.quantite}</span>}
                </span>
                <span>{(item.prix_unitaire * item.quantite).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{Number(total).toFixed(2)} €</strong>
          </div>

          <button className="cart-btn-primary cart-btn-checkout" onClick={() => navigate('/checkout/panier')}>
            Passer la commande
          </button>

          <Link to="/catalogue" className="cart-btn-secondary">Continuer mes achats</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;