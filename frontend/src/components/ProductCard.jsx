import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';
import { FavoritesContext } from '../context/FavoritesContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const fav = isFavorite(product.id);

  const conditionLabels = {
    comme_neuf: 'Comme neuf', bon_etat: 'Bon état',
    acceptable: 'Acceptable', pour_pieces: 'Pour pièces',
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_principale ? `http://localhost:8000${product.image_principale}` : '/placeholder.jpg'}
            alt={product.titre}
            className="product-image"
          />
        </Link>
        <button
          className={`favorite-btn ${fav ? 'active' : ''}`}
          onClick={() => toggleFavorite(product)}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <FaHeart />
        </button>
      </div>

      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-title">
          {product.titre}
        </Link>

        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < Math.round(product.reputation || 4) ? 'star active' : 'star'} />
          ))}
        </div>

        <div className="product-price">
          {product.prix_achat_immediat ? (
            <>
              <span className="price">{Number(product.prix_achat_immediat).toFixed(2)} €</span>
              <span className="condition">
                {conditionLabels[product.condition] || product.condition}
              </span>
            </>
          ) : (
            <span className="no-price">Prix à négocier</span>
          )}
        </div>

        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="btn-view-product">
            Voir l'annonce
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
