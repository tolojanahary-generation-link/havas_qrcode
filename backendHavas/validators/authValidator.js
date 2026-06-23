// ============================================================
// Auth Validator — Validation chains for auth endpoints
// ============================================================

import { body } from 'express-validator';

/**
 * Validation rules for login
 */
export const loginRules = [
  body('email')
    .notEmpty().withMessage('L\'adresse email est requise.')
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

/**
 * Validation rules for refresh token
 */
export const refreshTokenRules = [
  body('refreshToken')
    .notEmpty().withMessage('Le token de rafraîchissement est requis.'),
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordRules = [
  body('email')
    .notEmpty().withMessage('L\'adresse email est requise.')
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),
];

/**
 * Validation rules for reset password
 */
export const resetPasswordRules = [
  body('token')
    .notEmpty().withMessage('Le token de réinitialisation est requis.'),

  body('password')
    .notEmpty().withMessage('Le nouveau mot de passe est requis.')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmation du mot de passe est requise.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      return true;
    }),
];
