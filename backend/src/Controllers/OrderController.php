<?php
// src/Controllers/OrderController.php
// Contrôleur commandes

class OrderController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Achat immédiat d'un produit
    public function createImmediate() {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $acheteurId = (int)$_SESSION['user_id'];
            $data = Security::getJSONInput();

            if (empty($data['produit_id'])) {
                Response::error('produit_id requis');
                return;
            }
            $produitId = (int)$data['produit_id'];

            // Charger le produit
            $stmt = $this->db->prepare("SELECT * FROM produits WHERE id = :id AND etat = 'active' AND type_vente = 'achat_immediat' LIMIT 1");
            $stmt->execute([':id' => $produitId]);
            $produit = $stmt->fetch();

            if (!$produit) {
                Response::error('Produit indisponible ou déjà vendu', null, 404);
                return;
            }
            if ((int)$produit['vendeur_id'] === $acheteurId) {
                Response::error('Vous ne pouvez pas acheter votre propre produit');
                return;
            }

            $vendeurId  = (int)$produit['vendeur_id'];
            $prix       = (float)$produit['prix_achat_immediat'];
            $numCmd     = 'CMD-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));

            // Créer la commande
            $this->db->prepare(
                "INSERT INTO commandes (numero_commande, acheteur_id, vendeur_id, produit_id, quantite, prix_unitaire, prix_total, type_transaction, statut, date_paiement_simule)
                 VALUES (:num, :acheteur, :vendeur, :produit, 1, :prix_u, :prix_t, 'achat_immediat', 'confirmee', NOW())"
            )->execute([
                ':num'     => $numCmd,
                ':acheteur'=> $acheteurId,
                ':vendeur' => $vendeurId,
                ':produit' => $produitId,
                ':prix_u'  => $prix,
                ':prix_t'  => $prix,
            ]);

            // Marquer le produit comme vendu
            $this->db->prepare("UPDATE produits SET etat = 'vendue' WHERE id = :id")
                     ->execute([':id' => $produitId]);

            // Incrémenter les compteurs
            $this->db->prepare("UPDATE utilisateurs SET nombre_ventes = nombre_ventes + 1 WHERE id = :id")
                     ->execute([':id' => $vendeurId]);
            $this->db->prepare("UPDATE utilisateurs SET nombre_achats = nombre_achats + 1 WHERE id = :id")
                     ->execute([':id' => $acheteurId]);

            // Notifications
            NotificationHelper::create(
                $this->db, $acheteurId, 'achat_confirme',
                'Achat confirmé',
                'Votre achat de "' . $produit['titre'] . '" est confirmé. Commande : ' . $numCmd,
                '/profile/' . $acheteurId
            );
            NotificationHelper::create(
                $this->db, $vendeurId, 'vente_confirmee',
                'Produit vendu !',
                'Votre annonce "' . $produit['titre'] . '" a été achetée. Commande : ' . $numCmd,
                '/profile/' . $vendeurId
            );

            Response::success('Achat confirmé', ['numero_commande' => $numCmd], 201);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Créer une commande à partir du panier
    public function create() {
        try {
            $authMiddleware = new AuthMiddleware($this->db);
            $authMiddleware->require();

            $user = $authMiddleware->getCurrentUser();
            $data = Security::getJSONInput();

            // Récupérer le panier de l'utilisateur
            $query = "SELECT ap.produit_id, ap.quantite, ap.prix_unitaire, p.vendeur_id, p.etat
                     FROM articles_panier ap
                     JOIN produits p ON ap.produit_id = p.id
                     WHERE ap.panier_id = (SELECT id FROM paniers WHERE utilisateur_id = :utilisateur_id)";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([':utilisateur_id' => $user['id']]);
            $articles = $stmt->fetchAll();

            if (empty($articles)) {
                Response::error('Panier vide');
            }

            // Commencer une transaction
            $this->db->beginTransaction();

            try {
                $commandeIds = [];

                // Créer une commande par vendeur
                foreach ($articles as $article) {
                    // Vérifier que le produit est disponible
                    if ($article['etat'] !== 'active') {
                        throw new Exception('Produit non disponible: ' . $article['produit_id']);
                    }

                    // Créer la commande
                    $numero = 'CMD-' . date('Y-m-d-') . uniqid();
                    $prix_total = $article['prix_unitaire'] * $article['quantite'];

                    $insertQuery = "INSERT INTO commandes 
                                   (numero_commande, acheteur_id, vendeur_id, produit_id, quantite, 
                                    prix_unitaire, prix_total, type_transaction, statut, date_commande)
                                   VALUES (:numero_commande, :acheteur_id, :vendeur_id, :produit_id, 
                                           :quantite, :prix_unitaire, :prix_total, :type_transaction, 'en_attente', NOW())";

                    $insertStmt = $this->db->prepare($insertQuery);
                    $insertStmt->execute([
                        ':numero_commande' => $numero,
                        ':acheteur_id' => $user['id'],
                        ':vendeur_id' => $article['vendeur_id'],
                        ':produit_id' => $article['produit_id'],
                        ':quantite' => $article['quantite'],
                        ':prix_unitaire' => $article['prix_unitaire'],
                        ':prix_total' => $prix_total,
                        ':type_transaction' => 'achat_immediat',
                    ]);

                    $commandeIds[] = $this->db->lastInsertId();

                    // Marquer le produit comme vendu
                    $updateQuery = "UPDATE produits SET etat = 'vendue', quantite = quantite - :quantite WHERE id = :id";
                    $updateStmt = $this->db->prepare($updateQuery);
                    $updateStmt->execute([
                        ':quantite' => $article['quantite'],
                        ':id' => $article['produit_id'],
                    ]);
                }

                // Vider le panier
                $deleteQuery = "DELETE FROM articles_panier WHERE panier_id = (SELECT id FROM paniers WHERE utilisateur_id = :utilisateur_id)";
                $deleteStmt = $this->db->prepare($deleteQuery);
                $deleteStmt->execute([':utilisateur_id' => $user['id']]);

                // Valider la transaction
                $this->db->commit();

                Response::success('Commandes créées avec succès', ['commande_ids' => $commandeIds], 201);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
