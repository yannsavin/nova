<?php
// src/Controllers/NotificationController.php

class NotificationController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // GET /api/notifications — notifications de l'utilisateur connecté
    public function getForUser() {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $userId = (int)$_SESSION['user_id'];

            $stmt = $this->db->prepare(
                "SELECT * FROM notifications
                 WHERE utilisateur_id = :uid
                 ORDER BY date_creation DESC
                 LIMIT 50"
            );
            $stmt->execute([':uid' => $userId]);
            $notifications = $stmt->fetchAll();

            $stmtCount = $this->db->prepare(
                "SELECT COUNT(*) FROM notifications WHERE utilisateur_id = :uid AND lu = 0"
            );
            $stmtCount->execute([':uid' => $userId]);
            $nonLues = (int)$stmtCount->fetchColumn();

            Response::success('Notifications récupérées', [
                'notifications' => $notifications,
                'non_lues'      => $nonLues,
            ]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // PUT /api/notifications/:id/read — marquer une notification comme lue
    public function markRead($id) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $userId = (int)$_SESSION['user_id'];

            $stmt = $this->db->prepare(
                "UPDATE notifications SET lu = 1
                 WHERE id = :id AND utilisateur_id = :uid"
            );
            $stmt->execute([':id' => (int)$id, ':uid' => $userId]);

            Response::success('Notification marquée comme lue');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // PUT /api/notifications/read-all — tout marquer comme lu
    public function markAllRead() {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $userId = (int)$_SESSION['user_id'];

            $stmt = $this->db->prepare(
                "UPDATE notifications SET lu = 1 WHERE utilisateur_id = :uid AND lu = 0"
            );
            $stmt->execute([':uid' => $userId]);

            Response::success('Toutes les notifications marquées comme lues');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
