# Mise en conformité de l'API avec le nouveau `schema.prisma`

Suite à la transformation profonde du modèle de base de données (notamment le `QRCode`), l'application doit être mise à jour pour s'aligner sur la nouvelle structure.

## Changements constatés dans le schéma :
1. **`QRCode` allégé** : Les champs `type`, `destinationUrl`, `redirectUrl`, `color`, `backgroundColor`, et `collaboratorId` ont été supprimés.
2. **`Destination`** : L'URL de destination n'est plus stockée sur le QRCode mais dans une table séparée `Destination` (One-to-Many). L'historique des liens se trouve donc dans cette table (le lien le plus récent sera considéré comme le lien "actif").
3. **`Folder` obligatoire** : Un QRCode ne peut plus exister sans dossier (`folderId` est devenu un champ `Int` strict, non optionnel). C'est aussi grâce au dossier que l'on détermine à quel `Collaborator` appartient le QRCode.
4. **`ImportHistory`** : Le statut utilise désormais un Enum strict (`ACCOMPLIE` ou `AVORTEE`).

## Open Questions

1. **Création de QR Codes par Excel (`importController.js`)** : Puisque `folderId` est devenu obligatoire pour chaque QR Code, que doit-on faire lors d'un import de masse si le fichier Excel ne fournit pas de `folderId` ?
   - *Option A* : Créer un dossier "Imports Excel" par défaut pour y ranger les QR Codes importés.
   - *Option B* : Rejeter la ligne si le `folderId` n'est pas fourni.
   - (Je pars sur l'Option A, plus fluide pour l'utilisateur, mais j'attends votre confirmation).
2. **Type (Static/Dynamic)** : Puisque `type` a disparu, comment l'application doit-elle traiter les redirections ? Tous les QR codes agissent-ils maintenant comme des "Dynamic" (redirection via l'API `/api/scan/:uuid` pour tracker et renvoyer vers la `Destination` la plus récente) ? Je vais assumer que OUI.

## Proposed Changes

### 1. `validators/qrcodeValidator.js`
- **[MODIFY]** Supprimer la validation de `type`, `color`, `backgroundColor`.
- **[MODIFY]** Rendre `folderId` obligatoire (`notEmpty()`).

### 2. `services/qrcodeService.js`
- **[MODIFY]** `createQRCode` : Retirer les champs supprimés. Ajouter la création d'une `Destination` initiale en utilisant le `destinationUrl` fourni dans le payload.
- **[MODIFY]** `updateQRCode` : Retirer les champs supprimés.
- **[MODIFY]** `updateDestinationUrl` : Au lieu d'écrire dans un `RedirectHistory` (qui a disparu), cette fonction va simplement créer une nouvelle entrée dans la table `Destination` associée au QRCode.
- **[MODIFY]** `findQRCodeById` / `findQRCodeByUuid` : Inclure la table `destinations` en la triant par `createdAt` (descendant) pour toujours avoir le lien actif en premier.

### 3. `controllers/qrcodeController.js`
- **[MODIFY]** `createQRCode` : Nettoyer le payload. Retirer la logique `redirectUrl` (qui se fait via le front/API).
- **[MODIFY]** Logique de Tenancy : L'appartenance d'un QRCode est maintenant vérifiée via `qrCode.folder.collaboratorId` au lieu de `qrCode.collaboratorId`.
- **[MODIFY]** La recherche / filtrage (GET) : Filtrer via le `folder.collaboratorId`.

### 4. `controllers/scanController.js`
- **[MODIFY]** `registerScan` : Au lieu de rediriger vers `qrCode.destinationUrl`, on redirige vers `qrCode.destinations[0].url` (la destination la plus récente).

### 5. `controllers/importController.js`
- **[MODIFY]** Nettoyer la validation des colonnes (supprimer `type`, `collaboratorId`).
- **[MODIFY]** Logique d'import : Assigner un `folderId` valide (soit depuis le fichier, soit un dossier par défaut généré pour le collaborateur).
- **[MODIFY]** Remplacer les statuts `completed` et `partial` par `ACCOMPLIE` et `AVORTEE`.

### 6. `utils/tenantHelper.js`
- **[MODIFY]** Mettre à jour `canAccessResource` pour vérifier `resource.folder.collaboratorId` si la ressource est un QRCode.

### 7. `API_DOCUMENTATION.md`
- **[MODIFY]** Mettre à jour les exemples JSON des requêtes et réponses pour refléter le nouveau schéma allégé des QR Codes.

## Verification Plan
1. Lancer les requêtes de l'API pour s'assurer que la création d'un QRCode fonctionne et génère bien une entrée dans la table `Destination`.
2. Vérifier que la modification d'une destination n'écrase plus l'ancienne, mais crée une nouvelle `Destination`.
3. Tester le tracking (`/api/scan`) pour s'assurer qu'il redirige bien vers la dernière `Destination` enregistrée.
