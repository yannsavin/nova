<?php

class NegociationController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('Connexion requise');
            exit;
        }
        return (int)$_SESSION['user_id'];
    }

    // POST /api/negociations/product/:produitId — ouvre ou récupère une conversation
    public function getOrCreate($produitId) {
        $userId = $this->requireAuth();
        try {
            $produitId = (int)$produitId;

            $prod = $this->db->prepare("SELECT id, vendeur_id, titre FROM produits WHERE id = :id LIMIT 1");
            $prod->execute([':id' => $produitId]);
            $produit = $prod->fetch();

            if (!$produit) { Response::notFound('Produit introuvable'); return; }
            if ((int)$produit['vendeur_id'] === $userId) {
                Response::error('Vous ne pouvez pas vous contacter vous-même'); return;
            }

            $vendeurId = (int)$produit['vendeur_id'];

            // Chercher une négociation existante
            $exist = $this->db->prepare(
                "SELECT id FROM negociations WHERE produit_id = :pid AND acheteur_id = :aid AND statut != 'annulee' LIMIT 1"
            );
            $exist->execute([':pid' => $produitId, ':aid' => $userId]);
            $row = $exist->fetch();

            if ($row) {
                $negociationId = (int)$row['id'];
            } else {
                $this->db->prepare(
                    "INSERT INTO negociations (produit_id, acheteur_id, vendeur_id, prix_initial_propose, prix_actuellement_propose, dernier_proponent_id, statut, date_expiration)
                     VALUES (:pid, :aid, :vid, 0, 0, :dpid, 'en_cours', DATE_ADD(NOW(), INTERVAL 30 DAY))"
                )->execute([':pid' => $produitId, ':aid' => $userId, ':vid' => $vendeurId, ':dpid' => $userId]);

                $negociationId = (int)$this->db->lastInsertId();

                $this->db->prepare(
                    "INSERT INTO messages_negociation (negociation_id, auteur_id, message, action)
                     VALUES (:nid, :aid, :msg, 'contact')"
                )->execute([
                    ':nid' => $negociationId,
                    ':aid' => $userId,
                    ':msg' => 'Conversation ouverte pour "' . $produit['titre'] . '"',
                ]);
            }

            Response::success('Conversation prête', ['negociation_id' => $negociationId]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // GET /api/negociations/:id/messages
    public function getMessages($id) {
        $userId = $this->requireAuth();
        try {
            $negociationId = (int)$id;

            $check = $this->db->prepare("SELECT acheteur_id, vendeur_id FROM negociations WHERE id = :id LIMIT 1");
            $check->execute([':id' => $negociationId]);
            $neg = $check->fetch();

            if (!$neg || ((int)$neg['acheteur_id'] !== $userId && (int)$neg['vendeur_id'] !== $userId)) {
                Response::forbidden('Accès non autorisé'); return;
            }

            $msgs = $this->db->prepare(
                "SELECT m.id, m.auteur_id, m.message, m.prix_propose, m.action, m.date_creation,
                        u.nom, u.prenom
                 FROM messages_negociation m
                 JOIN utilisateurs u ON m.auteur_id = u.id
                 WHERE m.negociation_id = :nid
                 ORDER BY m.date_creation ASC"
            );
            $msgs->execute([':nid' => $negociationId]);

            Response::success('Messages', ['messages' => $msgs->fetchAll()]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // POST /api/negociations/:id/messages
    public function sendMessage($id) {
        $userId = $this->requireAuth();
        try {
            $negociationId = (int)$id;
            $data = Security::getJSONInput();

            $check = $this->db->prepare("SELECT acheteur_id, vendeur_id FROM negociations WHERE id = :id LIMIT 1");
            $check->execute([':id' => $negociationId]);
            $neg = $check->fetch();

            if (!$neg || ((int)$neg['acheteur_id'] !== $userId && (int)$neg['vendeur_id'] !== $userId)) {
                Response::forbidden('Accès non autorisé'); return;
            }

            $message    = trim($data['message'] ?? '');
            $prixPropose = (isset($data['prix_propose']) && $data['prix_propose'] !== '') ? (float)$data['prix_propose'] : null;
            $action     = $prixPropose !== null ? 'offre' : 'message';

            if ($message === '' && $prixPropose === null) {
                Response::error('Message ou prix requis'); return;
            }

            $this->db->prepare(
                "INSERT INTO messages_negociation (negociation_id, auteur_id, message, prix_propose, action)
                 VALUES (:nid, :aid, :msg, :prix, :action)"
            )->execute([
                ':nid'    => $negociationId,
                ':aid'    => $userId,
                ':msg'    => $message !== '' ? $message : null,
                ':prix'   => $prixPropose,
                ':action' => $action,
            ]);

            if ($prixPropose !== null) {
                $this->db->prepare(
                    "UPDATE negociations SET prix_actuellement_propose = :prix, dernier_proponent_id = :uid WHERE id = :id"
                )->execute([':prix' => $prixPropose, ':uid' => $userId, ':id' => $negociationId]);
            }

            $this->db->prepare("UPDATE negociations SET date_dernier_message = NOW() WHERE id = :id")
                     ->execute([':id' => $negociationId]);

            Response::success('Message envoyé');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // GET /api/negociations — conversations de l'utilisateur
    public function getUserNegociations() {
        $userId = $this->requireAuth();
        try {
            $stmt = $this->db->prepare(
                "SELECT n.id, n.statut, n.date_dernier_message, n.prix_actuellement_propose,
                        p.titre AS produit_titre, p.image_principale, p.id AS produit_id, p.type_vente,
                        u_a.nom AS acheteur_nom, u_a.prenom AS acheteur_prenom, u_a.id AS acheteur_id,
                        u_v.nom AS vendeur_nom, u_v.prenom AS vendeur_prenom, u_v.id AS vendeur_id
                 FROM negociations n
                 JOIN produits p ON n.produit_id = p.id
                 JOIN utilisateurs u_a ON n.acheteur_id = u_a.id
                 JOIN utilisateurs u_v ON n.vendeur_id = u_v.id
                 WHERE (n.acheteur_id = :uid1 OR n.vendeur_id = :uid2) AND n.statut != 'annulee'
                 ORDER BY n.date_dernier_message DESC"
            );
            $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);
            Response::success('Conversations', ['negociations' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
