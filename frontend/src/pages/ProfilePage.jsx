import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaEdit, FaSignOutAlt, FaPlus, FaTrash, FaEye, FaTimes, FaCheck, FaCamera, FaHeart } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import userService from '../services/userService';
import productService from '../services/productService';
import apiClient from '../services/apiClient';
import '../styles/ProfilePage.css';

const EMPTY_FORM = {
  titre: '', description: '', categorie_id: '', prix_achat_immediat: '',
  prix_depart: '', prix_maximum: '', date_fin: '',
  condition: 'bon_etat', type_vente: 'achat_immediat', quantite: 1,
};

const CONDITIONS = [
  { value: 'comme_neuf', label: 'Comme neuf' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'pour_pieces', label: 'Pour pièces' },
];

const TYPES_VENTE = [
  { value: 'achat_immediat', label: 'Achat immédiat' },
  { value: 'encheres', label: 'Enchères' },
  { value: 'negociation', label: 'Négociation' },
];

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);
  const { favoriteIds, toggleFavorite, removeStaleFavorites } = useContext(FavoritesContext);
  const isOwnProfile = authUser && authUser.id === parseInt(userId);

  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [favProducts, setFavProducts] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  // Formulaire produit
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const loadProducts = useCallback(async () => {
    const res = await productService.getVendorProducts(userId);
    setUserProducts(res.data.data?.products || []);
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await userService.getUserById(userId);
        setUser(res.data.data?.user);
        if (res.data.data?.user?.role === 'vendeur' || res.data.data?.user?.role === 'admin') {
          await loadProducts();
        }
        const catRes = await productService.getCategories();
        setCategories(catRes.data.data?.categories || []);
      } catch (err) {
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadProducts, userId]);

  const loadPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const res = await apiClient.get(`/users/${userId}/purchases`);
      setPurchases(res.data.data?.purchases || []);
    } catch {
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history' && isOwnProfile && purchases.length === 0) {
      loadPurchases();
    }
    if (tab === 'favorites' && isOwnProfile) {
      loadFavorites();
    }
  };

  const loadFavorites = async () => {
    if (favoriteIds.length === 0) { setFavProducts([]); return; }
    setFavLoading(true);
    try {
      const results = await Promise.all(
        favoriteIds.map(id => productService.getProductById(id).catch(() => null))
      );
      const active = results
        .filter(r => r?.data?.data?.product?.etat === 'active')
        .map(r => r.data.data.product);
      const validIds = active.map(p => p.id);
      if (validIds.length !== favoriteIds.length) removeStaleFavorites(validIds);
      setFavProducts(active);
    } catch {
      setFavProducts([]);
    } finally {
      setFavLoading(false);
    }
  };

  const getInitials = (prenom, nom) =>
    `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < Math.round(rating || 0) ? 'star active' : 'star'} />
    ));

  const resetImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    resetImages();
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      titre: product.titre || '',
      description: product.description || '',
      categorie_id: product.categorie_id || '',
      prix_achat_immediat: product.prix_achat_immediat || '',
      prix_depart: product.prix_achat_immediat || '',
      prix_maximum: product.prix_reserve_encheres || '',
      date_fin: product.date_fin_enchere || product.date_fin || '',
      condition: product.condition || 'bon_etat',
      type_vente: product.type_vente || 'achat_immediat',
      quantite: product.quantite || 1,
    });
    setFormError('');
    setFormSuccess('');
    resetImages();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    resetImages();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = 5 - imageFiles.length;
    const toAdd = selected.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);
    try {
      let productId = editingProduct?.id;
      const payload = { ...formData };
      if (payload.type_vente === 'encheres') {
        payload.prix_depart = payload.prix_depart ?? payload.prix_achat_immediat ?? 0;
        payload.prix_achat_immediat = Number(payload.prix_depart || 0);
        payload.prix_reserve_encheres = payload.prix_maximum !== '' && payload.prix_maximum != null ? Number(payload.prix_maximum) : null;
      }

      if (editingProduct) {
        await apiClient.put(`/products/${productId}`, payload);
      } else {
        const res = await apiClient.post('/products', payload);
        productId = res.data.data?.id;
      }

      // Upload des images si présentes
      if (imageFiles.length > 0 && productId) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images[]', f));
        await apiClient.post(`/products/${productId}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setFormSuccess(editingProduct ? 'Produit mis à jour !' : 'Produit publié !');
      await loadProducts();
      setTimeout(closeForm, 1200);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer "${product.titre}" ?`)) return;
    try {
      await apiClient.delete(`/products/${product.id}`);
      await loadProducts();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="profile-loading">Chargement du profil...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-not-found">Utilisateur non trouvé</div>;

  const isVendeur = user.role === 'vendeur' || user.role === 'admin';

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <div className="avatar-initials">{getInitials(user.prenom, user.nom)}</div>
            {user.role === 'vendeur' && <span className="seller-badge">Vendeur</span>}
            {user.role === 'admin' && <span className="admin-badge">Admin</span>}
          </div>

          <div className="profile-info-header">
            <h1>{user.prenom} {user.nom}</h1>
            <div className="rating">
              <div className="stars">{renderStars(user.reputation)}</div>
              <span className="rating-text">{Number(user.reputation || 5).toFixed(1)}/5</span>
            </div>
            <p className="member-since">Membre depuis {new Date(user.date_inscription).getFullYear()}</p>
            {user.bio && <p className="user-description">{user.bio}</p>}
            <div className="profile-stats">
              <div className="stat"><strong>{userProducts.length}</strong><span>Annonces</span></div>
              <div className="stat"><strong>{user.nombre_ventes || 0}</strong><span>Ventes</span></div>
              <div className="stat"><strong>{user.nombre_achats || 0}</strong><span>Achats</span></div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-actions">
              <button
                className="btn btn-danger"
                onClick={async () => { await logout(); navigate('/'); }}
              >
                <FaSignOutAlt /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="profile-tabs-nav">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => handleTabChange('info')}>
          Informations
        </button>
        {isVendeur && (
          <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')}>
            {isOwnProfile ? 'Mes produits' : 'Produits'} ({userProducts.length})
          </button>
        )}
        {isOwnProfile && (
          <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => handleTabChange('favorites')}>
            <FaHeart style={{marginRight:'0.3rem',fontSize:'0.8rem'}}/>Favoris ({favoriteIds.length})
          </button>
        )}
        {isOwnProfile && (
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleTabChange('history')}>
            Historique
          </button>
        )}
      </div>

      {/* CONTENU */}
      <div className="profile-content">

        {/* ONGLET INFO */}
        {activeTab === 'info' && (
          <div className="tab-content info-tab">
            <div className="info-grid">
              {isOwnProfile && (
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              )}
              <div className="info-item">
                <label>Rôle</label>
                <p style={{ textTransform: 'capitalize' }}>{user.role}</p>
              </div>
              <div className="info-item">
                <label>Téléphone</label>
                <p>{user.telephone || '—'}</p>
              </div>
              <div className="info-item">
                <label>Ville</label>
                <p>{user.ville || '—'}</p>
              </div>
              <div className="info-item">
                <label>Pays</label>
                <p>{user.pays || 'France'}</p>
              </div>
              {user.bio && (
                <div className="info-item info-item-full">
                  <label>Bio</label>
                  <p>{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET PRODUITS */}
        {activeTab === 'products' && isVendeur && (
          <div className="tab-content products-tab">

            {/* Bouton ajouter + formulaire (si profil propre) */}
            {isOwnProfile && (
              <>
                {!showForm ? (
                  <button className="btn-add-product" onClick={openAddForm}>
                    <FaPlus /> Ajouter un produit
                  </button>
                ) : (
                  <div className="product-form-card">
                    <div className="product-form-header">
                      <h3>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
                      <button className="close-form-btn" onClick={closeForm}><FaTimes /></button>
                    </div>

                    {formError && <div className="form-msg form-msg-error">{formError}</div>}
                    {formSuccess && <div className="form-msg form-msg-success"><FaCheck /> {formSuccess}</div>}

                    <form onSubmit={handleFormSubmit} className="product-form">
                      <div className="pf-row">
                        <div className="pf-group pf-grow">
                          <label>Titre *</label>
                          <input name="titre" value={formData.titre} onChange={handleFormChange} required placeholder="Ex: Montre vintage Omega 1965" />
                        </div>
                        <div className="pf-group">
                          <label>Catégorie *</label>
                          <select name="categorie_id" value={formData.categorie_id} onChange={handleFormChange} required>
                            <option value="">-- Choisir --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="pf-group">
                        <label>Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleFormChange} required rows={3} placeholder="Décrivez votre objet en détail..." />
                      </div>

                      <div className="pf-row">
                        <div className="pf-group">
                          <label>Type de vente</label>
                          <select name="type_vente" value={formData.type_vente} onChange={handleFormChange}>
                            {TYPES_VENTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div className="pf-group">
                          <label>{formData.type_vente === 'encheres' ? 'Prix de départ (€)' : 'Prix (€)'}</label>
                          <input
                            name={formData.type_vente === 'encheres' ? 'prix_depart' : 'prix_achat_immediat'}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.type_vente === 'encheres' ? formData.prix_depart : formData.prix_achat_immediat}
                            onChange={handleFormChange}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="pf-group">
                          <label>État</label>
                          <select name="condition" value={formData.condition} onChange={handleFormChange}>
                            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div className="pf-group pf-small">
                          <label>Quantité</label>
                          <input name="quantite" type="number" min="1" value={formData.quantite} onChange={handleFormChange} />
                        </div>
                      </div>

                      {formData.type_vente === 'encheres' && (
                        <div className="pf-row">
                          <div className="pf-group">
                            <label>Prix maximum / réserve (€)</label>
                            <input name="prix_maximum" type="number" min="0" step="0.01" value={formData.prix_maximum} onChange={handleFormChange} placeholder="0.00" />
                          </div>
                          <div className="pf-group">
                            <label>Date de fin</label>
                            <input name="date_fin" type="datetime-local" value={formData.date_fin} onChange={handleFormChange} />
                          </div>
                        </div>
                      )}

                      {/* Zone upload images */}
                      <div className="pf-group">
                        <label><FaCamera style={{marginRight:'0.3rem'}}/>Photos ({imageFiles.length}/5)</label>
                        <div
                          className="upload-zone"
                          onClick={() => imageFiles.length < 5 && fileInputRef.current.click()}
                          style={{ cursor: imageFiles.length < 5 ? 'pointer' : 'default' }}
                        >
                          {imagePreviews.length === 0 ? (
                            <div className="upload-placeholder">
                              <FaCamera className="upload-icon" />
                              <p>Cliquer pour ajouter des photos</p>
                              <small>JPG, PNG, WEBP · Max 5 Mo · Jusqu'à 5 photos</small>
                            </div>
                          ) : (
                            <div className="upload-previews">
                              {imagePreviews.map((src, idx) => (
                                <div key={idx} className="upload-preview-item">
                                  <img src={src} alt={`Aperçu ${idx + 1}`} />
                                  <button
                                    type="button"
                                    className="remove-preview-btn"
                                    onClick={e => { e.stopPropagation(); removeImage(idx); }}
                                  >
                                    <FaTimes />
                                  </button>
                                  {idx === 0 && <span className="main-photo-label">Principale</span>}
                                </div>
                              ))}
                              {imageFiles.length < 5 && (
                                <div className="upload-add-more">
                                  <FaPlus />
                                  <span>Ajouter</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>

                      <div className="pf-actions">
                        <button type="button" className="pf-btn-cancel" onClick={closeForm}>Annuler</button>
                        <button type="submit" className="pf-btn-submit" disabled={formLoading}>
                          {formLoading ? 'Sauvegarde...' : editingProduct ? 'Mettre à jour' : 'Publier'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}

            {/* Produits vendus (section séparée pour le propriétaire) */}
            {isOwnProfile && userProducts.filter(p => p.etat === 'vendue').length > 0 && (
              <div className="sold-section">
                <h3 className="sold-section-title">Vendus ({userProducts.filter(p => p.etat === 'vendue').length})</h3>
                <div className="products-grid-manage">
                  {userProducts.filter(p => p.etat === 'vendue').map(product => (
                    <div key={product.id} className="product-manage-card sold-card">
                      <div className="pmc-image">
                        {product.image_principale
                          ? <img src={`http://localhost:8000${product.image_principale}`} alt={product.titre} />
                          : <div className="pmc-no-image">📷</div>
                        }
                        <span className="pmc-type sold-badge">Vendu</span>
                      </div>
                      <div className="pmc-info">
                        <h4 className="pmc-title">{product.titre}</h4>
                        <div className="pmc-meta">
                          <span className="pmc-price">{product.prix_achat_immediat ? `${Number(product.prix_achat_immediat).toFixed(2)} €` : '—'}</span>
                        </div>
                      </div>
                      <div className="pmc-actions">
                        <Link to={`/products/${product.id}`} className="pmc-btn pmc-btn-view"><FaEye /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des produits actifs */}
            {userProducts.filter(p => p.etat === 'active').length === 0 ? (
              <div className="empty-products">
                <p>Aucun produit actif pour le moment.</p>
                {isOwnProfile && !showForm && <p>Clique sur "Ajouter un produit" pour commencer !</p>}
              </div>
            ) : (
              <div className="products-grid-manage">
                {userProducts.filter(p => p.etat === 'active').map(product => (
                  <div key={product.id} className="product-manage-card">
                    <div className="pmc-image">
                      {product.image_principale
                        ? <img src={`http://localhost:8000${product.image_principale}`} alt={product.titre} />
                        : <div className="pmc-no-image">📷</div>
                      }
                      <span className={`pmc-type type-${product.type_vente}`}>
                        {TYPES_VENTE.find(t => t.value === product.type_vente)?.label || product.type_vente}
                      </span>
                    </div>
                    <div className="pmc-info">
                      <h4 className="pmc-title">{product.titre}</h4>
                      <div className="pmc-meta">
                        <span className="pmc-price">
                          {product.prix_achat_immediat ? `${Number(product.prix_achat_immediat).toFixed(2)} €` : 'Prix libre'}
                        </span>
                        <span className="pmc-condition">
                          {CONDITIONS.find(c => c.value === product.condition)?.label || product.condition}
                        </span>
                      </div>
                      <div className="pmc-stats">
                        <span>👁 {product.nombre_vues || 0} vues</span>
                      </div>
                    </div>
                    <div className="pmc-actions">
                      <Link to={`/products/${product.id}`} className="pmc-btn pmc-btn-view" title="Voir">
                        <FaEye />
                      </Link>
                      {isOwnProfile && (
                        <>
                          <button className="pmc-btn pmc-btn-edit" onClick={() => openEditForm(product)} title="Modifier">
                            <FaEdit />
                          </button>
                          <button className="pmc-btn pmc-btn-delete" onClick={() => handleDelete(product)} title="Supprimer">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET FAVORIS */}
        {activeTab === 'favorites' && isOwnProfile && (
          <div className="tab-content favorites-tab">
            {favLoading ? (
              <p className="empty-message">Chargement des favoris...</p>
            ) : favProducts.length === 0 ? (
              <div className="empty-products">
                <p>Vous n'avez pas encore de favoris.</p>
                <p>Cliquez sur ❤️ sur une annonce pour l'ajouter ici.</p>
              </div>
            ) : (
              <div className="products-grid-manage">
                {favProducts.map(product => (
                  <div key={product.id} className="product-manage-card">
                    <div className="pmc-image">
                      {product.image_principale
                        ? <img src={`http://localhost:8000${product.image_principale}`} alt={product.titre} />
                        : <div className="pmc-no-image">📷</div>
                      }
                    </div>
                    <div className="pmc-info">
                      <h4 className="pmc-title">{product.titre}</h4>
                      <div className="pmc-meta">
                        <span className="pmc-price">
                          {product.prix_achat_immediat ? `${Number(product.prix_achat_immediat).toFixed(2)} €` : 'Prix libre'}
                        </span>
                      </div>
                    </div>
                    <div className="pmc-actions">
                      <Link to={`/products/${product.id}`} className="pmc-btn pmc-btn-view" title="Voir"><FaEye /></Link>
                      <button className="pmc-btn pmc-btn-delete" onClick={() => toggleFavorite(product.id)} title="Retirer des favoris">
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET HISTORIQUE */}
        {activeTab === 'history' && isOwnProfile && (
          <div className="tab-content history-tab">
            {purchasesLoading ? (
              <p className="empty-message">Chargement...</p>
            ) : purchases.length === 0 ? (
              <p className="empty-message">Aucun achat enregistré pour le moment.</p>
            ) : (
              <div className="purchases-list">
                {purchases.map(order => (
                  <div key={order.id} className="purchase-item">
                    <div className="purchase-img">
                      {order.image_principale
                        ? <img src={`http://localhost:8000${order.image_principale}`} alt={order.titre_produit} />
                        : <div className="pmc-no-image">📷</div>
                      }
                    </div>
                    <div className="purchase-info">
                      <p className="purchase-title">{order.titre_produit}</p>
                      <p className="purchase-seller">Vendeur : {order.vendeur_prenom} {order.vendeur_nom}</p>
                      <p className="purchase-date">{new Date(order.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="purchase-right">
                      <span className="purchase-price">{Number(order.prix_total).toFixed(2)} €</span>
                      <span className="purchase-status">Confirmé</span>
                      <Link to={`/products/${order.product_id}`} className="pmc-btn pmc-btn-view" style={{display:'inline-flex',padding:'0.4rem 0.8rem',borderRadius:'6px',border:'1px solid #eee',textDecoration:'none',color:'#2980b9',fontSize:'0.85rem',gap:'0.3rem',alignItems:'center'}}>
                        <FaEye /> Voir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
