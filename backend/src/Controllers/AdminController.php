<?php
// src/Controllers/AdminController.php

class AdminController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    private function requireAdmin() {
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
            Response::unauthorized('Accès réservé aux administrateurs');
            exit;
        }
    }

    // GET /api/admin/users — liste tous les utilisateurs
    public function listUsers() {
        $this->requireAdmin();
        try {
            $stmt = $this->db->prepare(
                "SELECT id, email, nom, prenom, role, statut, reputation,
                        nombre_ventes, nombre_achats, date_inscription
                 FROM utilisateurs
                 ORDER BY date_inscription DESC"
            );
            $stmt->execute();
            Response::success('Utilisateurs récupérés', ['users' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // PUT /api/admin/users/:id — modifier rôle ou statut d'un utilisateur
    public function updateUser($id) {
        $this->requireAdmin();
        try {
            $data    = Security::getJSONInput();
            $targetId = (int)$id;

            // Empêcher de modifier son propre compte
            if ($targetId === (int)$_SESSION['user_id']) {
                Response::error('Vous ne pouvez pas modifier votre propre compte');
                return;
            }

            $allowed = ['role' => ['admin','vendeur','acheteur'], 'statut' => ['actif','inactif']];
            $sets    = [];
            $params  = [':id' => $targetId];

            foreach ($allowed as $field => $values) {
                if (isset($data[$field]) && in_array($data[$field], $values)) {
                    $sets[]        = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($sets)) {
                Response::error('Aucun champ valide à modifier');
                return;
            }

            $this->db->prepare(
                "UPDATE utilisateurs SET " . implode(', ', $sets) . " WHERE id = :id"
            )->execute($params);

            Response::success('Utilisateur mis à jour');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // GET /api/admin/products — liste tous les produits (actifs + archivés)
    public function listProducts() {
        $this->requireAdmin();
        try {
            $stmt = $this->db->prepare(
                "SELECT p.id, p.titre, p.etat, p.type_vente, p.prix_achat_immediat,
                        p.date_publication, p.image_principale,
                        u.nom AS vendeur_nom, u.prenom AS vendeur_prenom, u.id AS vendeur_id,
                        c.nom AS categorie_nom
                 FROM produits p
                 JOIN utilisateurs u ON p.vendeur_id = u.id
                 JOIN categories c   ON p.categorie_id = c.id
                 WHERE p.date_suppression IS NULL
                 ORDER BY p.date_publication DESC
                 LIMIT 200"
            );
            $stmt->execute();
            Response::success('Produits récupérés', ['products' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // PUT /api/admin/products/:id/hide — masquer une annonce (passer en archived)
    public function hideProduct($id) {
        $this->requireAdmin();
        try {
            $this->db->prepare(
                "UPDATE produits SET etat = 'archived' WHERE id = :id"
            )->execute([':id' => (int)$id]);
            Response::success('Annonce masquée');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // DELETE /api/admin/products/:id — supprimer définitivement une annonce
    public function deleteProduct($id) {
        $this->requireAdmin();
        try {
            $this->db->prepare(
                "UPDATE produits SET date_suppression = NOW(), etat = 'archived' WHERE id = :id"
            )->execute([':id' => (int)$id]);
            Response::success('Annonce supprimée');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // PUT /api/admin/products/:id/restore — réactiver une annonce masquée
    public function restoreProduct($id) {
        $this->requireAdmin();
        try {
            $this->db->prepare(
                "UPDATE produits SET etat = 'active', date_suppression = NULL WHERE id = :id"
            )->execute([':id' => (int)$id]);
            Response::success('Annonce réactivée');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
