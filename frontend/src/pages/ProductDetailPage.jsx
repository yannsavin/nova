import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaStar, FaChevronLeft, FaChevronRight, FaBolt, FaShoppingCart } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { CartContext } from '../context/CartContext';
import productService from '../services/productService';
import auctionService from '../services/auctionService';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { addItem } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [auction, setAuction] = useState(null);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidMessage, setBidMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [cartMsg, setCartMsg] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await productService.getProductById(productId);
        const currentProduct = res.data.data?.product || null;
        setProduct(currentProduct);

        if (currentProduct?.type_vente === 'encheres') {
          try {
            const auctionRes = await auctionService.getAuction(productId);
            setAuction(auctionRes.data?.data || null);
            setAuctionHistory(auctionRes.data?.data?.history || []);
          } catch {
            setAuction(null);
            setAuctionHistory([]);
          }
        }
      } catch {
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const currentAuctionPrice = auction?.auction?.prix_actuel ?? product?.prix_affiche ?? product?.prix_achat_immediat ?? 0;
  const auctionEnd = auction?.auction?.date_fin || product?.date_fin_enchere;

  useEffect(() => {
    if (!auctionEnd) return;
    const updateCountdown = () => {
      const diff = new Date(auctionEnd).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Enchère terminée');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [auctionEnd]);

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
  const canAddToCart = canBuy && user?.role === 'acheteur';

  const handleAddToCart = () => {
    addItem(product, 1);
    setCartMsg('Ajouté au panier !');
    setTimeout(() => setCartMsg(''), 2500);
  };

  const handleBuy = () => navigate(`/checkout/${product.id}`);

  const handleCloseAuction = async () => {
    try {
      setBidLoading(true);
      const res = await auctionService.closeAuction(product.id);
      setBidMessage(res.data?.message || 'Enchère clôturée');
      const updated = await auctionService.getAuction(product.id);
      setAuction(updated.data.data);
      setAuctionHistory(updated.data.data?.history || []);
    } catch (err) {
      setBidMessage(err.response?.data?.message || 'Impossible de clôturer l\'enchère');
    } finally {
      setBidLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setBidLoading(true);
    setBidMessage('');
    try {
      const res = await auctionService.placeBid(product.id, Number(bidAmount));
      setBidMessage(res.data?.message || 'Offre enregistrée');
      const updated = await auctionService.getAuction(product.id);
      setAuction(updated.data.data);
      setAuctionHistory(updated.data.data?.history || []);
      setBidAmount('');
    } catch (err) {
      setBidMessage(err.response?.data?.message || 'Impossible d\'enregistrer l\'offre');
    } finally {
      setBidLoading(false);
    }
  };

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
              {product.type_vente === 'encheres'
                ? `${Number(currentAuctionPrice).toFixed(2)} €`
                : product.prix_achat_immediat ? `${Number(product.prix_achat_immediat).toFixed(2)} €` : 'Prix à négocier'}
            </span>
            {product.type_vente === 'achat_immediat' && <span className="price-label">Prix fixe</span>}
            {product.type_vente === 'encheres'       && <span className="price-label auction">Enchère en cours</span>}
            {product.type_vente === 'negociation'    && <span className="price-label nego">Prix négociable</span>}
          </div>

          {product.type_vente === 'encheres' && (
            <div className="auction-box">
              <h3>Enchérir</h3>
              <p>Prix actuel : <strong>{Number(currentAuctionPrice).toFixed(2)} €</strong></p>
              <p>Offres enregistrées : <strong>{auction?.auction?.nombre_encheres || product.nombre_encheres || 0}</strong></p>
              <p>Fin de l’enchère : <strong>{timeLeft || '—'}</strong></p>
              <p className="auction-meta">{Number(product.nombre_encheres || auction?.auction?.nombre_encheres || 0)} offre(s) enregistrée(s)</p>
              <form onSubmit={handleBid} className="auction-bid-form">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Votre offre"
                />
                <button type="submit" disabled={bidLoading}>{bidLoading ? 'Envoi...' : 'Enchérir'}</button>
              </form>
              {isOwner && (
                <button type="button" className="btn-close-auction" onClick={handleCloseAuction} disabled={bidLoading}>
                  {bidLoading ? 'Clôture...' : 'Clôturer l’enchère'}
                </button>
              )}
              {bidMessage && <p className="auction-feedback">{bidMessage}</p>}
            </div>
          )}

          {product.type_vente === 'encheres' && (
            <div className="auction-history-box">
              <h3>Historique des offres</h3>
              {auctionHistory.length ? (
                <ul className="auction-history-list">
                  {auctionHistory.slice(0, 8).map(item => (
                    <li key={item.id}>
                      <span>{item.prenom} {item.nom}</span>
                      <strong>{Number(item.montant).toFixed(2)} €</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune offre n’a encore été enregistrée.</p>
              )}
            </div>
          )}

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

            {canAddToCart && (
              <button className="btn-add-to-cart" onClick={handleAddToCart}>
                <FaShoppingCart /> Ajouter au panier
              </button>
            )}
            {cartMsg && <p className="cart-feedback">{cartMsg}</p>}

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

      {product.type_vente === 'encheres' && auctionHistory.length > 0 && (
        <div className="product-description-section">
          <h2>Historique des enchères</h2>
          <ul className="auction-history-list">
            {auctionHistory.map((bid) => (
              <li key={bid.id} className="auction-history-item">
                <strong>{bid.prenom || ''} {bid.nom || ''}</strong>
                <span>{Number(bid.montant).toFixed(2)} €</span>
                <small>{new Date(bid.date_offre).toLocaleString('fr-FR')}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description */}
      <div className="product-description-section">
        <h2>Description</h2>
        <p>{product.description || 'Aucune description disponible.'}</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;