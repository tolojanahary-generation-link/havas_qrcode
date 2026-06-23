# Documentation de l'API - Plateforme de Gestion de QR Codes

Cette documentation décrit en détail l'API Express.js de la Plateforme de Gestion de QR Codes.

## 📌 Informations Générales

* **URL de base** : `http://localhost:3000/api` (ou selon configuration via `APP_URL`)
* **Format des requêtes/réponses** : `application/json` (sauf téléversements/exports de fichiers)
* **Code source d'entrée principal** : [app.js](file:///c:/Users/182-DESSINATEURS/Documents/back/app.js)
* **Fichier central de routage** : [routes/index.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/index.js)

---

## 🔒 Authentification & Sécurité

Toutes les routes marquées comme **[Protégée]** nécessitent un jeton JWT d'accès valide fourni dans l'en-tête de la requête HTTP :
```http
Authorization: Bearer <votre_access_token>
```

Le middleware gérant l'authentification est disponible ici : [middlewares/authMiddleware.js](file:///c:/Users/182-DESSINATEURS/Documents/back/middlewares/authMiddleware.js).

---

## 📋 Formats de Réponse Standardisés

L'API renvoie des réponses JSON uniformes.

### Succès
```json
{
  "success": true,
  "message": "Message explicatif de réussite.",
  "data": {} // Objet ou tableau de données
}
```

### Échec (Erreur validation ou métier)
```json
{
  "success": false,
  "message": "Description de l'erreur.",
  "errors": [
    { "field": "nom_du_champ", "message": "Détails sur l'erreur" }
  ]
}
```

### Données Segmentées (Pagination)
```json
{
  "success": true,
  "message": "Liste récupérée avec succès.",
  "data": {
    "items": [] // Liste des entités
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## 🔑 1. Authentification (`/api/auth`)
*Fichier de routes* : [routes/authRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/authRoutes.js) | *Validateur* : [validators/authValidator.js](file:///c:/Users/182-DESSINATEURS/Documents/back/validators/authValidator.js) | *Contrôleur* : [controllers/authController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/authController.js)

### `POST /api/auth/login` (Public)
Permet à un utilisateur de s'authentifier.
* **Payload de requête** :
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Connexion réussie.",
    "data": {
      "utilisateur": { "id": 1, "firstname": "John", "lastname": "Doe", "email": "user@example.com", "roleId": 2, "collaboratorId": 1 },
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
  ```

### `POST /api/auth/logout` (Protégé)
Invalide le jeton de rafraîchissement (Refresh Token) et déconnecte l'utilisateur.
* **Payload de requête** :
  ```json
  {
    "refreshToken": "eyJhbG..."
  }
  ```
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Déconnexion réussie."
  }
  ```

### `POST /api/auth/refresh-token` (Public)
Renouvelle les jetons Access Token et Refresh Token (mécanisme de rotation).
* **Payload de requête** :
  ```json
  {
    "refreshToken": "eyJhbG..."
  }
  ```
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Token rafraîchi avec succès.",
    "data": {
      "accessToken": "eyJhbG-nouveau...",
      "refreshToken": "eyJhbG-nouveau..."
    }
  }
  ```

### `POST /api/auth/forgot-password` (Public)
Génère un jeton de réinitialisation de mot de passe (retourné dans la réponse en mode `development`).
* **Payload de requête** :
  ```json
  {
    "email": "user@example.com"
  }
  ```
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Si cette adresse email existe, un lien de réinitialisation a été envoyé.",
    "data": {
      "message": "Un lien de réinitialisation a été envoyé.",
      "resetToken": "abcd...", // Présent uniquement en NODE_ENV = development
      "expiresAt": "2026-06-18T17:18:32.000Z"
    }
  }
  ```

### `POST /api/auth/reset-password` (Public)
Réinitialise le mot de passe de l'utilisateur à l'aide d'un jeton valide.
* **Payload de requête** :
  ```json
  {
    "token": "abcd...",
    "password": "NewSecurePassword123",
    "confirmPassword": "NewSecurePassword123"
  }
  ```
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Mot de passe réinitialisé avec succès. Veuillez vous reconnecter."
  }
  ```

