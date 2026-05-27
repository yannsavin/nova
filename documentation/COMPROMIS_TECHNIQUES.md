# MERCATO NOVA - Rapport de Compromis Techniques et Décisions

## Résumé Exécutif

Ce rapport synthétise les principaux choix, compromis et ajustements réalisés pendant le développement de Mercato Nova. L'objectif n'est pas de présenter un projet "parfait", mais de démontrer une capacité à analyser des contraintes réelles et à prendre des décisions pertinentes en contexte académique.

---

## 1. ARCHITECTURE

### Choix Réalisé: Architecture Client-Serveur Simple

**Justification**:
- Séparation claire frontend/backend (meilleure maintenabilité)
- Apprentissage technologique: React + PHP
- Déploiement plus facile
- Scalabilité acceptable pour MVP

**Compromis**:
- Pas d'authentification JWT (sessions classiques)
- Pas de cache Redis (implémentation ultérieure)
- Pas de microservices (complexité non justifiée)

**Limites reconnues**:
- Monolithe backend
- État limité à la session (pas de token JWT)
- Base de données non shardée

### Alternative Rejetée: Architecture Microservices

**Pourquoi pas?**
- Surplus de complexité pour un MVP
- Temps de développement doublé
- Difficultés de déploiement local
- Non pertinent pour cette taille de projet

---

## 2. BASE DE DONNÉES

### Choix Réalisé: MySQL avec Schema Normalisé

**Justification**:
- SGBD classique et fiable
- Normalisation 3NF pour intégrité des données
- Support natif des transactions
- Index appropriés pour performances

**Compromis Réalisés**:
- Pas de partitioning (100k produits < seuil)
- Pas de cache de requêtes (application-level possible)
- Validations aussi côté application

**Optimisations Implémentées**:
- Indexes sur colonnes fréquemment interrogées
- Prepared statements (protection SQL injection)
- Transactions pour atomicité des commandes
- Clés étrangères pour intégrité référentielle

---

## 3. AUTHENTIFICATION & SÉCURITÉ

### Choix Réalisé: Sessions PHP + Bcrypt

