// ============================================================
// User Routes
// ============================================================

import express from 'express';
import * as userController from '../controllers/userController.js';
import * as userValidator from '../validators/userValidator.js';
import { validate } from '../validators/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
// import { authorize } from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

// All user routes are protected
router.use(authenticate);

// List users
router.get('/', userController.getUsers);

// Get a single user
router.get('/:id', userValidator.userIdRule, validate, userController.getUserById);

// Create a user
router.post('/', userValidator.createUserRules, validate, userController.createUser);

// Update a user
router.put('/:id', userValidator.updateUserRules, validate, userController.updateUser);

// Delete a user
router.delete('/:id', userValidator.userIdRule, validate, userController.deleteUser);

// Activate/Deactivate
router.patch('/:id/activate', userValidator.userIdRule, validate, userController.activateUser);
router.patch('/:id/deactivate', userValidator.userIdRule, validate, userController.deactivateUser);

export default router;
