<?php
// src/Utils/ImageGenerator.php
// Service pour générer des images IA via des API externes

class ImageGenerator {
    private $unsplashApiKey = 'YOUR_UNSPLASH_API_KEY'; // À configurer
    private $imagesDir = __DIR__ . '/../../public/images/products/';

    public function __construct() {
        // Créer le répertoire s'il n'existe pas
        if (!is_dir($this->imagesDir)) {
            mkdir($this->imagesDir, 0755, true);
        }
    }

    /**
     * Générer une image pour un produit via Unsplash
     * @param string $query - Description du produit
     * @param int $productId - ID du produit
     * @return string - Chemin de l'image
     */
    public function generateImageFromUnsplash($query, $productId) {
        try {
            // Utiliser Unsplash API (gratuit, pas de clé requise)
            $searchUrl = "https://api.unsplash.com/search/photos?query=" . urlencode($query) . "&per_page=1&orientation=landscape";
            
            if (!empty($this->unsplashApiKey)) {
                $searchUrl .= "&client_id=" . $this->unsplashApiKey;
            }

            $response = @file_get_contents($searchUrl);
            if (!$response) {
                // Fallback : image par défaut
                return $this->getPlaceholderImage($productId, $query);
            }

            $data = json_decode($response, true);
            
            if (isset($data['results'][0]['urls']['regular'])) {
                $imageUrl = $data['results'][0]['urls']['regular'];
                $filename = 'product_' . $productId . '_' . time() . '.jpg';
                $filepath = $this->imagesDir . $filename;
                
                // Télécharger l'image
                $imageData = @file_get_contents($imageUrl);
                if ($imageData && file_put_contents($filepath, $imageData)) {
                    return '/images/products/' . $filename;
                }
            }
        } catch (Exception $e) {
            error_log("Erreur ImageGenerator: " . $e->getMessage());
        }

        // Fallback
        return $this->getPlaceholderImage($productId, $query);
    }

    /**
     * Générer une image via Hugging Face (génération IA)
     * @param string $prompt - Description de l'image
     * @param int $productId - ID du produit
     * @return string - Chemin de l'image
     */
    public function generateImageFromHuggingFace($prompt, $productId) {
        try {
            // Utiliser l'API Hugging Face Inference
            $apiUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
            
            // Note: Nécessite une clé API Hugging Face valide
            $apiKey = getenv('HUGGING_FACE_API_KEY');
            
            if (empty($apiKey)) {
                // Fallback vers Unsplash si pas de clé
                return $this->generateImageFromUnsplash($prompt, $productId);
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'inputs' => $prompt,
                'parameters' => [
                    'num_inference_steps' => 50,
                    'guidance_scale' => 7.5
                ]
            ]));
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);

            $response = curl_exec($ch);
            curl_close($ch);

            if ($response) {
                $filename = 'product_' . $productId . '_ai_' . time() . '.jpg';
                $filepath = $this->imagesDir . $filename;
                
                if (file_put_contents($filepath, $response)) {
                    return '/images/products/' . $filename;
                }
            }
        } catch (Exception $e) {
            error_log("Erreur HuggingFace: " . $e->getMessage());
        }

        return $this->generateImageFromUnsplash($prompt, $productId);
    }

    /**
     * Générer une image placeholder
     * @param int $productId - ID du produit
     * @param string $text - Texte à afficher
     * @return string - Chemin de l'image
     */
    private function getPlaceholderImage($productId, $text = '') {
        // Utiliser placeholder.com ou créer une image locale
        $colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'];
        $color = $colors[$productId % count($colors)];
        
        // Utiliser placeholder.com
        return "https://via.placeholder.com/400x300/" . $color . "/FFFFFF?text=" . urlencode(substr($text, 0, 20));
    }

    /**
     * Télécharger une image depuis une URL
     * @param string $url - URL de l'image
     * @param int $productId - ID du produit
     * @return string - Chemin de l'image
     */
    public function downloadImage($url, $productId) {
        try {
            $imageData = @file_get_contents($url);
            if ($imageData) {
                $filename = 'product_' . $productId . '_' . time() . '.jpg';
                $filepath = $this->imagesDir . $filename;
                
                if (file_put_contents($filepath, $imageData)) {
                    return '/images/products/' . $filename;
                }
            }
        } catch (Exception $e) {
            error_log("Erreur downloadImage: " . $e->getMessage());
        }

        return null;
    }
}
?>
