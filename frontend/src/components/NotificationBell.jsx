import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck } from 'react-icons/fa';
import notificationService from '../services/notificationService';
import '../styles/NotificationBell.css';

const TYPE_ICONS = {
  achat_confirme:  '🛍️',
  vente_confirmee: '💰',
  enchere:         '🔨',
  negociation:     '🤝',
  systeme:         'ℹ️',
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues]             = useState(0);
  const [open, setOpen]                   = useState(false);
  const dropdownRef                       = useRef(null);
  const navigate                          = useNavigate();

  const load = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data?.notifications || []);
      setNonLues(res.data.data?.non_lues || 0);
    } catch {
      // silencieux si non connecté
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (notif) => {
    if (!notif.lu) {
      await notificationService.markRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, lu: 1 } : n));
      setNonLues(prev => Math.max(0, prev - 1));
    }
    if (notif.lien) {
      setOpen(false);
      navigate(notif.lien);
    }
  };

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })));
    setNonLues(0);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${nonLues > 0 ? 'has-unread' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <FaBell />
        {nonLues > 0 && (
          <span className="notif-badge">{nonLues > 9 ? '9+' : nonLues}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            {nonLues > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAll}>
                <FaCheck /> Tout lire
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">Aucune notification</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.lu ? 'unread' : ''} ${notif.lien ? 'clickable' : ''}`}
                  onClick={() => handleMarkRead(notif)}
                >
                  <span className="notif-icon">
                    {TYPE_ICONS[notif.type] || 'ℹ️'}
                  </span>
                  <div className="notif-body">
                    <p className="notif-titre">{notif.titre}</p>
                    {notif.message && <p className="notif-message">{notif.message}</p>}
                    <p className="notif-date">{formatDate(notif.date_creation)}</p>
                  </div>
                  {!notif.lu && <span className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
