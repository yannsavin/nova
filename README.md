# MERCATO NOVA - README

## 🏪 À propos

**Mercato Nova** est une plateforme e-commerce innovante spécialisée dans la vente d'objets rares, vintage et artisanaux. Elle offre trois mécanismes de transaction flexibles :
- 💳 **Achat immédiat** : Transactions directes au prix fixe
- 🎯 **Enchères** : Système d'enchères en temps réel
- 💬 **Négociation** : Dialogue direct acheteur-vendeur pour trouver le meilleur prix

## 📋 Fonctionnalités principales

### Acheteur
- Parcourir le catalogue avec recherche avancée et filtres
- Ajouter des produits aux favoris
- Participer aux enchères
- Initier des négociations
- Gérer son panier
- Consulter l'historique d'achat
- Recevoir des notifications

### Vendeur
- Publier des annonces (achat immédiat, enchères, négociation)
- Gérer son tableau de bord
- Consulter les ventes
- Répondre aux demandes de négociation
- Gérer les enchères

### Administrateur
- Modération du contenu
- Gestion des utilisateurs
- Statistiques et monitoring
- Gestion des catégories

## 🛠️ Stack Technique

### Backend
- **PHP 8+** - Serveur applicatif
- **MySQL 8+** - Base de données
- **API REST** - Communication client-serveur

### Frontend
- **React 18+** - Interface utilisateur
- **React Router** - Navigation
- **Axios** - Client HTTP
- **CSS3** - Styling

### Architecture
- **Client-Serveur** - Séparation frontend/backend
- **Responsive** - Compatible tous les appareils
- **RESTful API** - Endpoints standardisés

## 📦 Installation

### Prérequis
- PHP 8.0 ou supérieur
- MySQL 8.0 ou supérieur
- Node.js 16+
- npm ou yarn

### Étapes

#### 1. Cloner le repository
```bash
git clone <repository-url>
cd nova
```

#### 2. Setup Base de Données
```bash
# Créer la base de données
mysql -u root -p < database/schema.sql
```

#### 3. Setup Backend
```bash
cd backend

# Configuration
# Éditer config/database.php avec vos identifiants MySQL
nano config/database.php

# Installer les dépendances (si composer.json)
composer install

# Lancer le serveur
php -S localhost:8000 -t public
```

#### 4. Setup Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

#### 5. Accéder à l'application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## 🔑 Données de Test

Des utilisateurs de test sont fournis dans la base de données:

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| antiques.milan@mercato.fr | (voir seed) | Vendeur |
| collector@mercato.fr | (voir seed) | Acheteur |
| admin@mercato.fr | (voir seed) | Admin |

## 📚 Documentation

- [Spécifications Fonctionnelles](./documentation/SPECIFICATIONS_FONCTIONNELLES.md)
- [Architecture](./conception/ARCHITECTURE.md)
- [Modèle Entité-Association](./conception/MODELE_ENTITE_ASSOCIATION.md)
- [Wireframes](./conception/WIREFRAMES.md)
- [Storyboard](./conception/STORYBOARD.md)

## 🚀 Utilisation

### Comme Acheteur
1. Accédez à la page d'accueil
2. Parcourez le catalogue ou utilisez la recherche
3. Consultez les détails d'un produit
4. Achetez immédiatement, enchérissez ou négociez
5. Gérez votre panier et validez l'achat

### Comme Vendeur
1. Connectez-vous avec un rôle vendeur
2. Accédez au tableau de bord
3. Publiez une nouvelle annonce
4. Gérez vos ventes et enchères
5. Répondez aux negociations

## 🔒 Sécurité

- Authentification par session
- Mots de passe hashés (bcrypt)
- Validation côté client ET serveur
- Protection SQL Injection (prepared statements)
- Protection XSS (escaping HTML)
- CORS configuré
- Rate limiting sur authentification

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur:
- Desktop (1920px et plus)
- Tablette (768px à 1024px)
- Mobile (320px à 767px)

## 🐛 Signaler un Bug

Veuillez créer une issue sur GitHub avec:
- Description du problème
- Étapes pour reproduire
- Comportement attendu vs réel

## 📄 Licence

Projet académique ECE ING2 - 2026

## 👥 Auteurs

Projet développé par l'équipe ECE ING2

---

**Dernière mise à jour**: Mai 2026  
**Version**: 1.0.0

