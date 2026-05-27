<?php
// src/Models/Product.php
// Modèle produit

class Product {
    protected $db;
    protected $table = 'produits';

    public function __construct($db) {
        $this->db = $db;
    }

    // Créer un produit
    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                 (titre, description, categorie_id, vendeur_id, prix_achat_immediat, 
                  condition, type_vente, quantite) 
                 VALUES (:titre, :description, :categorie_id, :vendeur_id, :prix_achat_immediat,
                         :condition, :type_vente, :quantite)";

        $stmt = $this->db->prepare($query);

        return $stmt->execute([
            ':titre' => $data['titre'],
            ':description' => $data['description'],
            ':categorie_id' => $data['categorie_id'],
            ':vendeur_id' => $data['vendeur_id'],
            ':prix_achat_immediat' => $data['prix_achat_immediat'] ?? null,
            ':condition' => $data['condition'] ?? 'bon_etat',
            ':type_vente' => $data['type_vente'] ?? 'achat_immediat',
            ':quantite' => $data['quantite'] ?? 1,
        ]);
    }

    // Obtenir un produit par ID
    public function getById($id) {
        $query = "SELECT p.*, u.nom, u.prenom, u.reputation, c.nom as categorie_nom
                 FROM " . $this->table . " p
                 JOIN utilisateurs u ON p.vendeur_id = u.id
                 JOIN categories c ON p.categorie_id = c.id
                 WHERE p.id = :id AND p.etat = 'active' LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    // Obtenir toutes les images d'un produit
    public function getImages($id) {
        $query = "SELECT chemin FROM images_produits WHERE produit_id = :id ORDER BY position ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // Rechercher les produits
    public function search($params = []) {
        $query = "SELECT p.*, u.nom, u.prenom, c.nom as categorie_nom
                 FROM " . $this->table . " p
                 JOIN utilisateurs u ON p.vendeur_id = u.id
                 JOIN categories c ON p.categorie_id = c.id
                 WHERE p.etat = 'active'";

        // Recherche texte (recherche simple sans FULLTEXT)
        if (!empty($params['q'])) {
            $query .= " AND (p.titre LIKE :q OR p.description LIKE :q)";
        }

        // Filtrer par catégorie
        if (!empty($params['categorie_id'])) {
            $query .= " AND p.categorie_id = :categorie_id";
        }

        // Filtrer par prix
        if (isset($params['prix_min']) && $params['prix_min'] !== '') {
            $query .= " AND p.prix_achat_immediat >= :prix_min";
        }
        if (isset($params['prix_max']) && $params['prix_max'] !== '') {
            $query .= " AND p.prix_achat_immediat <= :prix_max";
        }

        // Filtrer par condition
        if (!empty($params['condition'])) {
            $query .= " AND p.condition = :condition";
        }

        // Filtrer par type de vente
        if (!empty($params['type_vente'])) {
            $query .= " AND p.type_vente = :type_vente";
        }

        // Tri - utiliser un tri sécurisé
        $sortMap = [
            'date_asc' => 'p.date_publication ASC',
            'date_desc' => 'p.date_publication DESC',
            'date_publication' => 'p.date_publication DESC',
            'prix_asc' => 'p.prix_achat_immediat ASC',
            'prix_desc' => 'p.prix_achat_immediat DESC',
            'prix_achat_immediat' => 'p.prix_achat_immediat DESC',
            'titre' => 'p.titre ASC',
            'nombre_vues' => 'p.nombre_vues DESC',
            'popularite' => 'p.nombre_vues DESC',
        ];
        $sortSQL = isset($sortMap[$params['sort'] ?? '']) ? $sortMap[$params['sort']] : 'p.date_publication DESC';
        $query .= " ORDER BY $sortSQL";

        // Pagination
        $limit = (int)($params['limit'] ?? 12);
        $offset = (int)($params['offset'] ?? 0);
        $query .= " LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);

        // Binding des paramètres
        if (!empty($params['q'])) {
            $stmt->bindValue(':q', '%' . $params['q'] . '%');
        }
        if (!empty($params['categorie_id'])) {
            $stmt->bindValue(':categorie_id', $params['categorie_id']);
        }
        if (isset($params['prix_min']) && $params['prix_min'] !== '') {
            $stmt->bindValue(':prix_min', (float)$params['prix_min']);
        }
        if (isset($params['prix_max']) && $params['prix_max'] !== '') {
            $stmt->bindValue(':prix_max', (float)$params['prix_max']);
        }
        if (!empty($params['condition'])) {
            $stmt->bindValue(':condition', $params['condition']);
        }
        if (!empty($params['type_vente'])) {
            $stmt->bindValue(':type_vente', $params['type_vente']);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Incrémenter le nombre de vues
    public function incrementViews($id) {
        $query = "UPDATE " . $this->table . " SET nombre_vues = nombre_vues + 1 WHERE id = :id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([':id' => $id]);
    }

    // Obtenir les produits d'un vendeur
    public function getByVendor($vendorId, $limit = 12, $offset = 0) {
        $query = "SELECT * FROM " . $this->table . " 
                 WHERE vendeur_id = :vendeur_id AND etat IN ('active', 'vendue')
                 ORDER BY date_publication DESC
                 LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':vendeur_id', $vendorId);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // Alias pour getByVendor
    public function getByVendorId($vendorId, $limit = 12, $offset = 0) {
        return $this->getByVendor($vendorId, $limit, $offset);
    }

    // Mettre à jour un produit
    public function update($id, $data) {
        $allowed = ['titre', 'description', 'categorie_id', 'prix_achat_immediat', 'condition', 'type_vente', 'quantite'];
        $fields = [];
        $params = [':id' => $id];
        foreach ($data as $key => $value) {
            if (in_array($key, $allowed)) {
                $fields[] = "`$key` = :$key";
                $params[":$key"] = $value;
            }
        }
        if (empty($fields)) return false;
        $query = "UPDATE " . $this->table . " SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute($params);
    }

    // Supprimer un produit (soft delete)
    public function delete($id, $vendeurId) {
        $query = "UPDATE " . $this->table . " SET etat = 'supprime' WHERE id = :id AND vendeur_id = :vendeur_id";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([':id' => $id, ':vendeur_id' => $vendeurId]);
    }
}
