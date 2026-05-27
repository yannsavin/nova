<?php
// src/Middleware/AuthMiddleware.php
// Middleware d'authentification

class AuthMiddleware {
    
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Middleware pour vérifier l'authentification
    public function require() {
        session_start();
        
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('Veuillez vous authentifier');
        }
    }

    // Middleware pour vérifier un rôle spécifique
    public function requireRole($role) {
        session_start();
        
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('Veuillez vous authentifier');
        }

        if ($_SESSION['user_role'] !== $role && $_SESSION['user_role'] !== 'admin') {
            Response::forbidden('Accès réservé aux ' . $role . 's');
        }
    }

    // Middleware pour vérifier plusieurs rôles
    public function requireRoles($roles) {
        session_start();
        
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized('Veuillez vous authentifier');
        }

        if (!in_array($_SESSION['user_role'], $roles) && $_SESSION['user_role'] !== 'admin') {
            Response::forbidden('Accès non autorisé');
        }
    }

    // Obtenir l'utilisateur actuel
    public function getCurrentUser() {
        session_start();
        
        if (isset($_SESSION['user_id'])) {
            return [
                'id' => $_SESSION['user_id'],
                'email' => $_SESSION['user_email'],
                'role' => $_SESSION['user_role'],
                'nom' => $_SESSION['user_nom'] ?? '',
            ];
        }

        return null;
    }

    // Connexion utilisateur
    public function login($email, $password) {
        $query = "SELECT id, email, nom, prenom, mot_de_passe_hash, role, statut FROM utilisateurs WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':email' => $email]);
        
        $user = $stmt->fetch();

        if (!$user || !Security::verifyPassword($password, $user['mot_de_passe_hash'])) {
            return false;
        }

        if ($user['statut'] !== 'actif') {
            return false;
        }

        // Définir les variables de session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_nom'] = $user['nom'] . ' ' . $user['prenom'];

        return true;
    }

    // Déconnexion
    public function logout() {
        session_start();
        session_destroy();
    }
}
