<?php
// src/Controllers/ProductController.php
// Contrôleur produit

class ProductController {
    private $db;
    private $productModel;

    public function __construct($db) {
        $this->db = $db;
        $this->productModel = new Product($db);
    }

    // Lister tous les produits (avec recherche et filtres)
    public function getAll() {
        try {
            $params = [];
            
            // Récupérer les paramètres de recherche
            if (isset($_GET['q'])) {
                $params['q'] = $_GET['q'];
            }
            if (isset($_GET['categorie_id'])) {
                $params['categorie_id'] = (int)$_GET['categorie_id'];
            }
            if (isset($_GET['prix_min'])) {
                $params['prix_min'] = (float)$_GET['prix_min'];
            }
            if (isset($_GET['prix_max'])) {
                $params['prix_max'] = (float)$_GET['prix_max'];
            }
            if (isset($_GET['condition'])) {
                $params['condition'] = $_GET['condition'];
            }
            if (isset($_GET['type_vente'])) {
                $params['type_vente'] = $_GET['type_vente'];
            }
            if (isset($_GET['sort'])) {
                $params['sort'] = $_GET['sort'];
            }
            if (isset($_GET['order'])) {
                $params['order'] = $_GET['order'];
            }
            if (isset($_GET['limit'])) {
                $params['limit'] = (int)$_GET['limit'];
            }
            if (isset($_GET['offset'])) {
                $params['offset'] = (int)$_GET['offset'];
            }

            $products = $this->productModel->search($params);
            Response::success('Produits récupérés', ['products' => $products]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Obtenir un produit par ID
    public function getById($id) {
        try {
            $product = $this->productModel->getById($id);
            
            if (!$product) {
                Response::notFound('Produit non trouvé');
            }

            // Incrémenter le compteur de vues
            $this->productModel->incrementViews($id);

            // Ajouter les images supplémentaires
            $product['images'] = $this->productModel->getImages($id);

            Response::success('Produit trouvé', ['product' => $product]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Obtenir les produits d'un vendeur
    public function getVendorProducts($vendorId) {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = 12;
            $offset = ($page - 1) * $limit;

            $products = $this->productModel->getByVendorId($vendorId, $limit, $offset);
            
            Response::success('Produits du vendeur récupérés', ['products' => $products]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Créer un produit
    public function create() {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($data['titre']) || empty($data['description']) || empty($data['categorie_id'])) {
                Response::error('Titre, description et catégorie sont requis');
                return;
            }
            $query = "INSERT INTO produits (titre, description, categorie_id, vendeur_id, prix_achat_immediat, `condition`, type_vente, quantite)
                      VALUES (:titre, :description, :categorie_id, :vendeur_id, :prix, :condition, :type_vente, :quantite)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':titre'        => $data['titre'],
                ':description'  => $data['description'],
                ':categorie_id' => (int)$data['categorie_id'],
                ':vendeur_id'   => $_SESSION['user_id'],
                ':prix'         => !empty($data['prix_achat_immediat']) ? (float)$data['prix_achat_immediat'] : null,
                ':condition'    => $data['condition'] ?? 'bon_etat',
                ':type_vente'   => $data['type_vente'] ?? 'achat_immediat',
                ':quantite'     => (int)($data['quantite'] ?? 1),
            ]);
            $newId = $this->db->lastInsertId();
            Response::success('Produit créé', ['id' => $newId], 201);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Modifier un produit
    public function update($id) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $check = $this->db->prepare("SELECT vendeur_id FROM produits WHERE id = :id");
            $check->execute([':id' => $id]);
            $product = $check->fetch();
            if (!$product || (int)$product['vendeur_id'] !== (int)$_SESSION['user_id']) {
                Response::forbidden('Non autorisé');
                return;
            }
            $this->productModel->update($id, $data);
            Response::success('Produit mis à jour');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Uploader des images pour un produit
    public function uploadImages($id) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $check = $this->db->prepare("SELECT vendeur_id, image_principale FROM produits WHERE id = :id");
            $check->execute([':id' => $id]);
            $product = $check->fetch();
            if (!$product || (int)$product['vendeur_id'] !== (int)$_SESSION['user_id']) {
                Response::forbidden('Non autorisé');
                return;
            }
            if (empty($_FILES['images'])) {
                Response::error('Aucune image fournie');
                return;
            }

            $uploadDir   = __DIR__ . '/../../public/images/products/';
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $maxSize     = 5 * 1024 * 1024;
            $files       = $_FILES['images'];
            $count       = is_array($files['name']) ? count($files['name']) : 1;
            $uploaded    = [];

            for ($i = 0; $i < $count; $i++) {
                $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $type    = is_array($files['type'])     ? $files['type'][$i]     : $files['type'];
                $size    = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];
                $error   = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
                $origName = is_array($files['name'])    ? $files['name'][$i]     : $files['name'];

                if ($error !== UPLOAD_ERR_OK || $size > $maxSize || !in_array($type, $allowedTypes)) continue;

                $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                $filename = 'product_' . $id . '_' . uniqid() . '.' . $ext;

                if (move_uploaded_file($tmpName, $uploadDir . $filename)) {
                    $uploaded[] = '/images/products/' . $filename;
                }
            }

            if (empty($uploaded)) {
                Response::error('Aucune image valide (JPG/PNG/WEBP, max 5 Mo)');
                return;
            }

            // Mettre à jour image_principale si absente
            if (empty($product['image_principale'])) {
                $this->db->prepare("UPDATE produits SET image_principale = :img WHERE id = :id")
                         ->execute([':img' => $uploaded[0], ':id' => $id]);
            }

            // Position de départ
            $posStmt = $this->db->prepare("SELECT COALESCE(MAX(position), -1) + 1 as next FROM images_produits WHERE produit_id = :id");
            $posStmt->execute([':id' => $id]);
            $nextPos = (int)$posStmt->fetch()['next'];

            $insertImg = $this->db->prepare("INSERT INTO images_produits (produit_id, chemin, position) VALUES (:pid, :chemin, :pos)");
            foreach ($uploaded as $idx => $path) {
                $insertImg->execute([':pid' => $id, ':chemin' => $path, ':pos' => $nextPos + $idx]);
            }

            Response::success('Images ajoutées', ['images' => $uploaded]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Supprimer un produit
    public function delete($id) {
        try {
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized('Connexion requise');
                return;
            }
            $this->productModel->delete($id, $_SESSION['user_id']);
            Response::success('Produit supprimé');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Générer des images pour les produits
    public function generateImages() {
        try {
            require_once __DIR__ . '/../Utils/ImageGenerator.php';
            
            $imageGenerator = new ImageGenerator();
            
            // Récupérer les produits sans image
            $query = "SELECT id, titre FROM produits WHERE image_principale IS NULL OR image_principale = '' LIMIT 20";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $updated = 0;
            foreach ($products as $product) {
                // Générer une image basée sur le titre
                $imageUrl = $imageGenerator->generateImageFromUnsplash($product['titre'], $product['id']);
                
                // Mettre à jour le produit
                $updateQuery = "UPDATE produits SET image_principale = ? WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                if ($updateStmt->execute([$imageUrl, $product['id']])) {
                    $updated++;
                }
            }

            Response::success('Images générées', ['generated' => $updated, 'total' => count($products)]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Créer des produits de démonstration
    public function generateDemoProducts() {
        try {
            // Vérifier si la table produits existe
            $query = "SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produits'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $tableExists = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
            
            if (!$tableExists) {
                Response::error('Table produits non trouvée', 404);
                return;
            }

            // Vérifier si un utilisateur vendeur existe
            $userQuery = "SELECT id FROM utilisateurs WHERE role = 'vendeur' LIMIT 1";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute();
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                // Créer un utilisateur vendeur de test
                $vendorQuery = "INSERT INTO utilisateurs (email, nom, prenom, mot_de_passe_hash, role) VALUES (?, ?, ?, ?, ?)";
                $vendorStmt = $this->db->prepare($vendorQuery);
                $password = password_hash('password123', PASSWORD_DEFAULT);
                $vendorStmt->execute(['vendor@test.com', 'Test', 'Vendor', $password, 'vendeur']);
                $vendorId = $this->db->lastInsertId();
            } else {
                $vendorId = $user['id'];
            }

            // Produits de démonstration
            $demoProducts = [
                ['titre' => 'iPhone 14 Pro', 'description' => 'Smartphone haut de gamme Apple avec écran OLED', 'prix' => 999.99, 'categorie_id' => 1],
                ['titre' => 'MacBook Pro M3', 'description' => 'Ordinateur portable professionnel haute performance', 'prix' => 1999.99, 'categorie_id' => 1],
                ['titre' => 'AirPods Pro', 'description' => 'Écouteurs sans fil avec suppression active du bruit', 'prix' => 249.99, 'categorie_id' => 2],
                ['titre' => 'Apple Watch Ultra', 'description' => 'Montre intelligente robuste et étanche', 'prix' => 799.99, 'categorie_id' => 2],
                ['titre' => 'iPad Air', 'description' => 'Tablette légère et puissante pour la productivité', 'prix' => 599.99, 'categorie_id' => 1],
                ['titre' => 'Sony WH-1000XM5', 'description' => 'Casque audio sans fil premium avec ANC', 'prix' => 349.99, 'categorie_id' => 2],
                ['titre' => 'Canon EOS R6', 'description' => 'Appareil photo numérique mirrorless professionnel', 'prix' => 2499.99, 'categorie_id' => 3],
                ['titre' => 'DJI Air 3', 'description' => 'Drone caméra compacte avec excellent autônomie', 'prix' => 1299.99, 'categorie_id' => 3],
            ];

            $created = 0;
            foreach ($demoProducts as $product) {
                // Vérifier si le produit existe déjà
                $checkQuery = "SELECT id FROM produits WHERE titre = ?";
                $checkStmt = $this->db->prepare($checkQuery);
                $checkStmt->execute([$product['titre']]);
                
                if ($checkStmt->rowCount() === 0) {
                    // Générer une image (simple placeholder pour commencer)
                    $imageUrl = "https://via.placeholder.com/400x300/" . substr(md5($product['titre']), 0, 6) . "/FFFFFF?text=" . urlencode(substr($product['titre'], 0, 15));

                    // Insérer le produit
                    $insertQuery = "INSERT INTO produits (titre, description, categorie_id, vendeur_id, prix_achat_immediat, image_principale, type_vente, condition) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    $insertStmt = $this->db->prepare($insertQuery);
                    if ($insertStmt->execute([
                        $product['titre'],
                        $product['description'],
                        $product['categorie_id'],
                        $vendorId,
                        $product['prix'],
                        $imageUrl,
                        'achat_immediat',
                        'neuf'
                    ])) {
                        $created++;
                    }
                }
            }

            Response::success('Produits de démonstration créés', ['created' => $created]);
        } catch (Exception $e) {
            error_log("Error in generateDemoProducts: " . $e->getMessage());
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
