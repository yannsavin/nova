import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaStar, FaChevronLeft, FaChevronRight, FaBolt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import productService from '../services/productService';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    productService.getProductById(productId)
      .then(res => setProduct(res.data.data?.product))
      .catch(() => setError('Erreur lors du chargement du produit'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <div className="product-detail-loading">Chargement du produit...</div>;
  if (error)   return <div className="product-detail-error">{error}</div>;
  if (!product) return <div className="product-detail-not-found">Produit non trouvé</div>;

  const toAbsolute = (path) => path ? `http://localhost:8000${path}` : '/placeholder.jpg';
  const images = product.images && product.images.length > 0
    ? [toAbsolute(product.image_principale), ...product.images.map(toAbsolute)]
    : product.image_principale ? [toAbsolute(product.image_principale)] : ['/placeholder.jpg'];

  const fav = isFavorite(product.id);
  const isOwner = isAuthenticated && user?.id === product.vendeur_id;
  const canBuy  = isAuthenticated && !isOwner && product.type_vente === 'achat_immediat' && product.etat === 'active';

  const handleBuy = () => navigate(`/checkout/${product.id}`);
  const handleFav = () => toggleFavorite(product);

  const conditionLabels = {
    comme_neuf: 'Comme neuf', bon_etat: 'Bon état',
    acceptable: 'Acceptable', pour_pieces: 'Pour pièces',
  };

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaChevronLeft /> Retour
      </button>

      <div className="product-detail-container">
        {/* Galerie */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={images[currentImageIndex]} alt={product.titre} />
            {images.length > 1 && (
              <>
                <button className="gallery-btn prev" onClick={() => setCurrentImageIndex(p => (p - 1 + images.length) % images.length)}>
                  <FaChevronLeft />
                </button>
                <button className="gallery-btn next" onClick={() => setCurrentImageIndex(p => (p + 1) % images.length)}>
                  <FaChevronRight />
                </button>
              </>
            )}
            {images.length > 1 && (
              <span className="image-counter">{currentImageIndex + 1} / {images.length}</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, idx) => (
                <img key={idx} src={img} alt="" className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)} />
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="product-info">
          <h1>{product.titre}</h1>

          <div className="product-meta">
            <span className="category-badge">{product.categorie_nom}</span>
            <span className={`condition-badge condition-${product.condition}`}>
              {conditionLabels[product.condition] || product.condition}
            </span>
          </div>

          {/* Vendeur */}
          <div className="seller-info">
            <Link to={`/profile/${product.vendeur_id}`} className="seller-card">
              <div className="seller-avatar-sm">{product.prenom?.[0]}{product.nom?.[0]}</div>
              <div>
                <p className="seller-name">{product.prenom} {product.nom}</p>
                <div className="seller-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.round(product.reputation || 4) ? 'star active' : 'star'} />
                  ))}
                  <span className="rating-text">{Number(product.reputation || 5).toFixed(1)}/5</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Prix */}
          <div className="price-section">
            <span className="price">
              {product.prix_achat_immediat ? `${Number(product.prix_achat_immediat).toFixed(2)} €` : 'Prix à négocier'}
            </span>
            {product.type_vente === 'achat_immediat' && <span className="price-label">Prix fixe</span>}
            {product.type_vente === 'encheres'       && <span className="price-label auction">Enchère en cours</span>}
            {product.type_vente === 'negociation'    && <span className="price-label nego">Prix négociable</span>}
          </div>

          {/* Actions */}
          <div className="purchase-actions">
            {product.etat === 'vendue' && (
              <div className="sold-banner">Ce produit a été vendu</div>
            )}

            {canBuy && (
              <button className="btn-buy-now" onClick={handleBuy}>
                <FaBolt /> Acheter maintenant
              </button>
            )}

            {isAuthenticated && !isOwner && product.etat === 'active' && product.type_vente !== 'achat_immediat' && (
              <button className="btn-contact">Contacter le vendeur</button>
            )}

            {!isAuthenticated && (
              <p className="login-to-buy">
                <Link to="/login">Connectez-vous</Link> pour acheter ce produit
              </p>
            )}

            <button className={`favorite-toggle ${fav ? 'active' : ''}`} onClick={handleFav}>
              <FaHeart /> {fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>

          <div className="product-views">👁 {product.nombre_vues || 0} vues</div>
        </div>
      </div>

      {/* Description */}
      <div className="product-description-section">
        <h2>Description</h2>
        <p>{product.description || 'Aucune description disponible.'}</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
