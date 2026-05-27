# MERCATO NOVA - Guide d'Installation

## Prérequis Système

### Matériel
- Processeur: 1GHz minimum
- RAM: 2GB minimum (4GB recommandé)
- Disque: 500MB libre

### Logiciels
- **PHP 8.0+** avec extensions: PDO, JSON, cURL
- **MySQL 8.0+** ou équivalent
- **Node.js 16+** et npm
- **Git** (optionnel, pour cloner le projet)

## Installation Détaillée

### Windows

#### 1. Installer PHP
```bash
# Télécharger depuis https://www.php.net/downloads
# Installer dans C:\php
# Ajouter C:\php à la variable PATH
```

#### 2. Installer MySQL
```bash
# Télécharger MySQL Community Edition
# Installer avec MySQL Workbench
# Configuration par défaut (localhost, port 3306)
```

#### 3. Installer Node.js
```bash
# Télécharger et installer depuis https://nodejs.org
# Vérifie: node -v && npm -v
```

#### 4. Cloner le projet
```bash
git clone <repo-url> mercato-nova
cd mercato-nova
```

#### 5. Setup Base de Données
```bash
# Ouvrir MySQL Command Line
mysql -u root -p
# Entrer le mot de passe MySQL

# Créer la base
SOURCE database/schema.sql;
EXIT;
```

#### 6. Setup Backend
```bash
cd backend

# Éditer la configuration
# Fichier: config/database.php
# Vérifier les identifiants MySQL:
# - host: localhost
# - user: root
# - password: votre_mot_de_passe
# - db_name: mercato_nova

# Lancer le serveur PHP
cd public
php -S localhost:8000
# Vérifier: http://localhost:8000
```

#### 7. Setup Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur React
npm start
# Vérifier: http://localhost:3000
```

### macOS / Linux

#### Installation similaire mais avec:

```bash
# Linux - Installer PHP et MySQL via apt
sudo apt-get install php mysql-server nodejs npm

# macOS - Installer via Homebrew
brew install php mysql node
```

#### Démarrer les services MySQL:
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

## Vérification Installation

### Checklist

- [ ] PHP 8.0+ installé: `php -v`
- [ ] MySQL lancé: `mysql -u root -p` (sans erreur)
- [ ] Node.js 16+: `node -v`
- [ ] npm 8+: `npm -v`
- [ ] Base de données créée: `mercato_nova` existe
- [ ] Backend accessible: http://localhost:8000
- [ ] Frontend accessible: http://localhost:3000

### Test Fonctionnalité

#### Backend API
```bash
curl http://localhost:8000/api
# Devrait retourner JSON avec endpoints
```

#### Frontend
```bash
# Ouvrir http://localhost:3000 dans le navigateur
# Devrait afficher la page d'accueil Mercato Nova
```

## Troubleshooting

### Erreur: Port 8000 déjà utilisé
```bash
# Utiliser un autre port
php -S localhost:8001 -t public
```

### Erreur: MySQL ne démarre pas
```bash
# Windows: Vérifier les services
services.msc
# Chercher MySQL8.0, le redémarrer

# Linux
sudo systemctl status mysql
sudo systemctl restart mysql
```

### Erreur: npm install échoue
```bash
# Nettoyer le cache
npm cache clean --force

# Réinstaller
rm -rf node_modules
npm install
```

### Erreur: Base de données introuvable
```bash
# Vérifier les identifiants dans config/database.php
# Relancer le script SQL
mysql -u root -p < database/schema.sql
```

## Configuration Production

Pour un déploiement réel:

1. **SSL/HTTPS**: Obtenir un certificat SSL
2. **Domaine**: Configurer le DNS
3. **Serveur**: Utiliser Apache/Nginx au lieu de PHP intégré
4. **BD**: Utiliser une base de données hébergée
5. **Variables d'environnement**: Utiliser .env pour secrets

## Support

En cas de problème:
1. Consulter les logs: `backend/logs/`
2. Ouvrir la console du navigateur (F12)
3. Vérifier le terminal du serveur pour les erreurs

---

**Date**: Mai 2026  
**Version**: 1.0.0

