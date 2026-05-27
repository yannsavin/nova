import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({ limit: 12 });
        if (response.data.success) {
          setProducts(response.data.data.products);
        }
      } catch (err) {
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="home-page">
      <section className="banner">
        <h1>Bienvenue sur Mercato Nova</h1>
        <p>La plateforme des objets rares et artisanaux</p>
      </section>

      <section className="products-section">
        <h2>Derniers Produits</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
