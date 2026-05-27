# MERCATO NOVA - Storyboard Parcours Utilisateurs

## 1. PARCOURS ACHETEUR: ACHAT IMMÉDIAT

```
┌─────────────────┐
│ 1. ACCUEIL      │
│ Utilisateur     │
│ arrive sur      │
│ la plateforme   │
│ (authentifié)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. RECHERCHE    │
│ Utilise barre   │
│ de recherche    │
│ ou catégories   │
│ pour trouver    │
│ un produit      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. CATALOGUE    │
│ Voit résultats  │
│ avec filtres     │
│ (prix, état)    │
│ Peut trier      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. DÉTAIL PROD. │
│ Clique sur      │
│ un produit      │
│ Consulte        │
│ images,         │
│ description,    │
│ vendeur         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. AJOUTER      │
│ AU PANIER       │
│ Clique          │
│ "Ajouter au     │
│ panier"         │
│ (quantité: 1)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. CONFIRMATION │
│ Pop-up confirme │
│ l'ajout         │
│ Option continuer│
│ ou accéder      │
│ au panier       │
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐ ┌────────────┐
│Continuer│ │Aller panier│
│shopping │ │            │
└─────┬──┘ └────┬───────┘
      │         │
      ▼         ▼
   (étapes      ┌────────────┐
    2-5)        │ 7. PANIER  │
                │ Vue résumé │
                │ articles   │
                │ total      │
                └────┬───────┘
                     │
                     ▼
                ┌────────────┐
                │ 8. VALIDER │
                │ PANIER     │
                │ Clique     │
                │ "Valider"  │
                └────┬───────┘
                     │
                     ▼
            ┌──────────────────┐
            │ 9. PAIEMENT      │
            │ SIMULATION       │
            │ • Confirmation   │
            │   adresse        │
            │ • Paiement       │
            │   simulé         │
            │ • Résumé commande│
            └────┬─────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ 10. CONFIRMATION    │
        │ • Numéro commande   │
        │ • Email confirmation│
        │ • Infos suivi       │
        │ • Lien facture      │
        │ • Merci du client   │
        └─────────────────────┘
```

**Temps estimé**: 5-10 minutes  
**Points critiques**: 
- Produit en stock
- Validation panier
- Confirmation paiement

---

## 2. PARCOURS ENCHÉRISSEUR: PARTICIPATION À ENCHÈRE

```
┌──────────────────┐
│ 1. DÉCOUVRIR     │
│ ENCHÈRE          │
│ Browse catalogue │
│ ou recherche     │
│ enchères en      │
│ cours            │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. DÉTAIL        │
│ ENCHÈRE          │
│ • Image produit  │
│ • Prix actuel    │
│ • Temps restant  │
│ • Historique bids│
│ • Vendeur info   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. DÉCISION      │
│ • Analyse prix   │
│ • Lecture avis   │
│ • Rép. vendeur   │
│ • Condition      │
└────────┬─────────┘
         │
   ┌─────┴──────┐
   │ Intéressé? │
   │             │
   ▼ OUI         ▼ NON
   │             (fin)
   │
┌──────────────────┐
│ 4. FORMULER      │
│ ENCHÈRE          │
│ • Montant        │
│   minimum à      │
│   proposer       │
│ • Enchère auto?  │
│   (opt.)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. CONFIRMATION  │
│ ENCHÈRE          │
│ • Montant validé │
│ • Message confirm│
│ • Compteur mis   │
│   à jour         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 6. SUIVI         │
│ • Notifications  │
│   (surenchère)   │
│ • Consultation   │
│   historique     │
│ • Email alertes  │
└────────┬─────────┘
         │
  ┌──────┴──────────────────┐
  │                          │
  ▼ Enchère               ▼ Enchère
  réactive              vient à
  reçue              expiration
  │                     │
  ▼                     ▼
┌──────────────┐  ┌──────────────────┐
│7. SURENCHÈRE │  │ 8. RÉSULTAT      │
│ (s'il reste  │  │ • Gagné? Email+  │
│  du temps)   │  │   accès commande │
│• Nouveau     │  │ • Perdu? Avis    │
│  montant     │  │   winner + option│
│• Confirmation│  │   relancer enchère│
└──────┬───────┘  └──────────────────┘
       │
  ┌────┴──────────────────┐
  │ Veut continuer?       │
  ▼ OUI (retour étape 7)  ▼ NON (fin)
  └──────────────────────┘
```

**Temps estimé**: 1 minute (action) + surveillance (variable)  
**Points critiques**:
- Validité de l'enchère (minimum)
- Surenchères simultanées
- Détermination du gagnant

---

## 3. PARCOURS NÉGOCIATEUR: NÉGOCIATION PRIX

