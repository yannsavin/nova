<?php

class AuctionController {
    private $db;
    private $auctionModel;

    public function __construct($db) {
        $this->db = $db;
        $this->auctionModel = new Auction($db);
    }

    public function getAuction($productId) {
        try {
            $auction = $this->auctionModel->getByProductId($productId);
            if (!$auction) {
                Response::notFound('Aucune enchère trouvée pour ce produit');
                return;
            }

            if (Auction::isExpired($auction['date_fin']) && $auction['statut'] === 'en_cours') {
                $this->auctionModel->closeExpiredAuction($auction['id']);
                $auction = $this->auctionModel->getByProductId($productId);
            }

            $history = $this->auctionModel->getHistory($auction['id']);
            Response::success('Enchère récupérée', [
                'auction' => $auction,
                'history' => $history,
                'is_open' => Auction::isAuctionOpen($auction['statut'], $auction['date_fin']),
            ]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    public function placeBid($productId) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $amount = isset($data['amount']) ? (float)$data['amount'] : null;

            if ($amount === null || $amount <= 0) {
                Response::error('Un montant valide est requis');
                return;
            }

            $auction = $this->auctionModel->getByProductId($productId);
            if (!$auction) {
                Response::notFound('Enchère introuvable');
                return;
            }

            if (!Auction::isAuctionOpen($auction['statut'], $auction['date_fin'])) {
                Response::error('L\'enchère est terminée', null, 409);
                return;
            }

            if (!Auction::isValidBidAmount((float)($auction['prix_actuel'] ?? $auction['prix_minimum']), $amount)) {
                Response::error('Le montant doit être strictement supérieur au prix actuel');
                return;
            }

            $result = $this->auctionModel->placeBid($auction['id'], $_SESSION['user_id'], $amount);
            Response::success('Offre enregistrée', $result, 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), null, 400);
        }
    }

    public function close($productId) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }

            $auction = $this->auctionModel->getByProductId($productId);
            if (!$auction) {
                Response::notFound('Enchère introuvable');
                return;
            }

            if ((int)$auction['vendeur_id'] !== (int)$_SESSION['user_id']) {
                Response::forbidden('Vous ne pouvez pas clôturer cette enchère');
                return;
            }

            $result = $this->auctionModel->closeAuctionNow($auction['id']);
            Response::success('Enchère clôturée', $result, 200);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    public function history($productId) {
        try {
            $auction = $this->auctionModel->getByProductId($productId);
            if (!$auction) {
                Response::notFound('Enchère introuvable');
                return;
            }

            Response::success('Historique des offres', [
                'auction_id' => (int)$auction['id'],
                'history' => $this->auctionModel->getHistory($auction['id']),
            ]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
