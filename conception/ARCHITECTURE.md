# MERCATO NOVA - Architecture Système

## 1. ARCHITECTURE GÉNÉRALE

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (NAVIGATEUR)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React/JavaScript)                 │   │
│  │  ├─ Pages                                               │   │
│  │  │  ├─ Accueil                                         │   │
│  │  │  ├─ Catalogue                                       │   │
│  │  │  ├─ Détail Produit                                 │   │
│  │  │  ├─ Panier                                         │   │
│  │  │  ├─ Enchères                                       │   │
│  │  │  ├─ Négociations                                   │   │
│  │  │  ├─ Profil Utilisateur                            │   │
│  │  │  ├─ Tableau de Bord Vendeur                       │   │
│  │  │  └─ Authentification                              │   │
│  │  └─ Composants                                         │   │
│  │     ├─ Header/Navigation                              │   │
│  │     ├─ ProductCard                                     │   │
│  │     ├─ SearchBar                                       │   │
│  │     ├─ NotificationCenter                             │   │
│  │     └─ ...                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP REST API
                             │ JSON/Multipart
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SERVER (Backend PHP)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  API REST Endpoints                      │   │
│  │  ├─ /api/products                                       │   │
│  │  ├─ /api/users                                          │   │
│  │  ├─ /api/cart                                           │   │
│  │  ├─ /api/auctions                                       │   │
│  │  ├─ /api/negotiations                                   │   │
│  │  ├─ /api/orders                                         │   │
│  │  ├─ /api/notifications                                 │   │
│  │  └─ /api/search                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Business Logic Layer                       │   │
│  │  ├─ ProductService                                      │   │
│  │  ├─ UserService                                         │   │
│  │  ├─ OrderService                                        │   │
│  │  ├─ AuctionService                                      │   │
│  │  ├─ NegotiationService                                  │   │
│  │  ├─ NotificationService                                 │   │
│  │  └─ AuthenticationService                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (DAO/ORM)                │   │
│  │  ├─ UserRepository                                      │   │
│  │  ├─ ProductRepository                                   │   │
│  │  ├─ OrderRepository                                     │   │
│  │  ├─ AuctionRepository                                   │   │
│  │  ├─ NegotiationRepository                               │   │
│  │  └─ Database Connection Manager                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             Utilities & Services                         │   │
│  │  ├─ ImageUploadService                                  │   │
│  │  ├─ EmailService                                        │   │
│  │  ├─ ValidationService                                   │   │
│  │  ├─ SecurityService                                     │   │
│  │  └─ CacheService                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ SQL Queries
                             │ JDBC/MySQLi
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (MySQL)                                    │
│  ├─ utilisateurs                                                │
│  ├─ produits                                                    │
│  ├─ commandes                                                   │
│  ├─ encheres                                                    │
│  ├─ negociations                                                │
│  ├─ notifications                                               │
│  ├─ categories                                                  │
│  └─ ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. STRUCTURE DES DOSSIERS

