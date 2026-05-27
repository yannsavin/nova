import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthPages.css';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    mot_de_passe: '',
    confirmation: '',
    role: 'acheteur',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.mot_de_passe !== formData.confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result?.success) {
      setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Créer un compte</h2>
        <p className="auth-subtitle">Rejoignez la communauté Mercato Nova</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                placeholder="Jean"
                minLength={2}
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Dupont"
                minLength={2}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.fr"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Je souhaite</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="acheteur">Acheter des objets (acheteur)</option>
              <option value="vendeur">Vendre des objets (vendeur)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="mot_de_passe"
                value={formData.mot_de_passe}
                onChange={handleChange}
                required
                placeholder="Minimum 8 caractères"
                minLength={8}
                autoComplete="new-password"
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <div className="input-password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmation"
                value={formData.confirmation}
                onChange={handleChange}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