```
┌─────────────────────┐
│ 1. PRODUIT EN       │
│ NÉGOCIATION         │
│ Consulte produit    │
│ proposé en          │
│ négociation         │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 2. DÉCISION INITIALE│
│ • Analyse prix affichage│
│ • Evalue faisabilité│
│ • Consulte vendeur  │
│ • Prépare offre     │
└────────┬────────────┘
         │
   ┌─────┴──────┐
   │ Intéressé? │
   ▼ OUI        ▼ NON
   │            (fin)
   │
┌─────────────────────┐
│ 3. PREMIÈRE OFFRE   │
│ • Saisit montant    │
│   (< prix affiché)  │
│ • Message optionnel │
│ • Envoie offre      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 4. ATTENTE RÉPONSE  │
│ • Délai: 24h        │
│ • Notification      │
│ • Consulte chat     │
│ • Peut annuler      │
└────────┬────────────┘
         │
    ┌────┴──────────────┐
    │                   │
    ▼ Réponse      ▼ Expiration
    vendeur        (délai)
    │              │
    ▼              ▼
┌──────────────┐ ┌──────────────┐
│ 5. VENDEUR   │ │ 7. ÉCHEC     │
│ RÉPOND       │ │ • Offre      │
│ • Accepte    │ │   expirée    │
│ • Refuse     │ │ • Peut       │
│ • Propose    │ │   relancer   │
│   nouveau    │ │ • Fin        │
│   prix       │ │   négociation│
└──┬───┬───┬──┘ └──────────────┘
   │   │   │
   ▼   ▼   ▼
  [A] [R] [N]
   │   │   │
   │   │   └─→ (fin)
   │   │
   │   └─→ (fin)
   │
   ▼
┌──────────────────┐
│ 6. ACCORD TROUVÉ │
│ • Montant accepté│
│ • Passage panier │
│ • Paiement       │
│ • Confirmation   │
└──────────────────┘
```

**Temps estimé**: 5 minutes (initiation) + temps attente vendeur  
**Points critiques**:
- Délai de réponse
- Gestion des rejets
- Convertion en commande

---

## 4. PARCOURS VENDEUR: PUBLICATION PRODUIT

```
┌──────────────────┐
│ 1. AUTHENTIFIÉ   │
│ COMME VENDEUR    │
│ Accède tableau   │
│ de bord vendeur  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. AJOUTER       │
│ PRODUIT          │
│ Clique           │
│ "+ Publier"      │
│ Formulaire       │
│ ouvert           │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. REMPLISSAGE FORM.     │
│ • Titre produit          │
│ • Description détaillée  │
│ • Catégorie              │
│ • État du produit        │
│ • Condition (neuf/usé)   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. PRICING & MÉCANISME   │
│ • Type de vente:         │
│   □ Achat immédiat       │
│   □ Enchères             │
│   □ Négociation          │
│   □ Tous les 3           │
│ • Prix pour chaque mode  │
│ • Durée enchères (opt)   │
│ • Prix réserve (opt)     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. IMAGES               │
│ • Télécharge images      │
│ • Définit principale     │
│ • Ordonne les autres     │
│ • Max 10 images          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. LIVRAISON            │
│ • Calcul automatique     │
│ • Options offertes       │
│ • Délai moyen            │
│ • Retours: 30j?          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. VÉRIFICATION         │
│ • Prévisualisation       │
│ • Vérify infos           │
│ • Accepte CGV            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 8. PUBLICATION          │
│ • Produit actif          │
│ • Notification followers │
│ • Email confirmation     │
│ • Visible dans catalogue │
│ • Redirect. dashboard    │
└──────────────────────────┘
```

**Temps estimé**: 10-15 minutes  
**Points critiques**:
- Qualité description/images
- Cohérence prix/conditions
- Validation données

---

## 5. PARCOURS ADMIN: MODÉRATION

```
┌──────────────────────┐
│ 1. ALERTES          │
│ MODÉRATION          │
│ • Signalements      │
│ • Produits suspects │
│ • Utilisateurs      │
│ • Contenu abusif    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ 2. ANALYSE          │
│ • Examine produit   │
│ • Lit descriptions  │
│ • Consulte images   │
│ • Historique seller │
│ • Avis clients      │
└────────┬─────────────┘
         │
    ┌────┴──────────────┐
    │                   │
    ▼ Contenu OK   ▼ Problème
    │              détecté
    │              │
    ▼              ▼
  (fin)     ┌──────────────────┐
            │ 3. ACTION        │
            │ • Suppression    │
            │ • Avertissement  │
            │ • Suspension     │
            │ • Investigation  │
            │ • Contact seller │
            └──────────────────┘
```

**Temps estimé**: Variable  
**Points critiques**:
- Modération équitable
- Respect légal
- Communication

---

## MATRICE DE NAVIGATION

| Depuis | Vers | Via |
|--------|------|-----|
| Accueil | Catalogue | Clic catégorie |
| Catalogue | Détail produit | Clic produit |
| Détail | Panier | Ajouter au panier |
| Détail | Enchère | Clic "Enchérir" |
| Détail | Négociation | Clic "Négocier" |
| Panier | Checkout | Valider panier |
| Checkout | Confirmation | Confirmer paiement |
| Profil | Tableau bord | Clic "Mes ventes" |
| Dashboard | Publication | Clic "+ Produit" |
| Notification | Page concernée | Clic notification |

