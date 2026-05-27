# MERCATO NOVA - Spécifications Fonctionnelles

## 1. CONTEXTE ET POSITIONNEMENT

### Vision de la Plateforme
**Mercato Nova** est une plateforme e-commerce spécialisée dans la vente d'objets rares, vintage et artisanaux. Elle offre une expérience unique de marketplace où collectionneurs, amateurs et vendeurs peuvent interagir autour de produits uniques.

### Public Cible
- **Acheteurs**: Collectionneurs, amateurs de vintage, enthousiastes d'objets rares et artisanaux
- **Vendeurs**: Antiquaires, artisans, collectionneurs vendant des doublons
- **Modérateurs**: Administrateurs de plateforme

### Positionnement Unique
- Accent sur l'authenticité et la qualité des produits
- Système de réputation robuste pour vendeurs et acheteurs
- Mécanismes de transaction flexibles adaptés à chaque type de vente
- Interface intuitive valorisant la communauté

---

## 2. CATÉGORIES D'UTILISATEURS ET PERMISSIONS

### 2.1 Administrateur
- **Permissions**: Accès complet à la plateforme
- **Fonctionnalités**: Modération, gestion des utilisateurs, statistiques, suppression de contenu

### 2.2 Vendeur
- **Permissions**: Créer/modifier/supprimer annonces, gérer transactions
- **Fonctionnalités**: 
  - Publier des produits
  - Gérer les enchères et négociations
  - Accéder au tableau de bord vendeur
  - Consulter historique des ventes

### 2.3 Acheteur
- **Permissions**: Parcourir, enchérir, acheter, négocier
- **Fonctionnalités**:
  - Rechercher/filtrer produits
  - Participer aux enchères
  - Initier négociations
  - Gérer panier et achats
  - Consulter historique d'achat

### 2.4 Utilisateur Anonyme
- Accès limité à la consultation du catalogue

---

## 3. MÉCANISMES DE TRANSACTION

### 3.1 Achat Immédiat
- Prix fixe défini par le vendeur
- Validation immédiate du stock
- Passage au panier puis paiement simulé
- Confirmation d'achat
- Notification vendeur et acheteur

### 3.2 Vente par Enchère
- Durée configurable (24h, 48h, 7j, etc.)
- Système de surenchères
- Protection du vendeur (prix minimum)
- Système d'enchères automatiques
- Notification en temps réel des enchères
- Détermination du gagnant à la fin de l'enchère
- Historique complet des offres

### 3.3 Vente par Négociation
- Acheteur fait une offre initialement
- Vendeur peut accepter, refuser ou contre-proposer
- Dialogue direct entre les parties
- Limite de temps pour chaque étape
- États: En négociation, Accord trouvé, Rejeté, Expiré
- Historique complet des échanges

---

## 4. FONCTIONNALITÉS PRINCIPALES

### 4.1 Gestion des Utilisateurs
- Inscription avec validation email
- Authentification sécurisée
- Profil utilisateur personnalisable
- Système de notation/réputation
- Wishlist/Favoris
- Historique d'activités

### 4.2 Catalogue et Recherche
- Catégories hiérarchiques
- Moteur de recherche avancé
- Filtres multiples (prix, état, vendeur, etc.)
- Tri (pertinence, prix, date, popularité)
- Pagination des résultats
- Détail produit riche (images, descriptions)

### 4.3 Panier et Paiement
- Ajout/suppression d'articles au panier
- Modification des quantités
- Calcul automatique des totaux
- Validation du panier avant paiement
- Processus de paiement simulé
- Confirmation et génération de commande

### 4.4 Notifications
- Nouvelle annonce dans catégories suivies
- Mise à jour enchères
- Réponses aux négociations
- Confirmation des transactions
- Avis de livraison

### 4.5 Système de Sécurité
- Protection contre les injections SQL
- Validation des données (client + serveur)
- Gestion sécurisée des sessions
- Hachage des mots de passe
- Protection CSRF basique

---

## 5. TECHNOLOGIES UTILISÉES

### Frontend
- **React** 18+ pour interface dynamique
- **HTML5/CSS3** pour structure et style
- **JavaScript (ES6+)** pour logique client
- **Axios/Fetch** pour requêtes API

### Backend
- **PHP 8+** pour serveur application
- **MySQL 8+** pour base de données
- **RESTful API** pour communication

### Outils et Frameworks
- **Composer** pour dépendances PHP
- **npm/yarn** pour dépendances JS
- **Git** pour versioning

---

## 6. ARCHITECTURE GÉNÉRALE

```
Frontend (React)
    ↓ API REST (HTTP)
Backend (PHP)
    ↓ Requêtes SQL
Database (MySQL)
```

- Séparation complète Frontend/Backend
- Communication via API REST
- Stockage des données en base SQL

---

## 7. RÈGLES MÉTIER CRITIQUES

### 7.1 Cohérence des Transactions
- Un produit ne peut être acheté qu'une fois
- Les enchères doivent augmenter
- Les négociations ont un délai maximal
- Stock mis à jour en temps réel

### 7.2 Gestion des Conflits
- Deux achats simultanés: premier gagnant
- Enchères simultanées: plus haute enchère
- Transactions concurrentes: validées côté serveur

### 7.3 Validation des Données
- Tous les montants validés côté serveur
- Images vérifiées (type, taille)
- Descriptions limitées en longueur
- Email validé au format

---

## 8. RÉPARTITION DU TRAVAIL (Prévisionnel)

| Tâche | Responsable | Estimé |
|-------|---|---|
| Architecture et DB | Développeur 1 | 6h |
| Frontend Catalogue | Développeur 2 | 8h |
| Backend API | Développeur 1 | 12h |
| Enchères | Développeur 3 | 8h |
| Négociations | Développeur 2 | 6h |
| Panier/Paiement | Développeur 3 | 6h |
| Notifications | Développeur 1 | 4h |
| Tests/Documentation | Tous | 4h |

**Total estimé**: 54h

---

## 9. RISQUES ET MITIGATION

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Concurrence d'accès DB | Haute | Transactions SQL, locks |
| Performance recherche | Moyenne | Index DB, cache |
| UX complexe | Moyenne | Itérations UI/UX |
| Sécurité | Haute | Validation stricte, review code |

---

## 10. CRITÈRES DE SUCCÈS

✅ Tous les mécanismes de transaction fonctionnels
✅ Interface intuitive et responsive
✅ API robuste et bien documentée
✅ Gestion d'erreurs complète
✅ Système de notifications fonctionnel
✅ Code propre et bien structuré
✅ Documentation technique complète

