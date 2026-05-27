<?php
// public/index.php
// Point d'entrée de l'API

session_start();

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger les configurations
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

// Charger les classes utilitaires
require_once __DIR__ . '/../src/Utils/Response.php';
require_once __DIR__ . '/../src/Utils/Validator.php';
require_once __DIR__ . '/../src/Utils/Security.php';
require_once __DIR__ . '/../src/Utils/ImageGenerator.php';

// Charger les middlewares
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

// Charger les modèles
require_once __DIR__ . '/../src/Models/User.php';
require_once __DIR__ . '/../src/Models/Product.php';

// Charger les contrôleurs
require_once __DIR__ . '/../src/Controllers/UserController.php';
require_once __DIR__ . '/../src/Controllers/ProductController.php';
require_once __DIR__ . '/../src/Controllers/CartController.php';
require_once __DIR__ . '/../src/Controllers/OrderController.php';

// Initialiser la connexion à la base de données
$database = new Database();
$db = $database->connect();

// Router simple
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Supprimer les slashes au début et à la fin
$path = trim($path, '/');

// Routage des endpoints
try {
    if (empty($path)) {
        Response::success('Bienvenue sur l\'API Mercato Nova', [
            'version' => APP_VERSION,
            'endpoints' => [
                'GET /api/products' => 'Lister les produits',
                'GET /api/products/:id' => 'Détail d\'un produit',
                'GET /api/users/:id' => 'Profil utilisateur',
                'POST /api/auth/register' => 'Inscription',
                'POST /api/auth/login' => 'Connexion',
                'POST /api/cart/add' => 'Ajouter au panier',
            ]
        ]);
    }

    // Routes API
    if (preg_match('/^api\/products$/', $path)) {
        $controller = new ProductController($db);
        if ($method === 'GET') {
            $controller->getAll();
        } elseif ($method === 'POST') {
            $controller->create();
        }
    } elseif (preg_match('/^api\/products\/generate-demo$/', $path)) {
        $controller = new ProductController($db);
        if ($method === 'POST') {
            $controller->generateDemoProducts();
        }
    } elseif (preg_match('/^api\/products\/generate-images$/', $path)) {
        $controller = new ProductController($db);
        if ($method === 'POST') {
            $controller->generateImages();
        }
    } elseif (preg_match('/^api\/products\/(\d+)\/images$/', $path, $matches)) {
        $controller = new ProductController($db);
        if ($method === 'POST') {
            $controller->uploadImages($matches[1]);
        }
    } elseif (preg_match('/^api\/products\/(\d+)$/', $path, $matches)) {
        $controller = new ProductController($db);
        if ($method === 'GET') {
            $controller->getById($matches[1]);
        } elseif ($method === 'PUT') {
            $controller->update($matches[1]);
        } elseif ($method === 'DELETE') {
            $controller->delete($matches[1]);
        }
    } elseif (preg_match('/^api\/users\/(\d+)$/', $path, $matches)) {
        $controller = new UserController($db);
        if ($method === 'GET') {
            $controller->getById($matches[1]);
        }
    } elseif (preg_match('/^api\/auth\/register$/', $path)) {
        $controller = new UserController($db);
        if ($method === 'POST') {
            $controller->register();
        }
    } elseif (preg_match('/^api\/auth\/login$/', $path)) {
        $controller = new UserController($db);
        if ($method === 'POST') {
            $controller->login();
        }
    } elseif (preg_match('/^api\/auth\/logout$/', $path)) {
        $controller = new UserController($db);
        if ($method === 'POST') {
            $controller->logout();
        }
    } elseif (preg_match('/^api\/auth\/me$/', $path)) {
        $controller = new UserController($db);
        if ($method === 'GET') {
            $controller->getCurrentUser();
        }
    } elseif (preg_match('/^api\/orders$/', $path)) {
        $controller = new OrderController($db);
        if ($method === 'POST') {
            $controller->createImmediate();
        }
    } elseif (preg_match('/^api\/categories$/', $path)) {
        // Route pour les catégories
        $query = "SELECT id, nom, description FROM categories ORDER BY nom ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll();
        Response::success('Catégories récupérées', ['categories' => $categories]);
    } elseif (preg_match('/^api\/users\/(\d+)\/purchases$/', $path, $matches)) {
        $controller = new UserController($db);
        if ($method === 'GET') {
            $controller->getPurchaseHistory($matches[1]);
        }
    } elseif (preg_match('/^api\/vendors\/(\d+)\/products$/', $path, $matches)) {
        $controller = new ProductController($db);
        $controller->getVendorProducts($matches[1]);
    } else {
        Response::notFound('Endpoint non trouvé');
    }
} catch (Exception $e) {
    Response::serverError('Erreur: ' . $e->getMessage());
}