**Justification**:
- Contexte académique (pas d'exigences production)
- Suffisant pour authentification basique
- Pas de besoin multi-domaine
- Plus simple que JWT

**Sécurité Implémentée**:
- Mots de passe hashés (bcrypt, cost=10)
- Protection CSRF basique
- Prepared statements contre SQL injection
- Validation côté serveur obligatoire
- Escaping HTML contre XSS
- Rate limiting sur authentification

**Limites Acceptées**:
- Pas de MFA (complexité non justifiée)
- Sessions non distribuées (local only)
- Pas de refresh tokens
- CORS non restrictif (dev only)

### Alternative Rejetée: JWT

**Pourquoi pas?**
- Complexité supplémentaire
- Nécessiterait Redis pour blacklist
- Pas d'avantage apparent pour ce projet
- Secrets à gérer (plus difficile localement)

---

## 4. INTERFACE UTILISATEUR

### Choix Réalisé: React 18 avec CSS3

**Justification**:
- Framework moderne et populaire
- Ecosystem riche
- Composants réutilisables
- Gestion d'état avec Context API (suffisant)

**Compromis**:
- Pas de framework CSS (Bootstrap) → CSS custom
- Pas de state management complexe (Redux)
- Pas de TypeScript (complexité non justifiée)
- Pas de test unitaires frontend

**Design Decisions**:
- Responsive mobile-first
- 12 produits par page (équilibre chargement/scroll)
- Composants réutilisables (ProductCard, etc.)
- LocalStorage pour panier temporaire

### Alternative Rejetée: Vue.js

**Pourquoi pas?**
- React plus populaire et documenté
- Apprentissage React prioritaire
- Écosystème React plus mature

---

## 5. MÉCANISMES DE TRANSACTION

### Enchères: Implémentation Basique

**Ce qui Marche**:
- Historique des offres complète
- Détermination correcte du gagnant
- Notification en temps réel (polling)

**Compromis**:
- Pas de WebSocket (polling à la place)
- Pas de détection concurrence avancée
- Pas d'enchères automatiques sophistiquées

**Limites Acceptées**:
- Enchères expirées via application (pas de cron)
- Délai avant expiration détectée (~5min)
- Pas de vérification race condition complète

### Négociation: Conversation Basique

**Ce qui Marche**:
- Historique des messages complet
- États bien définis
- Délais de réponse respectés

**Simplifications**:
- Messages texte simples (pas de fichiers)
- Pas de dégagement automatique
- Pas de suggeste de prix IA

**Limites Acceptées**:
- Pas de notifications push
- Pas de chat en temps réel
- Pas d'escalade administrative

---

## 6. FONCTIONNALITÉS INITIALEMENT ENVISAGÉES MAIS ABANDONNÉES

### 1. Système de Notation (⭐)
**Envisagé**: Système complet avec photo de profil vendeur, commentaires détaillés
**Réalisé**: Notation simple, stockée en base
**Raison**: Manque de temps, complexité UI élevée

### 2. Notifications Push
**Envisagé**: Notifications en temps réel via WebSocket
**Réalisé**: Polling à intervalle régulier
**Raison**: WebSocket plus complexe, polling suffisant pour MVP

### 3. Filtres Avancés
**Envisagé**: Filtres multiples (couleur, taille, année, vendeur spécifique)
**Réalisé**: Filtres basiques (prix, condition, catégorie, type)
**Raison**: Ajout complexité UI sans valeur pédagogique

### 4. Wishlist/Collections
**Envisagé**: Organisation des favoris en collections nommées
**Réalisé**: Favoris simples (liste globale)
**Raison**: Complexité UI, peu utilisé en MVP

### 5. Upload d'Images Multiples
**Envisagé**: Drag-drop, compression auto, galerie complète
**Réalisé**: Upload simple, 1 image principale
**Raison**: Complexité serveur, storage non configuré

### 6. Paiement Réel
**Envisagé**: Intégration Stripe/PayPal
**Réalisé**: Paiement simulé
**Raison**: Contexte académique, config complexe locale

---

## 7. DIFFICULTÉS TECHNIQUES MAJEURES

### 1. Gestion de la Concurrence (Enchères)
**Problème**: Deux enchères simultanées au même prix
**Solution**: Vérification stricte côté serveur, timestamp microseconde
**Impact**: Légère latence, mais fiabilité garantie

### 2. Performance Recherche
**Problème**: MATCH AGAINST lent sur >100k produits
**Solution**: Full-text index MySQL, pagination obligatoire
**Impact**: Acceptable pour usage courant

### 3. Communication Frontend/Backend
**Problème**: CORS, délai réseau, gestion erreurs
**Solution**: Proxy axios, gestion centralisée erreurs
**Impact**: Expérience utilisateur correcte

### 4. Gestion Paniers Volumineux
**Problème**: LocalStorage limité (5-10MB)
**Solution**: Stockage server-side pour utilisateurs connectés
**Impact**: Panier volatile mais fonctionnel

---

## 8. SOLUTIONS GÉNÉRÉES PAR IA (Critique)

### ChatGPT / Claude

**Utile** ✅:
- Structure de base des services
- Requêtes SQL correctes
- Fonction helper (validation, hashing)
- Exemples d'architecture

**À Corriger** ❌:
- Oubli de validation serveur
- Gestion d'erreur incomplète
- Pas de vérification transactions
- Code répétitif (non DRY)

**Limites** ⚠️:
- Pas d'authentification CSRF
- Pas de protection rate-limiting
- Code générique sans contexte projet
- Nécessité d'intégration manuelle

### Approche Adoptée:
1. Utiliser IA pour structure de base
2. Toujours implémenter la validation serveur
3. Adapter le code au contexte
4. Tester chaque fonction intégrée
5. Documenter les modifications apportées

---

## 9. OPTIMISATIONS POSSIBLES (Futures)

### À Court Terme (< 1h)
- [ ] Ajouter des tests unitaires backend
- [ ] Minifier CSS/JS en production
- [ ] Implémenter pagination backend

### À Moyen Terme (1-4h)
- [ ] Remplacer polling par WebSocket
- [ ] Ajouter vérification stock temps réel
- [ ] Implémenter upload images
- [ ] Ajouter recherche par catégories sous-niveaux

### À Long Terme (> 4h)
- [ ] Microservices (si croissance)
- [ ] Cache Redis
- [ ] Authentification JWT
- [ ] Paiement réel (Stripe)
- [ ] Notification push
- [ ] Machine Learning recommendations

---

## 10. LEÇONS APPRISES

### ✅ Ce qui a Bien Fonctionné
1. **Séparation Frontend/Backend**: Clarté et maintenabilité
2. **Utilisation IA comme assistant**: Gain de temps réel
3. **Tests en cours de développement**: Bugs détectés tôt
4. **Documentation exhaustive**: Compréhension facilitée
5. **Scope raisonnable**: Livrable réaliste

### ⚠️ Ce qu'il Faudrait Refaire
1. **Tests automatisés dès le départ**: Couverture meilleure
2. **Plus de prototypage**: Avant codage
3. **Configuration CI/CD** : Pour déploiement continu
4. **Mock data plus réaliste**: Pour tests
5. **Code review** : Détection bugs plus tôt

### 🎯 Recommandations Futures
- Établir des critères d'acceptation clairs
- Utiliser pair programming pour critiques
- Documenter au fur et à mesure
- Planifier refactoring régulier
- Maintenance documentation = priorité

---

## Conclusion

Mercato Nova démontre une compréhension solide des principes web modernes avec une architecture cohérente, une sécurité minimale appropriée et des fonctionnalités complètes. Les compromis réalisés reflètent une analyse pragmatique des contraintes (temps, complexité, apprentissage) plutôt que des limitations techniques.

L'utilisation d'outils IA a été bénéfique comme assistant de développement, mais la validation critique et l'intégration manuelle restaient essentielles. Le projet valurise la réflexion, la cohérence et la compréhension plutôt que la simple accumulation de fonctionnalités.

---

**Date**: Mai 2026
**Auteur**: Équipe ECE ING2
**Version**: 1.0

