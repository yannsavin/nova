import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';
import { FavoritesContext } from '../context/FavoritesContext';
import '../styles/ProductCard.css';

const CONDITION_CONFIG = {
  comme_neuf: { label: 'Comme neuf', color: '#1a7a3c' },
  bon_etat:   { label: 'Bon état',   color: '#2ecc71' },
  acceptable: { label: 'Acceptable', color: '#e67e22' },
  pour_pieces:{ label: 'Pour pièces',color: '#e74c3c' },
};

const VENTE_CONFIG = {
  achat_immediat: { label: 'Achat direct', color: '#2980b9' },
  encheres:       { label: 'Enchère',      color: '#8e44ad' },
  negociation:    { label: 'Négociation',  color: '#16a085' },
};

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const fav = isFavorite(product.id);

  const cond  = CONDITION_CONFIG[product.condition];
  const vente = VENTE_CONFIG[product.type_vente];
  const currentPrice = product.type_vente === 'encheres'
    ? (product.prix_actuel ?? product.prix_affiche ?? product.prix_achat_immediat ?? 0)
    : (product.prix_achat_immediat ?? 0);

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
          {product.type_vente === 'encheres'
            ? <span className="price">{Number(currentPrice).toFixed(2)} €</span>
            : product.prix_achat_immediat
              ? <span className="price">{Number(product.prix_achat_immediat).toFixed(2)} €</span>
              : <span className="no-price">Prix à négocier</span>
          }
        </div>
        {product.type_vente === 'encheres' && (
          <div className="product-auction-meta">
            <span className="auction-bid-count">🔨 {Number(product.nombre_encheres || 0)} offre(s)</span>
          </div>
        )}

        <div className="product-tags">
          {cond && (
            <span className="pc-tag" style={{ background: cond.color }}>
              {cond.label}
            </span>
          )}
          {vente && (
            <span className="pc-tag pc-tag-vente" style={{ background: vente.color }}>
              {vente.label}
            </span>
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
