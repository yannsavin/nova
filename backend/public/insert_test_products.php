<?php
// Script pour ajouter 6 produits de test

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->connect();

// Produits de test
$products = [
    [
        'titre' => 'Montre Vintage Seiko 1970',
        'description' => 'Magnifique montre vintage Seiko des années 1970. En bon état de fonctionnement. Verre minéral légèrement rayé mais lisible.',
        'categorie_id' => 1,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 89.99,
        'condition' => 'bon_etat',
        'type_vente' => 'achat_immediat',
        'quantite' => 1,
        'etat' => 'active',
    ],
    [
        'titre' => 'Vinyl Original Beatles "Abbey Road" 1969',
        'description' => 'Album original Abbey Road des Beatles de 1969. Pochette en bon état, vinyl en très bon état. Peu de rayures audibles.',
        'categorie_id' => 2,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 150.00,
        'condition' => 'tres_bon_etat',
        'type_vente' => 'enchere',
        'quantite' => 1,
        'etat' => 'active',
    ],
    [
        'titre' => 'Caméra Pentax K1000 Film 35mm',
        'description' => 'Caméra argentique Pentax K1000 classique. Parfaite pour débuter la photographie en film. Objectif 50mm SMC Pentax inclus.',
        'categorie_id' => 3,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 120.00,
        'condition' => 'bon_etat',
        'type_vente' => 'achat_immediat',
        'quantite' => 1,
        'etat' => 'active',
    ],
    [
        'titre' => 'Lampe Artisanale Bois Teinté Main',
        'description' => 'Superbe lampe artisanale fabriquée à main. Bois local teinté naturellement. Design unique et écologique. Très bonne qualité.',
        'categorie_id' => 4,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 65.50,
        'condition' => 'neuf',
        'type_vente' => 'negociation',
        'quantite' => 1,
        'etat' => 'active',
    ],
    [
        'titre' => 'Livre Rare "Le Petit Prince" Edition 1943',
        'description' => 'Édition rare et originale du Petit Prince de 1943. Première édition française. Bon état pour son âge, quelques usures.',
        'categorie_id' => 5,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 450.00,
        'condition' => 'etat_acceptable',
        'type_vente' => 'enchere',
        'quantite' => 1,
        'etat' => 'active',
    ],
    [
        'titre' => 'Figurine Collection Dragon Ball Z DBZ',
        'description' => 'Rare figurine de collection Dragon Ball Z vintage des années 90. Condition de collection. Boîte originale présente mais abîmée.',
        'categorie_id' => 6,
        'vendeur_id' => 1,
        'prix_achat_immediat' => 85.00,
        'condition' => 'bon_etat',
        'type_vente' => 'achat_immediat',
        'quantite' => 1,
        'etat' => 'active',
    ],
];

try {
    $inserted = 0;
    foreach ($products as $product) {
        $query = "INSERT INTO produits 
                  (titre, description, categorie_id, vendeur_id, prix_achat_immediat, 
                   `condition`, `type_vente`, quantite, etat, date_publication, nombre_vues) 
                  VALUES 
                  (:titre, :description, :categorie_id, :vendeur_id, :prix_achat_immediat,
                   :condition, :type_vente, :quantite, :etat, NOW(), 0)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':titre' => $product['titre'],
            ':description' => $product['description'],
            ':categorie_id' => $product['categorie_id'],
            ':vendeur_id' => $product['vendeur_id'],
            ':prix_achat_immediat' => $product['prix_achat_immediat'],
            ':condition' => $product['condition'],
            ':type_vente' => $product['type_vente'],
            ':quantite' => $product['quantite'],
            ':etat' => $product['etat'],
        ]);
        
        $inserted++;
        echo "✓ Produit inséré: {$product['titre']}\n";
    }
    
    echo "\n✅ $inserted produits ont été ajoutés avec succès!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}
?>
