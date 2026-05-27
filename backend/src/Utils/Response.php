<?php
// src/Utils/Response.php
// Classe pour formater les réponses API

class Response {
    
    private static function setCorsHeaders() {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
    
    public static function json($data, $statusCode = 200) {
        self::setCorsHeaders();
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($message = '', $data = null, $statusCode = 200) {
        $response = [
            'success' => true,
            'message' => $message,
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }

        self::json($response, $statusCode);
    }

    public static function error($message = '', $errors = null, $statusCode = 400) {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $statusCode);
    }

    public static function notFound($message = 'Ressource non trouvée') {
        self::error($message, null, 404);
    }

    public static function unauthorized($message = 'Non authentifié') {
        self::error($message, null, 401);
    }

    public static function forbidden($message = 'Accès refusé') {
        self::error($message, null, 403);
    }

    public static function serverError($message = 'Erreur serveur') {
        self::error($message, null, 500);
    }
}
