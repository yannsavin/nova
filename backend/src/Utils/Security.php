<?php
// src/Utils/Security.php
// Classe pour fonctions de sécurité

class Security {
    
    // Hacher un mot de passe
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    // Vérifier un mot de passe
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    // Générer un token CSRF
    public static function generateCSRFToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    // Vérifier un token CSRF
    public static function verifyCSRFToken($token) {
        return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    // Générer un token de confirmation (pour email, etc)
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    // Échapper les caractères spéciaux HTML
    public static function escape($data) {
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }

    // Valider les paramètres GET/POST
    public static function getInput($key, $default = '') {
        if (isset($_POST[$key])) {
            return trim($_POST[$key]);
        } elseif (isset($_GET[$key])) {
            return trim($_GET[$key]);
        }
        return $default;
    }

    // Obtenir les données JSON du corps de la requête
    public static function getJSONInput() {
        $json = file_get_contents('php://input');
        return json_decode($json, true) ?? [];
    }

    // Validation basique d'email
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    // Validation de l'URL
    public static function isValidURL($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    // Rate limiting basique (stocké en session)
    public static function checkRateLimit($key, $limit = 5, $window = 900) {
        if (!isset($_SESSION['rate_limit'][$key])) {
            $_SESSION['rate_limit'][$key] = [];
        }

        $now = time();
        $_SESSION['rate_limit'][$key] = array_filter(
            $_SESSION['rate_limit'][$key],
            fn($time) => $now - $time < $window
        );

        if (count($_SESSION['rate_limit'][$key]) >= $limit) {
            return false;
        }

        $_SESSION['rate_limit'][$key][] = $now;
        return true;
    }
}
