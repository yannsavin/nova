<?php
// public/reset-db.php
// Script pour réinitialiser complètement la base de données

header('Content-Type: application/json; charset=utf-8');

try {
    // Connexion à MySQL
    $host = 'localhost';
    $user = 'root';
    $password = '';
    
    $conn = new PDO(
        'mysql:host=' . $host . ';charset=utf8mb4',
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    // Lire le fichier SQL
    $sqlFile = __DIR__ . '/../../database/schema.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Fichier schema.sql non trouvé: " . $sqlFile);
    }

    $sqlContent = file_get_contents($sqlFile);
    
    // Exécuter le contenu SQL directement
    $conn->exec($sqlContent);

    echo json_encode([
        'success' => true,
        'message' => 'Base de données réinitialisée avec succès!',
        'details' => 'Les produits de test et les images ont été créés.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur PDO: ' . $e->getMessage(),
        'errorCode' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
?>
