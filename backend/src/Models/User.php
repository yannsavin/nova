<?php
// src/Models/User.php
// Modèle utilisateur

class User {
    protected $db;
    protected $table = 'utilisateurs';

    public function __construct($db) {
        $this->db = $db;
    }

    // Créer un utilisateur
    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                 (email, nom, prenom, mot_de_passe_hash, role) 
                 VALUES (:email, :nom, :prenom, :mot_de_passe_hash, :role)";

        $stmt = $this->db->prepare($query);

        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':nom', $data['nom']);
        $stmt->bindValue(':prenom', $data['prenom']);
        $stmt->bindValue(':mot_de_passe_hash', $data['mot_de_passe_hash']);
        $stmt->bindValue(':role', $data['role'] ?? 'acheteur');

        return $stmt->execute();
    }

    // Obtenir un utilisateur par ID
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    // Obtenir un utilisateur par email
    public function getByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    // Vérifier si un email existe
    public function emailExists($email) {
        return $this->getByEmail($email) !== false;
    }

    // Mettre à jour un utilisateur
    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $query = "UPDATE " . $this->table . " SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($query);

        return $stmt->execute($params);
    }

    // Obtenir le profil public d'un vendeur
    public function getPublicProfile($id) {
        $query = "SELECT id, nom, prenom, reputation, nombre_ventes, nombre_achats, 
                         bio, photo_profil, date_inscription FROM " . $this->table . " 
                  WHERE id = :id AND role = 'vendeur' LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    // Obtenir la réputation moyenne
    public function getAverageRating($userId) {
        $query = "SELECT AVG(note) as avg_rating, COUNT(*) as total_ratings 
                 FROM evaluations WHERE evalue_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetch();
    }
}