```
nova/
├── backend/
│   ├── config/
│   │   ├── database.php
│   │   ├── constants.php
│   │   └── config.php
│   ├── src/
│   │   ├── Controllers/
│   │   │   ├── UserController.php
│   │   │   ├── ProductController.php
│   │   │   ├── OrderController.php
│   │   │   ├── AuctionController.php
│   │   │   ├── NegotiationController.php
│   │   │   ├── CartController.php
│   │   │   └── NotificationController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Product.php
│   │   │   ├── Order.php
│   │   │   ├── Auction.php
│   │   │   ├── Negotiation.php
│   │   │   ├── Notification.php
│   │   │   └── ...
│   │   ├── Services/
│   │   │   ├── UserService.php
│   │   │   ├── ProductService.php
│   │   │   ├── OrderService.php
│   │   │   ├── AuctionService.php
│   │   │   ├── NegotiationService.php
│   │   │   ├── AuthService.php
│   │   │   └── ...
│   │   ├── Middleware/
│   │   │   ├── AuthMiddleware.php
│   │   │   ├── ValidationMiddleware.php
│   │   │   └── CorsMiddleware.php
│   │   └── Utils/
│   │       ├── Validator.php
│   │       ├── Security.php
│   │       ├── Logger.php
│   │       └── Response.php
│   ├── public/
│   │   ├── index.php (Point d'entrée)
│   │   ├── uploads/
│   │   │   └── products/
│   │   └── .htaccess
│   ├── composer.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Navigation.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── NotificationCenter.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   └── FilterBar.jsx
│   │   │   ├── Cart/
│   │   │   │   ├── CartView.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CheckoutForm.jsx
│   │   │   ├── Auctions/
│   │   │   │   ├── AuctionDetail.jsx
│   │   │   │   ├── BidForm.jsx
│   │   │   │   └── AuctionList.jsx
│   │   │   ├── Negotiations/
│   │   │   │   ├── NegotiationChat.jsx
│   │   │   │   ├── OfferForm.jsx
│   │   │   │   └── NegotiationList.jsx
│   │   │   └── Auth/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── RegisterForm.jsx
│   │   │       └── ProfileForm.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CatalogPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── OrderHistoryPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── userService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── auctionService.js
│   │   │   └── negotiationService.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useFetch.js
│   │   │   └── useNotifications.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── index.css
│   │   │   └── variables.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── database/
│   ├── schema.sql (Création tables)
│   ├── seed.sql (Données test)
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── ...
│
├── conception/
│   ├── MODELE_ENTITE_ASSOCIATION.md
│   ├── wireframes.md (ASCII art)
│   ├── storyboard.md
│   └── architecture_diagrams.md
│
├── documentation/
│   ├── SPECIFICATIONS_FONCTIONNELLES.md
│   ├── API_DOCUMENTATION.md
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── COMPROMIS_TECHNIQUES.md
│   └── JOURNAL_IA.md
│
├── tests/ (Optionnel)
│   ├── unit/
│   └── integration/
│
├── .gitignore
├── README.md
└── package-lock.json
```

---

## 3. FLUX DE DONNÉES EXEMPLE

### Exemple: Achat d'un produit

```
1. Client clique "Ajouter au panier" dans ProductDetail.jsx
2. Frontend appelle POST /api/cart/add (avec produit_id)
3. Backend (CartController) valide la requête
4. CartService met à jour la base de données
5. Response JSON envoyée au frontend
6. Frontend met à jour CartContext
7. Notification affichée à l'utilisateur

8. Client clique "Valider l'achat"
9. Frontend appelle POST /api/orders/create
10. Backend valide le stock et les données
11. OrderService crée une commande
12. Produit marqué comme "vendu"
13. Stock décrémenté
14. Notifications créées pour acheteur et vendeur
15. Panier vidé
16. Frontend redirige vers page de confirmation
```

---

## 4. SÉCURITÉ

### Authentification
- Session PHP côté serveur
- Tokens JWT (optionnel pour API)
- Mot de passe hashé (bcrypt)

### Autorisation
- Middleware d'authentification sur routes protégées
- Vérification des permissions par rôle

### Validation
- Validation côté client (UX)
- Validation côté serveur (SÉCURITÉ)
- Sanitization des inputs

### Prévention d'Attaques
- Protection CSRF (tokens)
- Protection SQL Injection (prepared statements)
- Protection XSS (escaping HTML)
- Rate limiting (optionnel)

---

## 5. PERFORMANCE

### Backend
- Index sur colonnes fréquemment interrogées
- Caching des catégories
- Pagination des résultats
- Lazy loading des images

### Frontend
- Code splitting React
- Lazy loading des composants
- Optimisation images
- Service worker pour offline

### Database
- Requêtes optimisées
- Indexation appropriée
- Transactions pour cohérence

---

## 6. SCALABILITÉ

Pour une production réelle:
- Séparation serveur/base de données
- Load balancer
- Cache layer (Redis)
- CDN pour images
- Queues asynchrones (notifications)

