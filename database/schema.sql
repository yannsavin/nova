SET NAMES utf8mb4;

DROP DATABASE IF EXISTS mercato_nova;
CREATE DATABASE mercato_nova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mercato_nova;

CREATE TABLE utilisateurs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(100),
  code_postal VARCHAR(10),
  pays VARCHAR(100) DEFAULT 'France',
  bio TEXT,
  photo_profil VARCHAR(255),
  role VARCHAR(50) DEFAULT 'acheteur',
  reputation DECIMAL(3,2) DEFAULT 5.00,
  nombre_evaluations INT DEFAULT 0,
  nombre_ventes INT DEFAULT 0,
  nombre_achats INT DEFAULT 0,
  statut VARCHAR(50) DEFAULT 'actif',
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_statut (statut),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INT,
  icone VARCHAR(255),
  position INT DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_parent_id (parent_id),
  KEY idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE produits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  categorie_id INT NOT NULL,
  vendeur_id INT NOT NULL,
  prix_achat_immediat DECIMAL(10,2),
  prix_reserve_encheres DECIMAL(10,2),
  `condition` VARCHAR(50) DEFAULT 'bon_etat',
  etat VARCHAR(50) DEFAULT 'active',
  type_vente VARCHAR(50) DEFAULT 'achat_immediat',
  quantite INT DEFAULT 1,
  image_principale VARCHAR(255),
  nombre_vues INT DEFAULT 0,
  nombre_favoris INT DEFAULT 0,
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP NULL,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  date_suppression TIMESTAMP NULL,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (vendeur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
  KEY idx_vendeur_id (vendeur_id),
  KEY idx_categorie_id (categorie_id),
  KEY idx_etat (etat),
  KEY idx_type_vente (type_vente),
  KEY idx_date_publication (date_publication)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE images_produits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produit_id INT NOT NULL,
  chemin VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  KEY idx_produit_id (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE encheres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produit_id INT UNIQUE NOT NULL,
  prix_minimum DECIMAL(10,2) NOT NULL,
  prix_actuel DECIMAL(10,2),
  meilleur_encherisseur_id INT,
  date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_fin TIMESTAMP NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_cours',
  nombre_encheres INT DEFAULT 0,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  FOREIGN KEY (meilleur_encherisseur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  KEY idx_date_fin (date_fin),
  KEY idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE offres_encheres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enchere_id INT NOT NULL,
  encherisseur_id INT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_offre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enchere_id) REFERENCES encheres(id) ON DELETE CASCADE,
  FOREIGN KEY (encherisseur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  KEY idx_enchere_id (enchere_id),
  KEY idx_encherisseur_id (encherisseur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE negociations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produit_id INT NOT NULL,
  acheteur_id INT NOT NULL,
  vendeur_id INT NOT NULL,
  prix_initial_propose DECIMAL(10,2) NOT NULL,
  prix_actuellement_propose DECIMAL(10,2),
  dernier_proponent_id INT NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_cours',
  date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_dernier_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP NOT NULL,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  FOREIGN KEY (acheteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendeur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (dernier_proponent_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  KEY idx_produit_id (produit_id),
  KEY idx_acheteur_id (acheteur_id),
  KEY idx_vendeur_id (vendeur_id),
  KEY idx_statut (statut),
  KEY idx_date_expiration (date_expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages_negociation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  negociation_id INT NOT NULL,
  auteur_id INT NOT NULL,
  prix_propose DECIMAL(10,2),
  message TEXT,
  action VARCHAR(50) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (negociation_id) REFERENCES negociations(id) ON DELETE CASCADE,
  FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  KEY idx_negociation_id (negociation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE commandes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_commande VARCHAR(50) UNIQUE NOT NULL,
  acheteur_id INT NOT NULL,
  vendeur_id INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  prix_total DECIMAL(10,2) NOT NULL,
  frais_livraison DECIMAL(10,2) DEFAULT 0,
  type_transaction VARCHAR(50) NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_attente',
  reference_enchere_id INT,
  reference_negociation_id INT,
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_paiement_simule TIMESTAMP NULL,
  date_livraison TIMESTAMP NULL,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (acheteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendeur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
  FOREIGN KEY (reference_enchere_id) REFERENCES encheres(id) ON DELETE SET NULL,
  FOREIGN KEY (reference_negociation_id) REFERENCES negociations(id) ON DELETE SET NULL,
  KEY idx_acheteur_id (acheteur_id),
  KEY idx_vendeur_id (vendeur_id),
  KEY idx_date_commande (date_commande),
  KEY idx_statut (statut),
  KEY idx_numero_commande (numero_commande)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paniers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  utilisateur_id INT UNIQUE NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evaluations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  commande_id INT NOT NULL,
  evaluateur_id INT NOT NULL,
  evalue_id INT NOT NULL,
  note INT NOT NULL,
  commentaire TEXT,
  date_evaluation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (evalue_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  KEY idx_evalue (evalue_id),
  KEY idx_evaluateur_id (evaluateur_id),
  UNIQUE KEY unique_evaluation (commande_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO utilisateurs (email, nom, prenom, mot_de_passe_hash, role, reputation, nombre_ventes, nombre_achats, bio)
VALUES
  ('admin@mercato.fr', 'Admin', 'Systeme', '$2y$10$zM8rAbV3FtWjSSZRrSAFjOWkF7yC/uP0EyJ8pGnEJhmXUO9r0yvBS', 'admin', 5.00, 0, 0, 'Administrateur de Mercato Nova'),
  ('vendeur@mercato.fr', 'Dupont', 'Alexandre', '$2y$10$zM8rAbV3FtWjSSZRrSAFjOWkF7yC/uP0EyJ8pGnEJhmXUO9r0yvBS', 'vendeur', 4.87, 4, 0, 'Vendeur de pieces de collection depuis 3 ans. Authenticite garantie.'),
  ('collector@mercato.fr', 'Martin', 'Sophie', '$2y$10$zM8rAbV3FtWjSSZRrSAFjOWkF7yC/uP0EyJ8pGnEJhmXUO9r0yvBS', 'acheteur', 4.50, 0, 12, 'Passionnee de montres et d objets vintage'),
  ('seller.vintage@mercato.fr', 'Rousseau', 'Marie', '$2y$10$zM8rAbV3FtWjSSZRrSAFjOWkF7yC/uP0EyJ8pGnEJhmXUO9r0yvBS', 'vendeur', 4.75, 8, 0, 'Specialiste en lampes et mobilier des annees 70');

INSERT INTO categories (nom, description, position)
VALUES 
  ('Montres', 'Montres vintage et collection', 1),
  ('Lampes', 'Lampes design et vintage', 2),
  ('Disques Vinyles', 'Disques LP et 45 tours rares', 3),
  ('Appareils Photo', 'Appareils photo classiques et numeriques', 4),
  ('Bijoux', 'Bijoux anciens et artisanaux', 5),
  ('Mobilier', 'Meubles et decoration', 6),
  ('Livres', 'Livres rares et editions limitees', 7),
  ('Autres', 'Autres objets de collection', 8);

INSERT INTO produits (titre, description, categorie_id, vendeur_id, prix_achat_immediat, `condition`, type_vente, quantite, image_principale)
VALUES
  ('Montre Omega Vintage 1960', 'Magnifique montre Omega des annees 1960. Tres bon etat, fonctionnelle. Sortie d\'usine.', 1, 2, 250.00, 'bon_etat', 'achat_immediat', 1, '/images/products/product_1_v1.jpg'),
  ('Lampe de Bureau Design 70s', 'Lampe en laiton brosse, design scandinave des annees 70. Etat parfait.', 2, 2, 45.00, 'comme_neuf', 'achat_immediat', 1, '/images/products/product_2_v1.jpg'),
  ('Disque Vinyle Rare - Pink Floyd', 'Pink Floyd - The Dark Side of The Moon. Pressage original 1973 en tres bon etat.', 3, 2, 30.00, 'bon_etat', 'encheres', 1, '/images/products/product_3_v1.jpg'),
  ('Appareil Photo Leica M3', 'Classique absolu. Leica M3 chrome de 1954. Mecanisme impeccable.', 4, 2, 180.00, 'bon_etat', 'negociation', 1, '/images/products/product_4_v1.jpg');

INSERT INTO paniers (utilisateur_id)
VALUES 
  (3),
  (1);

INSERT INTO images_produits (produit_id, chemin, position)
VALUES 
  (1, '/images/products/product_1_v2.jpg', 1),
  (1, '/images/products/product_1_v3.jpg', 2),
  (2, '/images/products/product_2_v2.jpg', 1),
  (2, '/images/products/product_2_v3.jpg', 2),
  (3, '/images/products/product_3_v1.jpg', 0),
  (3, '/images/products/product_3_v2.jpg', 1),
  (3, '/images/products/product_3_v3.jpg', 2),
  (4, '/images/products/product_4_v2.jpg', 1),
  (4, '/images/products/product_4_v3.jpg', 2);

INSERT INTO encheres (produit_id, prix_minimum, date_fin, statut)
VALUES 
  (3, 25.00, DATE_ADD(NOW(), INTERVAL 24 HOUR), 'en_cours');

INSERT INTO negociations (produit_id, acheteur_id, vendeur_id, prix_initial_propose, dernier_proponent_id, date_expiration)
VALUES
  (4, 3, 2, 160.00, 3, DATE_ADD(NOW(), INTERVAL 24 HOUR));

INSERT INTO commandes (numero_commande, acheteur_id, vendeur_id, produit_id, quantite, prix_unitaire, prix_total, type_transaction, statut)
VALUES
  ('CMD-2026-001', 3, 2, 1, 1, 250.00, 250.00, 'achat_immediat', 'confirmee');

INSERT INTO evaluations (commande_id, evaluateur_id, evalue_id, note, commentaire)
VALUES
  (1, 3, 2, 5, 'Produit conforme a la description. Vendeur tres professionnel!');
