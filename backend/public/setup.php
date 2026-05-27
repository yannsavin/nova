<?php
// public/setup.php
// Script d'initialisation de la base de données

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/Utils/Response.php';

try {
    $database = new Database();
    $db = $database->connect();

    // Vérifier si la base de données existe
    $dbName = 'mercato_nova';
    $query = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$dbName]);
    
    if ($stmt->rowCount() === 0) {
        Response::error('Base de données non trouvée', 404);
        exit;
    }

    // Créer les catégories s'il n'y en a pas
    $catQuery = "SELECT COUNT(*) as count FROM categories";
    $catStmt = $db->prepare($catQuery);
    $catStmt->execute();
    $catCount = $catStmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($catCount === 0) {
        $categories = [
            ['nom' => 'Électronique', 'description' => 'Produits électroniques et informatiques'],
            ['nom' => 'Audio', 'description' => 'Casques, écouteurs et systèmes audio'],
            ['nom' => 'Photographie', 'description' => 'Appareils photo et accessoires'],
            ['nom' => 'Vêtements', 'description' => 'Mode et vêtements'],
            ['nom' => 'Livres', 'description' => 'Livres et publications'],
            ['nom' => 'Sports', 'description' => 'Équipements sportifs'],
        ];

        $insertQuery = "INSERT INTO categories (nom, description) VALUES (?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        foreach ($categories as $cat) {
            $insertStmt->execute([$cat['nom'], $cat['description']]);
        }
    }

    Response::success('Base de données initialisée avec succès');
} catch (Exception $e) {
    Response::serverError('Erreur: ' . $e->getMessage());
}
?>
