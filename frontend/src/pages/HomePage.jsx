import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import '../styles/HomePage.css';

const TYPE_CARDS = [
  { to: '/catalogue?type_vente=achat_immediat', icon: '🛒', label: 'Achat direct',  desc: 'Achetez immédiatement au prix affiché',      color: '#2980b9' },
  { to: '/catalogue?type_vente=encheres',       icon: '🔨', label: 'Enchères',       desc: 'Misez et remportez des objets rares',          color: '#8e44ad' },
  { to: '/catalogue?type_vente=negociation',    icon: '🤝', label: 'Négociation',    desc: 'Proposez votre prix, trouvez un accord',       color: '#16a085' },
];

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ limit: 8, sort: 'date_desc' })
      .then(res => setProducts(res.data.data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">

      {!isAuthenticated && (
        <section className="home-hero">
          <h1>Mercato Nova</h1>
          <p>La plateforme des objets rares — achat direct, enchères, négociation</p>
          <div className="home-hero-btns">
            <Link to="/catalogue" className="btn-hero-primary">Voir le catalogue</Link>
            <Link to="/register" className="btn-hero-secondary">Créer un compte</Link>
          </div>
        </section>
      )}

      <div className="home-stats">
        <div className="home-stat"><div className="home-stat-number">3</div><div className="home-stat-label">Modes de vente</div></div>
        <div className="home-stat"><div className="home-stat-number">100%</div><div className="home-stat-label">Sécurisé</div></div>
        <div className="home-stat"><div className="home-stat-number">FR</div><div className="home-stat-label">Français</div></div>
      </div>

      <div className="home-types">
        {TYPE_CARDS.map(t => (
          <Link key={t.to} to={t.to} className="home-type-card" style={{ borderTopColor: t.color }}>
            <div className="home-type-icon">{t.icon}</div>
            <h3>{t.label}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>

      <section className="home-section">
        <div className="home-section-header">
          <h2>Dernières annonces</h2>
          <Link to="/catalogue" className="home-see-all">Voir tout →</Link>
        </div>
        {loading ? (
          <div className="home-empty">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="home-empty">Aucune annonce pour le moment.</div>
        ) : (
          <div className="home-products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <div className="home-bottom-pad" />
    </div>
  );
};

export default HomePage;
