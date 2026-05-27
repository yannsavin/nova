<?php
// src/Utils/Validator.php
// Classe pour valider les données

class Validator {
    
    private $errors = [];

    public function validate($data, $rules) {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            
            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    private function applyRule($field, $value, $rule) {
        if (is_string($rule)) {
            if ($rule === 'required' && (empty($value) || (is_string($value) && trim($value) === ''))) {
                $this->addError($field, ucfirst($field) . ' est requis');
            } elseif (strpos($rule, 'min:') === 0) {
                $min = (int)substr($rule, 4);
                if (!empty($value) && strlen($value) < $min) {
                    $this->addError($field, ucfirst($field) . ' doit contenir au moins ' . $min . ' caractères');
                }
            } elseif (strpos($rule, 'max:') === 0) {
                $max = (int)substr($rule, 4);
                if (!empty($value) && strlen($value) > $max) {
                    $this->addError($field, ucfirst($field) . ' ne doit pas dépasser ' . $max . ' caractères');
                }
            } elseif ($rule === 'email' && !empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $this->addError($field, 'Email invalide');
            } elseif ($rule === 'numeric' && !empty($value) && !is_numeric($value)) {
                $this->addError($field, ucfirst($field) . ' doit être numérique');
            } elseif ($rule === 'phone' && !empty($value) && !preg_match('/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/', $value)) {
                $this->addError($field, 'Numéro de téléphone invalide');
            }
        } elseif (is_callable($rule)) {
            $rule($field, $value, $this);
        }
    }

    public function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors() {
        return $this->errors;
    }

    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars((string)$data, ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeSQL($value) {
        return addslashes((string)$value);
    }
}
