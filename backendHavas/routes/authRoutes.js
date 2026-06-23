// ============================================================
// Auth Routes
// ============================================================

import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authValidator from '../validators/authValidator.js';
import { validate } from '../validators/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', authValidator.loginRules, validate, authController.login);
router.post('/refresh-token', authValidator.refreshTokenRules, validate, authController.refreshTokenHandler);
router.post('/forgot-password', authValidator.forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', authValidator.resetPasswordRules, validate, authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
