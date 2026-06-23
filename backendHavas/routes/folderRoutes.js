// ============================================================
// Folder Routes
// ============================================================

import express from 'express';
import * as folderController from '../controllers/folderController.js';
import * as folderValidator from '../validators/folderValidator.js';
import { validate } from '../validators/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

// All folder routes are protected
router.use(authenticate);

// List folders
router.get('/', folderController.getFolders);

// Get a single folder
router.get('/:id', folderValidator.folderIdRule, validate, folderController.getFolderById);

// Create a folder
router.post('/', folderValidator.createFolderRules, validate, folderController.createFolder);

// Update a folder
router.put('/:id', folderValidator.updateFolderRules, validate, folderController.updateFolder);

// Delete a folder
router.delete('/:id', authorize('SUPER_ADMIN'), folderValidator.folderIdRule, validate, folderController.deleteFolder);

export default router;
