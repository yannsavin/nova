# 🚀 MERCATO NOVA - Guide de Démarrage

## Status ✅

Le site **Nova** est maintenant **complètement relancé** avec les améliorations suivantes :

### ✨ Nouvelles Fonctionnalités

#### 1. **Génération d'Images IA pour les Produits**
- Service `ImageGenerator.php` qui génère les images via Unsplash API
- Fallback sur des images placeholder personnalisées
- Support pour la génération d'images via Hugging Face (configurable)

#### 2. **Page Détail Produit Améliorée**
- Galerie d'images avec navigation
- Affichage complet des informations du produit
- Informations du vendeur avec notation
- Sélecteur de quantité
- Boutons d'actions intégrés (Ajouter au panier, Acheter maintenant)
- Système de favoris (❤️)
- Section description et caractéristiques

#### 3. **Navigation Optimisée**
- Carte produit cliquable → Page détail
- Navigation fluide entre catalogue et détail
- Bouton retour au catalogue
- Gestion des routes dynamiques

#### 4. **Pages Administrateur**
- `/admin` - Page d'initialisation des données
- Boutons pour générer produits de démonstration
- Boutons pour générer images

#### 5. **Intégration du Panier**
- Context API pour la gestion du panier
- Ajout de produits avec quantité
- Persévérance entre les pages

### 📱 Accès

**Frontend (React):** http://localhost:3000
- Accueil: `/`
- Catalogue: `/catalogue`
- Détail produit: `/products/:productId`
- Admin: `/admin` (🔧 icône en haut)

**Backend (PHP API):** http://localhost:8000
- Produits: `GET /api/products`
- Produit détail: `GET /api/products/:id`
- Catégories: `GET /api/categories`

### 🎯 Fichiers Modifiés/Créés

#### Frontend
- ✅ `src/pages/ProductDetailPage.jsx` - Page détail améliorée
- ✅ `src/pages/AdminPage.jsx` - Page admin (NEW)
- ✅ `src/pages/AdminPage.css` - Styles admin (NEW)
- ✅ `src/styles/ProductDetailPage.css` - Styles détail (NEW)
- ✅ `src/services/setupService.js` - Service d'initialisation (NEW)
- ✅ `src/App.jsx` - Routes mises à jour

#### Backend
- ✅ `src/Controllers/ProductController.php` - Méthodes de génération (NEW)
- ✅ `src/Utils/ImageGenerator.php` - Service de génération d'images (NEW)
- ✅ `public/index.php` - Routes API mises à jour
- ✅ `public/setup.php` - Script d'initialisation (NEW)

### 🔧 Configuration

#### Pour générer les produits de démonstration:
1. Allez sur http://localhost:3000/admin
2. Cliquez sur "🚀 Générer Produits de Démo"
3. Les produits s'ajouteront à la base de données

#### Pour générer les images:
1. Allez sur http://localhost:3000/admin
2. Cliquez sur "🖼️ Générer Images"
3. Les images placeholder seront générées

### 📊 Produits Disponibles

Le système inclut 8 produits de démonstration:
1. iPhone 14 Pro - 999.99€
2. MacBook Pro M3 - 1999.99€
3. AirPods Pro - 249.99€
4. Apple Watch Ultra - 799.99€
5. iPad Air - 599.99€
6. Sony WH-1000XM5 - 349.99€
7. Canon EOS R6 - 2499.99€
8. DJI Air 3 - 1299.99€

### 🎨 Styles & UX

- Design moderne avec dégradés et ombres
- Animations fluides (hover effects, transitions)
- Responsive design (mobile-first)
- Badges de statut et de prix
- Galerie d'images avec thumbnails

### 🔄 Flux Utilisateur

```
Accueil → Catalogue (liste des produits)
        ↓
   Cliquer sur produit
        ↓
Page Détail (images, prix, infos vendeur)
        ↓
Ajouter au panier / Acheter immédiatement
        ↓
Panier / Checkout
```

### 📋 Prochaines Étapes (Optionnel)

- [ ] Intégrer PayPal/Stripe pour le paiement
- [ ] Implémenter le système de notation
- [ ] Ajouter les enchères
- [ ] Historique des commandes
- [ ] Système de messages entre vendeurs/acheteurs
- [ ] Filtres avancés du catalogue

### 🐛 Dépannage

**Les images ne s'affichent pas?**
- Utilisez les images placeholder: `https://via.placeholder.com/...`
- Configurez une clé API Unsplash dans `ImageGenerator.php`

**Le backend retourne une erreur 500?**
- Vérifiez que MySQL est en cours d'exécution
- Vérifiez que la base de données `mercato_nova` existe
- Consultez les logs PHP du serveur

**Le frontend React ne se charge pas?**
- Vérifiez que `npm install` a été exécuté dans `/frontend`
- Vérifiez que le port 3000 n'est pas utilisé
- Consultez la console du navigateur pour les erreurs

---

**Développé par:** Système
**Version:** 1.0.0
**Date:** 26 Mai 2026
