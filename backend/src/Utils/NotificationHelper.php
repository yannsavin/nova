<?php
// src/Utils/NotificationHelper.php
// Helper statique pour créer des notifications depuis n'importe quel contrôleur

class NotificationHelper {

    public static function create($db, $utilisateurId, $type, $titre, $message = null, $lien = null) {
        try {
            $stmt = $db->prepare(
                "INSERT INTO notifications (utilisateur_id, type, titre, message, lien)
                 VALUES (:uid, :type, :titre, :msg, :lien)"
            );
            $stmt->execute([
                ':uid'   => (int)$utilisateurId,
                ':type'  => $type,
                ':titre' => $titre,
                ':msg'   => $message,
                ':lien'  => $lien,
            ]);
        } catch (Exception $e) {
            // Ne pas bloquer l'action principale si la notif échoue
        }
    }
}