### `GET /api/auth/me` (Protégé)
Récupère les informations de l'utilisateur actuellement connecté.
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Utilisateur récupéré avec succès.",
    "data": {
      "utilisateur": { "id": 1, "firstname": "John", "lastname": "Doe", "email": "user@example.com", "roleId": 2, "collaboratorId": 1 }
    }
  }
  ```

---

## 🏢 2. Gestion des Collaborators (`/api/collaborators`)
*Fichier de routes* : [routes/collaboratorRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/collaboratorRoutes.js) | *Validateur* : [validators/collaboratorValidator.js](file:///c:/Users/182-DESSINATEURS/Documents/back/validators/collaboratorValidator.js) | *Contrôleur* : [controllers/collaboratorController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/collaboratorController.js)

### `GET /api/collaborators` (Protégé)
Récupère la liste des collaborators.
* **Paramètres Query optionnels** :
  * `page` (défaut : 1)
  * `limit` (défaut : 10)
  * `search` (recherche par entreprise, contact, ou email)
  * `isActive` (`true` / `false`)
  * `city`
  * `country`
  * `sortBy` (défaut : `createdAt`)
  * `sortOrder` (`asc` / `desc`)
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Liste des collaborators récupérée avec succès.",
    "data": {
      "collaborators": [
        { "id": 1, "companyName": "Havas", "contactName": "Directeur", "email": "havas@example.com", "isActive": true }
      ]
    },
    "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### `GET /api/collaborators/:id` (Protégé)
Récupère les détails d'un collaborator spécifique par son ID numérique.
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Collaborator récupéré avec succès.",
    "data": {
      "collaborator": { "id": 1, "companyName": "Havas", "contactName": "Directeur", "email": "havas@example.com", "phone": "0123456789", "address": "Rue de l'agence", "city": "Paris", "country": "France", "isActive": true }
    }
  }
  ```

### `POST /api/collaborators` (Protégé)
Crée un nouveau collaborator.
* **Payload de requête** (Tous requis sauf `logo`) :
  ```json
  {
    "companyName": "Nom de l'entreprise",
    "contactName": "Nom du contact principal",
    "email": "contact@entreprise.com",
    "phone": "+33 1 23 45 67 89",
    "address": "123 Rue de la réussite",
    "city": "Paris",
    "country": "France",
    "logo": "https://url-du-logo.png"
  }
  ```

### `PUT /api/collaborators/:id` (Protégé)
Modifie les champs d'un collaborator existant. Les propriétés absentes ne seront pas modifiées.
* **Payload de requête** (Champs optionnels) :
  ```json
  {
    "companyName": "Nouveau nom",
    "contactName": "Nouveau contact"
  }
  ```

### `DELETE /api/collaborators/:id` (Protégé)
Supprime définitivement un collaborator.
> [!WARNING]
> La suppression est rejetée (409 Conflict) si des utilisateurs ou des QR codes sont toujours associés à ce collaborator.

---

