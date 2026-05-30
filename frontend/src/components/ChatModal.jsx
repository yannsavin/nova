import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import negociationService from '../services/negociationService';
import '../styles/ChatModal.css';

const ChatModal = ({ product, onClose }) => {
  const { user } = useContext(AuthContext);
  const [negociationId, setNegociationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [prix, setPrix] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const isNego = product.type_vente === 'negociation';

  useEffect(() => {
    negociationService.getOrCreate(product.id)
      .then(res => {
        const id = res.data.data?.negociation_id;
        setNegociationId(id);
        return negociationService.getMessages(id);
      })
      .then(res => setMessages(res.data.data?.messages || []))
      .catch(() => setError('Impossible d\'ouvrir la conversation'))
      .finally(() => setLoading(false));
  }, [product.id]);

  // Poll toutes les 5s
  useEffect(() => {
    if (!negociationId) return;
    const iv = setInterval(() => {
      negociationService.getMessages(negociationId)
        .then(res => setMessages(res.data.data?.messages || []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, [negociationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !prix) return;
    setSending(true);
    try {
      await negociationService.sendMessage(negociationId, {
        message: text.trim(),
        prix_propose: prix !== '' ? prix : undefined,
      });
      setText('');
      setPrix('');
      const res = await negociationService.getMessages(negociationId);
      setMessages(res.data.data?.messages || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur envoi');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chat-modal">
        <div className="chat-header">
          <div className="chat-header-info">
            <span className="chat-product-name">{product.titre}</span>
            <span className="chat-type-badge">{
              product.type_vente === 'negociation' ? 'Négociation' :
              product.type_vente === 'encheres'    ? 'Enchère' : 'Contact vendeur'
            }</span>
          </div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {loading && <div className="chat-loading">Chargement...</div>}
          {error   && <div className="chat-error">{error}</div>}
          {!loading && messages.map(msg => {
            const isMe = msg.auteur_id === user?.id;
            return (
              <div key={msg.id} className={`chat-msg ${isMe ? 'chat-msg-me' : 'chat-msg-other'}`}>
                {!isMe && <span className="chat-sender">{msg.prenom} {msg.nom}</span>}
                {msg.action === 'contact' ? (
                  <div className="chat-system">{msg.message}</div>
                ) : (
                  <div className="chat-bubble">
                    {msg.prix_propose && (
                      <div className="chat-price-offer">
                        Offre : <strong>{Number(msg.prix_propose).toFixed(2)} €</strong>
                      </div>
                    )}
                    {msg.message && <p>{msg.message}</p>}
                  </div>
                )}
                <span className="chat-time">{formatTime(msg.date_creation)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          {isNego && (
            <input
              type="number"
              className="chat-price-input"
              placeholder="Proposer un prix (€)"
              value={prix}
              onChange={e => setPrix(e.target.value)}
              min="0"
              step="0.01"
            />
          )}
          <div className="chat-text-row">
            <input
              type="text"
              className="chat-text-input"
              placeholder="Votre message..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={sending || (!text.trim() && !prix)}>
              {sending ? '...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
