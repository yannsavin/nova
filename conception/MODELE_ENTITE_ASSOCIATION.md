# MERCATO NOVA - Modèle Entité-Association

## Entités et Attributs

### 1. UTILISATEURS
```
Utilisateur
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── email (UK): VARCHAR(255) UNIQUE NOT NULL
├── nom: VARCHAR(100) NOT NULL
├── prenom: VARCHAR(100) NOT NULL
├── mot_de_passe_hash: VARCHAR(255) NOT NULL
├── telephone: VARCHAR(20)
├── adresse: TEXT
├── ville: VARCHAR(100)
├── code_postal: VARCHAR(10)
├── pays: VARCHAR(100)
├── bio: TEXT
├── photo_profil: VARCHAR(255)
├── role: ENUM('admin', 'vendeur', 'acheteur') DEFAULT 'acheteur'
├── reputation: DECIMAL(3,2) DEFAULT 5.00
├── nombre_evaluations: INT DEFAULT 0
├── nombre_ventes: INT DEFAULT 0
├── nombre_achats: INT DEFAULT 0
├── statut: ENUM('actif', 'suspendu', 'supprime') DEFAULT 'actif'
├── date_inscription: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_derniere_connexion: TIMESTAMP
└── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 2. PRODUITS/ANNONCES
```
Produit
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── titre: VARCHAR(255) NOT NULL
├── description: TEXT NOT NULL
├── categorie_id (FK): INT NOT NULL
├── vendeur_id (FK): INT NOT NULL
├── prix_achat_immediat: DECIMAL(10,2)
├── prix_reserve_encheres: DECIMAL(10,2)
├── condition: ENUM('neuf', 'comme_neuf', 'bon_etat', 'etat_moyen', 'a_restaurer')
├── etat: ENUM('active', 'vendue', 'supprimee', 'expiree') DEFAULT 'active'
├── type_vente: ENUM('achat_immediat', 'encheres', 'negociation', 'tous') DEFAULT 'achat_immediat'
├── quantite: INT DEFAULT 1
├── image_principale: VARCHAR(255)
├── nombre_vues: INT DEFAULT 0
├── nombre_favoris: INT DEFAULT 0
├── date_publication: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_expiration: TIMESTAMP NULL
├── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
└── date_suppression: TIMESTAMP NULL
```

### 3. CATÉGORIES
```
Categorie
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── nom: VARCHAR(100) NOT NULL UNIQUE
├── description: TEXT
├── parent_id (FK): INT NULL (pour sous-catégories)
├── icone: VARCHAR(255)
├── position: INT
└── date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 4. IMAGES PRODUIT
```
Image_Produit
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── produit_id (FK): INT NOT NULL
├── chemin: VARCHAR(255) NOT NULL
├── position: INT
├── date_ajout: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_produit_id (produit_id)
```

### 5. ENCHÈRES
```
Enchere
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── produit_id (FK): INT NOT NULL UNIQUE
├── prix_minimum: DECIMAL(10,2) NOT NULL
├── prix_actuel: DECIMAL(10,2) DEFAULT NULL
├── meilleur_encherisseur_id (FK): INT NULL
├── date_debut: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_fin: TIMESTAMP NOT NULL
├── statut: ENUM('en_cours', 'terminee', 'annulee') DEFAULT 'en_cours'
├── nombre_encheres: INT DEFAULT 0
└── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 6. OFFRES ENCHÈRES (HISTORIQUE)
```
Offre_Enchere
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── enchere_id (FK): INT NOT NULL
├── encherisseur_id (FK): INT NOT NULL
├── montant: DECIMAL(10,2) NOT NULL
├── date_offre: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_enchere_id (enchere_id)
```

### 7. NÉGOCIATIONS
```
Negociation
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── produit_id (FK): INT NOT NULL
├── acheteur_id (FK): INT NOT NULL
├── vendeur_id (FK): INT NOT NULL
├── prix_initial_propose: DECIMAL(10,2) NOT NULL
├── prix_actuellement_propose: DECIMAL(10,2)
├── dernier_proponent_id (FK): INT NOT NULL (qui a fait la dernière offre)
├── statut: ENUM('en_cours', 'accord_trouve', 'rejetee', 'expiree', 'annulee') DEFAULT 'en_cours'
├── date_debut: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_dernier_message: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_expiration: TIMESTAMP NOT NULL
└── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 8. MESSAGES NÉGOCIATION
```
Message_Negociation
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── negociation_id (FK): INT NOT NULL
├── auteur_id (FK): INT NOT NULL
├── prix_propose: DECIMAL(10,2)
├── message: TEXT
├── action: ENUM('proposition', 'acceptation', 'refus', 'contreproposition') NOT NULL
├── date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_negociation_id (negociation_id)
```

