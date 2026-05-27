import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import '../styles/CatalogPage.css';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Filtres
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categorie_id: searchParams.get('categorie_id') || '',
    prix_min: searchParams.get('prix_min') || '',
    prix_max: searchParams.get('prix_max') || '',
    condition: searchParams.get('condition') || '',
    type_vente: searchParams.get('type_vente') || '',
    sort: searchParams.get('sort') || 'date_desc',
  });

  const [categories, setCategories] = useState([]);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response.data.data?.categories || []);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories', err);
      }
    };
    loadCategories();
  }, []);

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...filters,
          limit: 12,
          offset: (currentPage - 1) * 12,
        };

        // Nettoyer les paramètres vides
        Object.keys(params).forEach(
          (key) => (params[key] === '' || params[key] === null) && delete params[key]
        );

        const response = await productService.getProducts(params);
        setProducts(response.data.data?.products || []);
        setTotalProducts(response.data.data?.total || 0);

        // Mettre à jour l'URL
        setSearchParams({
          ...filters,
          page: currentPage,
        });
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, currentPage, setSearchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalProducts / 12);

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Catalogue Mercato Nova</h1>
        <p className="total-products">{totalProducts} produits trouvés</p>
      </div>

      <div className="catalog-container">
        {/* Barre de filtres */}
        <aside className="filters-sidebar">
          <h3>Filtres</h3>

          {/* Recherche */}
          <div className="filter-group">
            <label htmlFor="search">Recherche</label>
            <input
              id="search"
              type="text"
              name="q"
              placeholder="Rechercher..."
              value={filters.q}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>

          {/* Catégorie */}
          <div className="filter-group">
            <label htmlFor="categorie">Catégorie</label>
            <select
              id="categorie"
              name="categorie_id"
              value={filters.categorie_id}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div className="filter-group">
            <label>Prix</label>
            <div className="price-inputs">
              <input
                type="number"
                name="prix_min"
                placeholder="Min"
                value={filters.prix_min}
                onChange={handleFilterChange}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                name="prix_max"
                placeholder="Max"
                value={filters.prix_max}
                onChange={handleFilterChange}
                className="price-input"
              />
            </div>
          </div>

          {/* Condition */}
          <div className="filter-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Tous les états</option>
              <option value="neuf">Neuf</option>
              <option value="tres_bon_etat">Très bon état</option>
              <option value="bon_etat">Bon état</option>
              <option value="etat_acceptable">État acceptable</option>
              <option value="pour_pieces">Pour pièces</option>
            </select>
          </div>

          {/* Type de vente */}
          <div className="filter-group">
            <label htmlFor="type_vente">Type de vente</label>
            <select
              id="type_vente"
              name="type_vente"
              value={filters.type_vente}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Tous les types</option>
              <option value="achat_immediat">Achat immédiat</option>
              <option value="enchere">Enchère</option>
              <option value="negociation">Négociation</option>
            </select>
          </div>

          {/* Tri */}
          <div className="filter-group">
            <label htmlFor="sort">Trier par</label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="date_desc">Plus récent</option>
              <option value="date_asc">Plus ancien</option>
              <option value="prix_asc">Prix: croissant</option>
              <option value="prix_desc">Prix: décroissant</option>
              <option value="popularite">Plus populaire</option>
            </select>
          </div>

          {/* Bouton réinitialiser */}
          <button
            className="reset-filters-btn"
            onClick={() => {
              setFilters({
                q: '',
                categorie_id: '',
                prix_min: '',
                prix_max: '',
                condition: '',
                type_vente: '',
                sort: 'date_desc',
              });
              setCurrentPage(1);
            }}
          >
            Réinitialiser filtres
          </button>
        </aside>

        {/* Grille de produits */}
        <main className="products-main">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : products.length === 0 ? (
            <div className="no-products">Aucun produit trouvé</div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="pagination-btn"
                  >
                    ← Précédent
                  </button>

                  <div className="pagination-info">
                    Page {currentPage} sur {totalPages}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="pagination-btn"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
