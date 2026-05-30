import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider, CartContext } from './context/CartContext';
import CartPage from './pages/CartPage';
import NotificationBell from './components/NotificationBell';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import './styles/App.css';

// Garde de route admin — redirige si non admin
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppNav = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { items } = useContext(CartContext);
  const cartCount = items.reduce((sum, item) => sum + item.quantite, 0);

  const handleLogout = async () => {
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return;
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="app-logo">MERCATO NOVA</Link>
        <nav>
          <Link to="/">Accueil</Link>
          <Link to="/catalogue">Catalogue</Link>
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user.id}`} className="nav-profile-link">
                {user.prenom} {user.nom}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-admin-link">⚙️</Link>
              )}
              <NotificationBell />
              {user.role === 'acheteur' && (
                <Link to="/panier" className="nav-cart-link">
                  🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              )}
              <button onClick={handleLogout} className="nav-logout-btn">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register" className="nav-register-btn">S'inscrire</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const AppWithCart = ({ children }) => {
  const { user } = useContext(AuthContext);
  return <CartProvider user={user}>{children}</CartProvider>;
};

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <AppWithCart>
          <Router>
            <div className="app">
              <AppNav />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogue" element={<CatalogPage />} />
                  <Route path="/panier" element={<CartPage />} />
                  <Route path="/products/:productId" element={<ProductDetailPage />} />
                  <Route path="/checkout/:productId" element={<CheckoutPage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin" element={
                    <AdminRoute><AdminPage /></AdminRoute>
                  } />
                </Routes>
              </main>
              <footer className="app-footer">
                <p>© 2026 Mercato Nova. Tous droits réservés.</p>
              </footer>
            </div>
          </Router>
        </AppWithCart>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;