## 📁 3. Gestion des Dossiers (`/api/folders`)
*Fichier de routes* : [routes/folderRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/folderRoutes.js) | *Validateur* : [validators/folderValidator.js](file:///c:/Users/182-DESSINATEURS/Documents/back/validators/folderValidator.js) | *Contrôleur* : [controllers/folderController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/folderController.js)

### `GET /api/folders` (Protégé)
Récupère les dossiers de stockage des QR Codes.
* **Paramètres Query optionnels** : `page`, `limit`, `search`, `collaboratorId`, `sortBy`, `sortOrder`.

### `GET /api/folders/:id` (Protégé)
Détails d'un dossier.

### `POST /api/folders` (Protégé)
Crée un dossier.
* **Payload de requête** :
  ```json
  {
    "name": "Dossier Marketing",
    "description": "QR Codes pour la campagne d'été",
    "collaboratorId": 1
  }
  ```

### `PUT /api/folders/:id` (Protégé)
Modifie un dossier.

### `DELETE /api/folders/:id` (Protégé)
Supprime un dossier.
> [!WARNING]
> Impossible de supprimer un dossier qui contient toujours des QR codes associés (409 Conflict).

---

## 🖼️ 4. Gestion des QR Codes (`/api/qrcodes`)
*Fichier de routes* : [routes/qrcodeRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/qrcodeRoutes.js) | *Validateur* : [validators/qrcodeValidator.js](file:///c:/Users/182-DESSINATEURS/Documents/back/validators/qrcodeValidator.js) | *Contrôleur* : [controllers/qrcodeController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/qrcodeController.js)

### `GET /api/qrcodes` (Protégé)
Liste paginée des QR codes.
* **Paramètres Query optionnels** :
  * `page` (défaut : 1)
  * `limit` (défaut : 10)
  * `search` (recherche par nom, description, uuid, destinationUrl)
  * `type` (`static` ou `dynamic`)
  * `collaboratorId`
  * `folderId`
  * `isActive` (`true` ou `false`)

### `GET /api/qrcodes/:id` (Protégé)
Récupère le détail complet d'un QR Code.

### `POST /api/qrcodes` (Protégé)
Génère un QR code individuel.
* **Payload de requête** :
  ```json
  {
    "name": "QR Code Menu Restaurant",
    "description": "Lien vers la carte numérique du restaurant",
    "type": "dynamic", // 'static' ou 'dynamic'
    "destinationUrl": "https://restaurant.com/carte.pdf",
    "collaboratorId": 1,
    "folderId": 2, // Optionnel
    "color": "#000000", // Optionnel, défaut: noir
    "backgroundColor": "#FFFFFF", // Optionnel, défaut: blanc
    "logo": "https://restaurant.com/logo.png" // Optionnel
  }
  ```

### `POST /api/qrcodes/bulk` (Protégé)
Génère des QR codes en masse à partir d'un fichier Excel.
* **Requête** : `multipart/form-data`
  * Fichier attaché sous le champ `file` (Seuls les formats `.xlsx` et `.xls` sont acceptés).
  * Structure attendue des colonnes du fichier Excel : `name`, `destinationUrl`, `type` (valeurs `static` ou `dynamic`), `collaboratorId`, et facultativement `description`, `folderId`, `color`, `backgroundColor`, `logo`.
* **Réponse de succès (201 Created)** :
  ```json
  {
    "success": true,
    "message": "QR codes créés en masse avec succès.",
    "data": {
      "totalTraitées": 10,
      "créés": 8,
      "erreurs": 2,
      "détailsErreurs": [
        { "row": 3, "message": "Type invalide : \"custom\"" }
      ]
    }
  }
  ```

### `PUT /api/qrcodes/:id` (Protégé)
Modifie la configuration d'un QR code existant (nom, couleurs, etc.).

### `PATCH /api/qrcodes/:id/destination` (Protégé)
Met à jour l'URL cible (URL de destination) d'un QR Code dynamique existant sans en modifier l'image.
* **Payload de requête** :
  ```json
  {
    "destinationUrl": "https://nouvelle-adresse.com/page"
  }
  ```
> [!IMPORTANT]
> Cette mise à jour d'URL cible est impossible pour les QR Codes de type `static` (génèrera une erreur 400).

### `PATCH /api/qrcodes/:id/activate` (Protégé)
Active un QR Code désactivé.

### `PATCH /api/qrcodes/:id/deactivate` (Protégé)
Désactive temporairement un QR code. La redirection renverra une erreur 410 Gone pour les utilisateurs scannant ce QR code.

### `DELETE /api/qrcodes/:id` (Protégé)
Supprime définitivement un QR Code et son historique de redirection.

### `GET /api/qrcodes/:id/image` (Protégé)
Génère l'image du QR Code à la volée et la renvoie directement comme flux d'image (affichage dans le navigateur).
* **Paramètres Query optionnels** :
  * `format` : `png` (défaut) ou `svg`
  * `size` : largeur de l'image en pixels (ex. `500` - défaut : `300`)
* **Réponse** : Binaire brut (`image/png` ou `image/svg+xml`).

### `GET /api/qrcodes/:id/download` (Protégé)
Télécharge l'image du QR code (provoque l'affichage de la boîte de dialogue d'enregistrement du navigateur).
* **Paramètres Query optionnels** : `format` (png/svg), `size` (défaut: 300)
* **Réponse** : Fichier binaire en téléchargement.

---

## 📈 5. Scans et Analyses (`/api/scan`, `/api/scans`)
*Fichier de routes* : [routes/scanRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/scanRoutes.js) | *Contrôleur* : [controllers/scanController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/scanController.js)

### `GET /api/scan/:uuid` (Public)
Endpoint principal de redirection publique.
1. Recherche le QR Code dynamique via son `uuid`.
2. Extrait les informations analytiques de l'utilisateur (Adresse IP, Pays, Navigateur, OS, Type d'appareil, Referer, User Agent).
3. Enregistre une entrée de scan dans l'historique de la base de données.
4. Effectue une redirection HTTP 302 vers l'URL finale (`destinationUrl`).

### `GET /api/scans/history/:qrCodeId` (Protégé)
Récupère l'historique complet des scans d'un QR code.
* **Paramètres Query optionnels** : `page`, `limit`, `browser`, `device`, `country`, `startDate`, `endDate`, `sortBy`, `sortOrder`.

### `GET /api/scans/stats/:qrCodeId` (Protégé)
Obtient les métriques synthétisées pour un QR Code (Nombre total de scans, répartition par OS, par navigateur, par type d'appareil, par pays et évolution temporelle).
* **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "message": "Statistiques du QR code récupérées avec succès.",
    "data": {
      "qrCode": { "id": 1, "name": "Menu", "uuid": "abc-...", "type": "dynamic" },
      "statistiques": {
        "totalScans": 150,
        "scansParAppareil": { "Desktop": 30, "Mobile": 120 },
        "scansParOS": { "iOS": 80, "Android": 40, "Windows": 30 },
        "scansParNavigateur": { "Safari": 75, "Chrome": 65, "Firefox": 10 }
      }
    }
  }
  ```

### `GET /api/scans/dashboard/stats` (Protégé)
Récupère les statistiques globales agrégées de la plateforme ou d'un collaborator spécifique.
* **Paramètres Query optionnels** : `collaboratorId` (Permet de filtrer pour un collaborator spécifique).

---

## 📤 6. Importation de QR Codes (`/api/import`)
*Fichier de routes* : [routes/importRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/importRoutes.js) | *Contrôleur* : [controllers/importController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/importController.js)

Ces endpoints proposent un processus d'importation en 3 étapes sécurisé.

### Étape 1 : `POST /api/import/upload` (Protégé)
Téléverse le fichier Excel de données brutes sur le serveur.
* **Requête** : `multipart/form-data` avec le fichier sous la clé `file`.
* **Réponse** : Retourne le `filename` généré à utiliser pour les étapes suivantes.

### Étape 2 : `POST /api/import/validate` (Protégé)
Vérifie la structure et la validité des données du fichier téléversé.
* **Payload de requête** :
  ```json
  {
    "filename": "import-1718712312-89234.xlsx"
  }
  ```
* **Réponse** : Fournit le décompte des lignes valides, invalides et les erreurs rencontrées par ligne.

### Étape 3 : `POST /api/import/execute` (Protégé)
Parcourt le fichier, crée les QR Codes et enregistre le rapport final dans l'historique d'importation.
* **Payload de requête** :
  ```json
  {
    "filename": "import-1718712312-89234.xlsx"
  }
  ```
* **Réponse** :
  ```json
  {
    "success": true,
    "message": "Import terminé.",
    "data": {
      "totalLignes": 100,
      "réussies": 95,
      "échouées": 5,
      "erreurs": [{ "row": 12, "message": "Nom manquant" }]
    }
  }
  ```

### Historique : `GET /api/import/history` (Protégé)
Consulte la liste paginée des imports réalisés par l'utilisateur connecté.

---

## 📥 7. Exportation de Données (`/api/export`)
*Fichier de routes* : [routes/exportRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/exportRoutes.js) | *Contrôleur* : [controllers/exportController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/exportController.js)

Exporte les données filtrées des QR codes dans différents formats.

### `GET /api/export/excel` (Protégé)
Génère et télécharge un fichier Excel (`.xlsx`) plat contenant tous les QR codes correspondant aux filtres.
* **Filtres Query optionnels** : `collaboratorId`, `folderId`, `type`, `isActive`, `search`.
* **Réponse** : Fichier binaire Excel.

### `GET /api/export/csv` (Protégé)
Génère et télécharge un fichier CSV (`.csv`) délimité par des points-virgules (`;`) avec encodage UTF-8.
* **Filtres Query optionnels** : Identiques à l'export Excel.
* **Réponse** : Fichier texte CSV.

### `GET /api/export/pdf` (Protégé)
Génère un tableau PDF format paysage A4 listant les QR codes.
* **Filtres Query optionnels** : Identiques à l'export Excel.
* **Réponse** : Fichier document PDF.

---

## 🛡️ 8. Audit Logs (`/api/audit`)
*Fichier de routes* : [routes/auditRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/auditRoutes.js) | *Contrôleur* : [controllers/auditController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/auditController.js)

### `GET /api/audit/logs` (Protégé)
Récupère tous les logs d'activité récents de la plateforme (création, modification, suppression, importations).

### `GET /api/audit/users/:userId` (Protégé)
Filtre les logs d'activité générés spécifiquement par l'utilisateur `userId`.

---

## 👥 9. Gestion des Utilisateurs (`/api/users`)
*Fichier de routes* : [routes/userRoutes.js](file:///c:/Users/182-DESSINATEURS/Documents/back/routes/userRoutes.js) | *Validateur* : [validators/userValidator.js](file:///c:/Users/182-DESSINATEURS/Documents/back/validators/userValidator.js) | *Contrôleur* : [controllers/userController.js](file:///c:/Users/182-DESSINATEURS/Documents/back/controllers/userController.js)

### `GET /api/users` (Protégé)
Liste paginée des comptes utilisateurs de l'application.

### `GET /api/users/:id` (Protégé)
Profil d'un utilisateur par ID.

### `POST /api/users` (Protégé)
Crée un utilisateur.
* **Payload de requête** :
  ```json
  {
    "firstname": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@collaborator.com",
    "password": "SecurePassword123!",
    "phone": "0606060606",
    "roleId": 2,
    "collaboratorId": 1
  }
  ```

### `PUT /api/users/:id` (Protégé)
Met à jour le compte utilisateur.

### `DELETE /api/users/:id` (Protégé)
Supprime l'utilisateur de la plateforme.

### `PATCH /api/users/:id/activate` (Protégé)
Active l'accès de l'utilisateur.

### `PATCH /api/users/:id/deactivate` (Protégé)
Désactive temporairement l'accès de l'utilisateur à la plateforme (toutes ses tentatives d'authentification ou rafraîchissement de jeton échoueront).
