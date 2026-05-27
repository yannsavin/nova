<?php
// config/config.php
// Configuration générale

define('BASE_URL', 'http://localhost/nova/backend/public/');
define('APP_NAME', 'Mercato Nova');
define('APP_VERSION', '1.0.0');

// Sécurité
define('SESSION_TIMEOUT', 3600); // 1 heure
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCK_TIME', 900); // 15 minutes

// Upload images
define('UPLOAD_DIR', __DIR__ . '/../public/uploads/');
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif']);
define('ALLOWED_MIME_TYPES', ['image/jpeg', 'image/png', 'image/gif']);

// Pagination
define('ITEMS_PER_PAGE', 12);

// Email (configuration test)
define('MAIL_FROM', 'no-reply@mercato-nova.fr');

// Timezone
date_default_timezone_set('Europe/Paris');
