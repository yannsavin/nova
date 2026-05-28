import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';
import '../styles/AdminPage.css';

const ROLE_LABELS  = { admin: 'Admin', vendeur: 'Vendeur', acheteur: 'Acheteur' };
const ETAT_LABELS  = { active: 'Actif', vendue: 'Vendu', archived: 'Archivé', enchere_active: 'Enchère' };
const ETAT_COLORS  = { active: '#27ae60', vendue: '#3498db', archived: '#e74c3c', enchere_active: '#f39c12' };
const STATUT_COLORS = { actif: '#27ae60', inactif: '#e74c3c' };

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [tab, setTab]           = useState('users');
  const [productFilter, setProductFilter] = useState('active');
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data.data?.users || []);
    } catch { showToast('Erreur chargement utilisateurs', 'error'); }
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts();
      setProducts(res.data.data?.products || []);
    } catch { showToast('Erreur chargement produits', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadProducts();
  }, [tab]);

  const handleUserUpdate = async (id, field, value) => {
    try {
      await adminService.updateUser(id, { [field]: value });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
      showToast('Utilisateur mis à jour');
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleHide = async (id) => {
    try {
      await adminService.hideProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, etat: 'archived' } : p));
      showToast('Annonce masquée');
    } catch { showToast('Erreur', 'error'); }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, etat: 'active' } : p));
      showToast('Annonce réactivée');
    } catch { showToast('Erreur', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cette annonce ?')) return;
    try {
      await adminService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Annonce supprimée');
    } catch { showToast('Erreur', 'error'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  return (
    <div className="adm-page">
      {toast && <div className={`adm-toast adm-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="adm-header">
        <h1>Administration</h1>
        <p>Connecté en tant que <strong>{user?.prenom} {user?.nom}</strong></p>
      </div>

      <div className="adm-tabs">
        <button className={`adm-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Utilisateurs <span className="adm-tab-count">{users.length}</span>
        </button>
        <button className={`adm-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          Annonces <span className="adm-tab-count">{products.length}</span>
        </button>
      </div>

      <div className="adm-body">
        {loading && <div className="adm-loading">Chargement...</div>}

        {!loading && tab === 'users' && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Ventes / Achats</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.statut === 'inactif' ? 'adm-row-banned' : ''}>
                    <td className="adm-id">{u.id}</td>
                    <td><strong>{u.prenom} {u.nom}</strong></td>
                    <td className="adm-email">{u.email}</td>
                    <td>
                      <select
                        className="adm-select"
                        value={u.role}
                        disabled={u.id === user?.id}
                        onChange={e => handleUserUpdate(u.id, 'role', e.target.value)}
                      >
                        <option value="acheteur">Acheteur</option>
                        <option value="vendeur">Vendeur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className="adm-badge" style={{ background: STATUT_COLORS[u.statut] }}>
                        {u.statut}
                      </span>
                    </td>
                    <td className="adm-center">{u.nombre_ventes} / {u.nombre_achats}</td>
                    <td>{formatDate(u.date_inscription)}</td>
                    <td className="adm-actions">
                      {u.id !== user?.id && (
                        u.statut === 'actif' ? (
                          <button
                            className="adm-btn adm-btn-danger"
                            onClick={() => handleUserUpdate(u.id, 'statut', 'inactif')}
                          >Bannir</button>
                        ) : (
                          <button
                            className="adm-btn adm-btn-success"
                            onClick={() => handleUserUpdate(u.id, 'statut', 'actif')}
                          >Réactiver</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'products' && (
          <div>
            <div className="adm-product-filters">
              <button
                className={`adm-filter-btn ${productFilter === 'active' ? 'active' : ''}`}
                onClick={() => setProductFilter('active')}
              >
                Actives ({products.filter(p => p.etat === 'active' || p.etat === 'enchere_active').length})
              </button>
              <button
                className={`adm-filter-btn ${productFilter === 'archive' ? 'active' : ''}`}
                onClick={() => setProductFilter('archive')}
              >
                Vendues / Masquées ({products.filter(p => p.etat === 'vendue' || p.etat === 'archived').length})
              </button>
            </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Titre</th>
                  <th>Vendeur</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>État</th>
                  <th>Publié le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p => productFilter === 'active'
                    ? (p.etat === 'active' || p.etat === 'enchere_active')
                    : (p.etat === 'vendue' || p.etat === 'archived')
                  )
                  .map(p => (
                  <tr key={p.id} className={p.etat === 'archived' ? 'adm-row-archived' : ''}>
                    <td className="adm-id">{p.id}</td>
                    <td>
                      <a href={`/products/${p.id}`} className="adm-link">{p.titre}</a>
                    </td>
                    <td>{p.vendeur_prenom} {p.vendeur_nom}</td>
                    <td>{p.categorie_nom}</td>
                    <td>{p.prix_achat_immediat ? `${p.prix_achat_immediat} €` : '—'}</td>
                    <td>
                      <span className="adm-badge" style={{ background: ETAT_COLORS[p.etat] || '#999' }}>
                        {ETAT_LABELS[p.etat] || p.etat}
                      </span>
                    </td>
                    <td>{formatDate(p.date_publication)}</td>
                    <td className="adm-actions">
                      {p.etat !== 'archived' && (
                        <button className="adm-btn adm-btn-warning" onClick={() => handleHide(p.id)}>
                          Masquer
                        </button>
                      )}
                      {p.etat === 'archived' && (
                        <button className="adm-btn adm-btn-success" onClick={() => handleRestore(p.id)}>
                          Restaurer
                        </button>
                      )}
                      <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(p.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
