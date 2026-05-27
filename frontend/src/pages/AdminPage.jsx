// frontend/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import setupService from '../services/setupService';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleGenerateDemo = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Génération en cours...');

      const response = await setupService.generateDemoProducts();
      
      if (response.data.success) {
        setStatus(`✅ ${response.data.data.created} produits créés!`);
        setTimeout(() => navigate('/catalogue'), 2000);
      } else {
        setError('Erreur: ' + (response.data.message || 'Erreur inconnue'));
      }
    } catch (err) {
      setError('Erreur lors de la génération: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Génération des images en cours...');

      const response = await setupService.generateImages();
      
      if (response.data.success) {
        setStatus(`✅ ${response.data.data.generated} images générées!`);
        setTimeout(() => navigate('/catalogue'), 2000);
      } else {
        setError('Erreur: ' + (response.data.message || 'Erreur inconnue'));
      }
    } catch (err) {
      setError('Erreur: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>🔧 Administration Nova</h1>
        
        <div className="admin-section">
          <h2>Initialisation des données</h2>
          <p>Générez les produits de démonstration pour tester le site</p>
          
          <button 
            onClick={handleGenerateDemo}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ En cours...' : '🚀 Générer Produits de Démo'}
          </button>

          <button 
            onClick={handleGenerateImages}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? '⏳ En cours...' : '🖼️ Générer Images'}
          </button>
        </div>

        {status && <div className="status-message success">{status}</div>}
        {error && <div className="status-message error">{error}</div>}

        <div className="admin-info">
          <h3>ℹ️ Informations</h3>
          <ul>
            <li>Produits existants: Consultez le catalogue</li>
            <li>API Backend: http://localhost:8000</li>
            <li>Frontend: http://localhost:3000</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
