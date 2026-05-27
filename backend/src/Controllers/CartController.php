<?php
// src/Controllers/CartController.php
// Contrôleur panier

class CartController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Ajouter un article au panier
    public function addItem() {
        try {
            $authMiddleware = new AuthMiddleware($this->db);
            $authMiddleware->require();

            $data = Security::getJSONInput();
            $user = $authMiddleware->getCurrentUser();

            // Validation
            if (empty($data['produit_id']) || empty($data['quantite'])) {
                Response::error('Données manquantes');
            }

            // Obtenir ou créer le panier
            $query = "SELECT id FROM paniers WHERE utilisateur_id = :utilisateur_id";
            $stmt = $this->db->prepare($query);
            $stmt->execute([':utilisateur_id' => $user['id']]);
            $panier = $stmt->fetch();

            if (!$panier) {
                $createQuery = "INSERT INTO paniers (utilisateur_id) VALUES (:utilisateur_id)";
                $createStmt = $this->db->prepare($createQuery);
                $createStmt->execute([':utilisateur_id' => $user['id']]);
                $panier_id = $this->db->lastInsertId();
            } else {
                $panier_id = $panier['id'];
            }

            // Obtenir le produit
            $prodQuery = "SELECT prix_achat_immediat FROM produits WHERE id = :id AND etat = 'active'";
            $prodStmt = $this->db->prepare($prodQuery);
            $prodStmt->execute([':id' => $data['produit_id']]);
            $produit = $prodStmt->fetch();

            if (!$produit) {
                Response::notFound('Produit non trouvé');
            }

            // Ajouter ou mettre à jour l'article dans le panier
            $checkQuery = "SELECT id, quantite FROM articles_panier WHERE panier_id = :panier_id AND produit_id = :produit_id";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([
                ':panier_id' => $panier_id,
                ':produit_id' => $data['produit_id'],
            ]);
            $article = $checkStmt->fetch();

            if ($article) {
                // Mettre à jour la quantité
                $updateQuery = "UPDATE articles_panier SET quantite = quantite + :quantite WHERE id = :id";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([
                    ':id' => $article['id'],
                    ':quantite' => $data['quantite'],
                ]);
            } else {
                // Ajouter un nouvel article
                $insertQuery = "INSERT INTO articles_panier (panier_id, produit_id, quantite, prix_unitaire) 
                               VALUES (:panier_id, :produit_id, :quantite, :prix_unitaire)";
                $insertStmt = $this->db->prepare($insertQuery);
                $insertStmt->execute([
                    ':panier_id' => $panier_id,
                    ':produit_id' => $data['produit_id'],
                    ':quantite' => $data['quantite'],
                    ':prix_unitaire' => $produit['prix_achat_immediat'],
                ]);
            }

            Response::success('Article ajouté au panier', null, 201);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
