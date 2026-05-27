<?php
// config/database.php
// Configuration de la base de données

class Database {
    private $host = 'localhost';
    private $db_name = 'mercato_nova';
    private $user = 'root';
    private $password = '';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4',
                $this->user,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Erreur de connexion: ' . $e->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
