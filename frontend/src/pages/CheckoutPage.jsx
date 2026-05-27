import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaCreditCard, FaChevronLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import apiClient from '../services/apiClient';
import '../styles/CheckoutPage.css';

const formatNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
};

const CheckoutPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    productService.getProductById(productId)
      .then(res => setProduct(res.data.data?.product))
      .catch(() => setError('Produit introuvable'))
      .finally(() => setLoading(false));
  }, [productId, isAuthenticated]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCard(prev => ({
      ...prev,
      number: name === 'number' ? formatNumber(value) : prev.number,
      expiry: name === 'expiry' ? formatExpiry(value) : prev.expiry,
      cvv:    name === 'cvv'    ? value.replace(/\D/g, '').slice(0, 3) : prev.cvv,
      name:   name === 'name'   ? value : prev.name,
    }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (card.number.replace(/\s/g, '').length !== 16) {
      setError('Numéro de carte invalide (16 chiffres requis)');
      return;
    }
    if (card.expiry.length !== 5) {
      setError('Date d\'expiration invalide (MM/AA)');
      return;
    }
    if (card.cvv.length !== 3) {
      setError('CVV invalide (3 chiffres requis)');
      return;
    }
    setPaying(true);
    // Simulation d'un délai de traitement bancaire
    await new Promise(r => setTimeout(r, 1500));
    try {
      await apiClient.post('/orders', {
        produit_id: product.id,
        prix_total: product.prix_achat_immediat,
        type_transaction: 'achat_immediat',
      });
      setPaid(true);
      setTimeout(() => navigate(`/profile/${user.id}`), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
      setPaying(false);
    }
  };

  if (loading) return <div className="checkout-loading">Chargement...</div>;
  if (!product) return <div className="checkout-error">Produit introuvable.</div>;

  if (paid) {
    return (
      <div className="checkout-success">
        <FaCheckCircle className="success-icon" />
        <h2>Paiement accepté !</h2>
        <p>Votre achat de <strong>{product.titre}</strong> est confirmé.</p>
        <p className="success-redirect">Redirection vers votre profil...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Link to={`/products/${productId}`} className="checkout-back">
        <FaChevronLeft /> Retour au produit
      </Link>

      <div className="checkout-container">

        {/* Récap commande */}
        <div className="checkout-summary">
          <h2>Récapitulatif</h2>
          <div className="summary-product">
            {product.image_principale && (
              <img
                src={`http://localhost:8000${product.image_principale}`}
                alt={product.titre}
                className="summary-img"
              />
            )}
            <div className="summary-info">
              <p className="summary-title">{product.titre}</p>
              <p className="summary-seller">Vendu par {product.prenom} {product.nom}</p>
            </div>
          </div>
          <div className="summary-lines">
            <div className="summary-line">
              <span>Prix</span>
              <span>{Number(product.prix_achat_immediat).toFixed(2)} €</span>
            </div>
            <div className="summary-line">
              <span>Frais de livraison</span>
              <span>Gratuit</span>
            </div>
            <div className="summary-line summary-total">
              <span>Total</span>
              <span>{Number(product.prix_achat_immediat).toFixed(2)} €</span>
            </div>
          </div>
          <div className="summary-secure">
            <FaLock /> Paiement 100% sécurisé (simulation)
          </div>
        </div>

        {/* Formulaire paiement */}
        <div className="checkout-payment">
          <h2><FaCreditCard /> Paiement par carte</h2>

          {error && <div className="checkout-error-msg">{error}</div>}

          <form onSubmit={handlePay} className="payment-form">
            <div className="payment-field">
              <label>Titulaire de la carte</label>
              <input
                name="name"
                value={card.name}
                onChange={handleCardChange}
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div className="payment-field">
              <label>Numéro de carte</label>
              <div className="card-number-input">
                <input
                  name="number"
                  value={card.number}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  inputMode="numeric"
                />
                <FaCreditCard className="card-icon" />
              </div>
              <small className="test-hint">Test : 4242 4242 4242 4242</small>
            </div>

            <div className="payment-row">
              <div className="payment-field">
                <label>Date d'expiration</label>
                <input
                  name="expiry"
                  value={card.expiry}
                  onChange={handleCardChange}
                  placeholder="MM/AA"
                  required
                  inputMode="numeric"
                />
              </div>
              <div className="payment-field">
                <label>CVV</label>
                <input
                  name="cvv"
                  value={card.cvv}
                  onChange={handleCardChange}
                  placeholder="123"
                  required
                  inputMode="numeric"
                />
              </div>
            </div>

            <button type="submit" className="pay-btn" disabled={paying}>
              {paying ? (
                <span className="paying-spinner">Traitement en cours...</span>
              ) : (
                <><FaLock /> Payer {Number(product.prix_achat_immediat).toFixed(2)} €</>
              )}
            </button>
          </form>

          <p className="checkout-disclaimer">
            Ceci est une simulation — aucun vrai paiement ne sera effectué.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
