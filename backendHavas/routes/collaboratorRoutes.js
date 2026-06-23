// ============================================================
// Collaborator Routes
// ============================================================

import express from 'express';
import * as collaboratorController from '../controllers/collaboratorController.js';
import * as collaboratorValidator from '../validators/collaboratorValidator.js';
import { validate } from '../validators/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All collaborator routes are protected
router.use(authenticate);

// List collaborators
router.get('/', collaboratorController.getCollaborators);

// Get a single collaborator
router.get('/:id', collaboratorValidator.collaboratorIdRule, validate, collaboratorController.getCollaboratorById);

// Create a collaborator
router.post('/', collaboratorValidator.createCollaboratorRules, validate, collaboratorController.createCollaborator);

// Update a collaborator
router.put('/:id', collaboratorValidator.updateCollaboratorRules, validate, collaboratorController.updateCollaborator);

// Delete a collaborator
router.delete('/:id', collaboratorValidator.collaboratorIdRule, validate, collaboratorController.deleteCollaborator);

export default router;
