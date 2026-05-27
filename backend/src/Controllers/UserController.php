<?php
// src/Controllers/UserController.php
// Contrôleur utilisateur

class UserController {
    private $db;
    private $userModel;
    private $authMiddleware;

    public function __construct($db) {
        $this->db = $db;
        $this->userModel = new User($db);
        $this->authMiddleware = new AuthMiddleware($db);
    }

    // Inscription
    public function register() {
        try {
            $data = Security::getJSONInput();

            // Validation
            $validator = new Validator();
            if (!$validator->validate($data, [
                'email' => ['required', 'email'],
                'nom' => ['required', 'min:2', 'max:100'],
                'prenom' => ['required', 'min:2', 'max:100'],
                'mot_de_passe' => ['required', 'min:8'],
                'confirmation' => ['required'],
            ])) {
                Response::error('Validation échouée', $validator->getErrors(), 422);
            }

            // Vérifier que les mots de passe correspondent
            if ($data['mot_de_passe'] !== $data['confirmation']) {
                Response::error('Les mots de passe ne correspondent pas');
            }

            // Vérifier que l'email n'existe pas
            if ($this->userModel->emailExists($data['email'])) {
                Response::error('Cet email est déjà utilisé');
            }

            // Créer l'utilisateur
            $userData = [
                'email' => $data['email'],
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'mot_de_passe_hash' => Security::hashPassword($data['mot_de_passe']),
                'role' => $data['role'] ?? 'acheteur',
            ];

            if ($this->userModel->create($userData)) {
                Response::success('Inscription réussie', null, 201);
            } else {
                Response::error('Erreur lors de l\'inscription');
            }
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Connexion
    public function login() {
        try {
            $data = Security::getJSONInput();

            // Validation
            $validator = new Validator();
            if (!$validator->validate($data, [
                'email' => ['required', 'email'],
                'mot_de_passe' => ['required'],
            ])) {
                Response::error('Validation échouée', $validator->getErrors(), 422);
            }

            // Vérifier le rate limiting
            if (!Security::checkRateLimit('login_' . $data['email'])) {
                Response::error('Trop de tentatives de connexion. Réessayez dans 15 minutes.');
            }

            // Connexion
            if ($this->authMiddleware->login($data['email'], $data['mot_de_passe'])) {
                $user = $this->userModel->getByEmail($data['email']);
                Response::success('Connexion réussie', [
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'nom' => $user['nom'],
                        'role' => $user['role'],
                    ]
                ]);
            } else {
                Response::error('Email ou mot de passe incorrect', null, 401);
            }
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Obtenir un profil utilisateur
    public function getById($id) {
        try {
            $user = $this->userModel->getById($id);
            
            if (!$user) {
                Response::notFound('Utilisateur non trouvé');
            }

            // Si c'est un vendeur, obtenir ses statistiques
            if ($user['role'] === 'vendeur') {
                $publicProfile = $this->userModel->getPublicProfile($id);
                $ratingInfo = $this->userModel->getAverageRating($id);
                
                $user['reputation'] = $ratingInfo['avg_rating'] ?? 5.00;
                $user['total_ratings'] = $ratingInfo['total_ratings'] ?? 0;
            }

            Response::success('Utilisateur trouvé', ['user' => $user]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Obtenir l'utilisateur connecté (via session)
    public function getCurrentUser() {
        try {
            $currentUser = $this->authMiddleware->getCurrentUser();
            if (!$currentUser) {
                Response::unauthorized('Non authentifié');
                return;
            }
            $user = $this->userModel->getById($currentUser['id']);
            if (!$user) {
                Response::unauthorized('Utilisateur introuvable');
                return;
            }
            Response::success('Utilisateur récupéré', [
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'nom' => $user['nom'],
                    'prenom' => $user['prenom'],
                    'role' => $user['role'],
                ]
            ]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Déconnexion
    public function logout() {
        try {
            $this->authMiddleware->logout();
            Response::success('Déconnexion réussie');
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }

    // Obtenir l'historique d'achat d'un utilisateur
    public function getPurchaseHistory($userId) {
        try {
            // Vérifier que l'utilisateur demande son propre historique
            if (!isset($_SESSION['user_id']) || (int)$_SESSION['user_id'] !== (int)$userId) {
                Response::unauthorized('Accès refusé');
                return;
            }

            $query = "SELECT
                        c.id, c.numero_commande, c.date_commande, c.prix_total, c.statut,
                        p.id as product_id, p.titre as titre_produit, p.image_principale,
                        u.nom as vendeur_nom, u.prenom as vendeur_prenom, u.id as vendeur_id
                      FROM commandes c
                      JOIN produits p ON c.produit_id = p.id
                      JOIN utilisateurs u ON c.vendeur_id = u.id
                      WHERE c.acheteur_id = :user_id
                      ORDER BY c.date_commande DESC
                      LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([':user_id' => $userId]);
            $purchases = $stmt->fetchAll();

            Response::success('Historique d\'achat récupéré', ['purchases' => $purchases]);
        } catch (Exception $e) {
            Response::serverError('Erreur: ' . $e->getMessage());
        }
    }
}