### 9. COMMANDES (RÉSUMÉ TRANSACTIONS)
```
Commande
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── numero_commande (UK): VARCHAR(50) UNIQUE NOT NULL
├── acheteur_id (FK): INT NOT NULL
├── vendeur_id (FK): INT NOT NULL
├── produit_id (FK): INT NOT NULL
├── quantite: INT NOT NULL DEFAULT 1
├── prix_unitaire: DECIMAL(10,2) NOT NULL
├── prix_total: DECIMAL(10,2) NOT NULL
├── type_transaction: ENUM('achat_immediat', 'encheres', 'negociation') NOT NULL
├── statut: ENUM('en_attente', 'confirmee', 'livree', 'annulee', 'en_litige') DEFAULT 'en_attente'
├── reference_enchere_id (FK): INT NULL
├── reference_negociation_id (FK): INT NULL
├── date_commande: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
├── date_paiement_simule: TIMESTAMP NULL
├── date_livraison: TIMESTAMP NULL
└── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 10. PANIER
```
Panier
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── utilisateur_id (FK): INT NOT NULL UNIQUE
├── date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── date_modification: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 11. ARTICLES PANIER
```
Article_Panier
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── panier_id (FK): INT NOT NULL
├── produit_id (FK): INT NOT NULL
├── quantite: INT NOT NULL DEFAULT 1
├── prix_unitaire: DECIMAL(10,2) NOT NULL
├── date_ajout: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_panier_id (panier_id)
```

### 12. NOTIFICATIONS
```
Notification
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── utilisateur_id (FK): INT NOT NULL
├── type: ENUM('nouvel_produit', 'encheres', 'negociation', 'achat', 'message', 'systeme') NOT NULL
├── titre: VARCHAR(255) NOT NULL
├── description: TEXT
├── reference_id: INT (ID du produit/enchère/commande concernée)
├── lue: BOOLEAN DEFAULT FALSE
├── date_creation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_utilisateur_id (utilisateur_id)
```

### 13. FAVORIS
```
Favori
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── utilisateur_id (FK): INT NOT NULL
├── produit_id (FK): INT NOT NULL
├── date_ajout: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── UNIQUE KEY unique_favori (utilisateur_id, produit_id)
```

### 14. ÉVALUATIONS
```
Evaluation
├── id (PK): INT PRIMARY KEY AUTO_INCREMENT
├── commande_id (FK): INT NOT NULL
├── evaluateur_id (FK): INT NOT NULL
├── evalue_id (FK): INT NOT NULL
├── note: INT (1-5) NOT NULL
├── commentaire: TEXT
├── date_evaluation: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── INDEX idx_evalue (evalue_id)
```

---

## Associations (Cardinalités)

```
UTILISATEUR (1,N) --- (1,1) PANIER
UTILISATEUR (1,N) --- (1,N) PRODUIT (vendeur)
UTILISATEUR (1,N) --- (1,N) COMMANDE (acheteur)
UTILISATEUR (1,N) --- (1,N) COMMANDE (vendeur)
UTILISATEUR (1,N) --- (1,N) ENCHERE (enchérisseur)
UTILISATEUR (1,N) --- (1,N) NEGOCIATION (acheteur)
UTILISATEUR (1,N) --- (1,N) NEGOCIATION (vendeur)
UTILISATEUR (1,N) --- (1,N) NOTIFICATION
UTILISATEUR (1,N) --- (1,N) FAVORI
UTILISATEUR (1,N) --- (1,N) EVALUATION

CATEGORIE (1,N) --- (1,N) PRODUIT
CATEGORIE (0,1) --- (1,N) CATEGORIE (sous-catégories)

PRODUIT (1,N) --- (1,N) IMAGE_PRODUIT
PRODUIT (1,1) --- (1,1) ENCHERE
PRODUIT (1,N) --- (1,N) NEGOCIATION
PRODUIT (1,N) --- (1,N) COMMANDE
PRODUIT (1,N) --- (1,N) ARTICLE_PANIER
PRODUIT (1,N) --- (1,N) FAVORI

ENCHERE (1,N) --- (1,N) OFFRE_ENCHERE
OFFRE_ENCHERE (N,1) --- (1,N) UTILISATEUR (enchérisseur)

NEGOCIATION (1,N) --- (1,N) MESSAGE_NEGOCIATION
MESSAGE_NEGOCIATION (N,1) --- (1,N) UTILISATEUR (auteur)

PANIER (1,N) --- (1,N) ARTICLE_PANIER
ARTICLE_PANIER (N,1) --- (1,N) PRODUIT
```

---

## Clés Étrangères Essentielles

- `Produit.categorie_id` → `Categorie.id` (ON DELETE RESTRICT)
- `Produit.vendeur_id` → `Utilisateur.id` (ON DELETE RESTRICT)
- `Commande.acheteur_id` → `Utilisateur.id` (ON DELETE RESTRICT)
- `Commande.vendeur_id` → `Utilisateur.id` (ON DELETE RESTRICT)
- `Enchere.meilleur_encherisseur_id` → `Utilisateur.id` (ON DELETE SET NULL)
- `Notification.utilisateur_id` → `Utilisateur.id` (ON DELETE CASCADE)
- `Evaluation.evaluateur_id` → `Utilisateur.id` (ON DELETE CASCADE)

---

## Index Importants

- `Utilisateur(email)` - Recherche par email
- `Produit(vendeur_id, etat)` - Annonces actives par vendeur
- `Produit(categorie_id)` - Produits par catégorie
- `Commande(acheteur_id, date_commande)` - Historique acheteur
- `Commande(vendeur_id, date_commande)` - Historique vendeur
- `Enchere(date_fin, statut)` - Enchères actives
- `Notification(utilisateur_id, lue)` - Notifications non lues

