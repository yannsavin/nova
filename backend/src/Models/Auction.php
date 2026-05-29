<?php

class Auction {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public static function isAuctionOpen($status, $dateFin): bool {
        if ($status !== 'en_cours') {
            return false;
        }

        return strtotime($dateFin) >= time();
    }

    public static function isValidBidAmount($currentPrice, $amount): bool {
        return (float)$amount > (float)$currentPrice;
    }

    public static function isExpired($dateFin): bool {
        return strtotime($dateFin) < time();
    }

    public function getByProductId($productId): ?array {
        $stmt = $this->db->prepare("SELECT a.*, p.titre, p.prix_achat_immediat, p.prix_reserve_encheres, p.vendeur_id
            FROM encheres a
            JOIN produits p ON p.id = a.produit_id
            WHERE a.produit_id = :product_id LIMIT 1");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetch() ?: null;
    }

    public function getHistory($auctionId): array {
        $stmt = $this->db->prepare("SELECT o.*, u.nom, u.prenom
            FROM offres_encheres o
            JOIN utilisateurs u ON u.id = o.encherisseur_id
            WHERE o.enchere_id = :auction_id
            ORDER BY o.date_offre DESC");
        $stmt->execute([':auction_id' => $auctionId]);
        return $stmt->fetchAll();
    }

    public function closeExpiredAuction($auctionId, $force = false): array {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("SELECT a.*, p.vendeur_id, p.etat, p.titre
                FROM encheres a
                JOIN produits p ON p.id = a.produit_id
                WHERE a.id = :auction_id FOR UPDATE");
            $stmt->execute([':auction_id' => $auctionId]);
            $auction = $stmt->fetch();

            if (!$auction) {
                throw new Exception('Enchère introuvable');
            }

            if ($auction['statut'] !== 'en_cours' || (!self::isExpired($auction['date_fin']) && !$force)) {
                $this->db->commit();
                return ['closed' => false, 'auction_id' => (int)$auctionId];
            }

            $winnerId = (int)($auction['meilleur_encherisseur_id'] ?? 0);
            $finalPrice = (float)($auction['prix_actuel'] ?? $auction['prix_minimum'] ?? 0);

            if ($winnerId > 0 && $finalPrice > 0) {
                $exists = $this->db->prepare("SELECT id FROM commandes WHERE reference_enchere_id = :auction_id LIMIT 1");
                $exists->execute([':auction_id' => $auctionId]);
                if (!$exists->fetch()) {
                    $numCmd = 'CMD-AUC-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));
                    $this->db->prepare("INSERT INTO commandes (numero_commande, acheteur_id, vendeur_id, produit_id, quantite, prix_unitaire, prix_total, type_transaction, statut, reference_enchere_id, date_paiement_simule)
                        VALUES (:num, :acheteur, :vendeur, :produit, 1, :prix, :prix, 'encheres', 'confirmee', :auction_id, NOW())")
                        ->execute([
                            ':num' => $numCmd,
                            ':acheteur' => $winnerId,
                            ':vendeur' => (int)$auction['vendeur_id'],
                            ':produit' => (int)$auction['produit_id'],
                            ':prix' => $finalPrice,
                            ':auction_id' => $auctionId,
                        ]);
                }

                $this->db->prepare("UPDATE produits SET etat = 'vendue' WHERE id = :product_id AND etat = 'active'")
                    ->execute([':product_id' => (int)$auction['produit_id']]);
                $this->db->prepare("UPDATE utilisateurs SET nombre_ventes = nombre_ventes + 1 WHERE id = :id")
                    ->execute([':id' => (int)$auction['vendeur_id']]);
                $this->db->prepare("UPDATE utilisateurs SET nombre_achats = nombre_achats + 1 WHERE id = :id")
                    ->execute([':id' => $winnerId]);
            }

            $this->db->prepare("UPDATE encheres SET statut = 'terminee' WHERE id = :auction_id")
                ->execute([':auction_id' => $auctionId]);

            $this->db->commit();
            return ['closed' => true, 'auction_id' => (int)$auctionId, 'winner_id' => $winnerId, 'price' => $finalPrice];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function closeAuctionNow($auctionId): array {
        return $this->closeExpiredAuction($auctionId, true);
    }

    public function placeBid($auctionId, $userId, $amount): array {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("SELECT a.*, p.vendeur_id FROM encheres a JOIN produits p ON p.id = a.produit_id WHERE a.id = :auction_id AND a.statut = 'en_cours' FOR UPDATE");
            $stmt->execute([':auction_id' => $auctionId]);
            $auction = $stmt->fetch();

            if (!$auction) {
                throw new Exception('Enchère introuvable ou terminée');
            }

            if (!self::isAuctionOpen($auction['statut'], $auction['date_fin'])) {
                throw new Exception('L\'enchère est terminée');
            }

            if ((int)$auction['vendeur_id'] === (int)$userId) {
                throw new Exception('Vous ne pouvez pas enchérir sur votre propre produit');
            }

            $currentPrice = (float)($auction['prix_actuel'] ?? $auction['prix_minimum']);
            if (!self::isValidBidAmount($currentPrice, $amount)) {
                throw new Exception('Le montant de l\'offre doit être supérieur au prix actuel');
            }

            $stmt = $this->db->prepare("INSERT INTO offres_encheres (enchere_id, encherisseur_id, montant) VALUES (:auction_id, :user_id, :amount)");
            $stmt->execute([':auction_id' => $auctionId, ':user_id' => $userId, ':amount' => $amount]);

            $this->db->prepare("UPDATE encheres SET prix_actuel = :amount, meilleur_encherisseur_id = :user_id, nombre_encheres = nombre_encheres + 1 WHERE id = :auction_id")
                ->execute([':amount' => $amount, ':user_id' => $userId, ':auction_id' => $auctionId]);

            $this->db->commit();

            return [
                'auction_id' => (int)$auctionId,
                'amount' => (float)$amount,
                'current_price' => (float)$amount,
                'bidder_id' => (int)$userId,
            ];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
