// ============================================================
// User Validator — Validation chains for user endpoints
// ============================================================

import { body, param } from 'express-validator';

/**
 * Validation rules for creating a user
 */
export const createUserRules = [
  body('firstname')
    .notEmpty().withMessage('Le prénom est requis.')
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères.')
    .trim(),

  body('lastname')
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.')
    .trim(),

  body('email')
    .notEmpty().withMessage('L\'adresse email est requise.')
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),

  body('phone')
    .notEmpty().withMessage('Le numéro de téléphone est requis.')
    .trim(),

  body('roleId')
    .notEmpty().withMessage('Le rôle est requis.')
    .isInt({ min: 1 }).withMessage('L\'identifiant du rôle doit être un entier positif.'),

  body('collaboratorId')
    .notEmpty().withMessage('Le collaborator est requis.')
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator doit être un entier positif.'),
];

/**
 * Validation rules for updating a user
 */
export const updateUserRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant de l\'utilisateur est invalide.'),

  body('firstname')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères.')
    .trim(),

  body('lastname')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.')
    .trim(),

  body('email')
    .optional()
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule.')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),

  body('phone')
    .optional()
    .trim(),

  body('roleId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du rôle doit être un entier positif.'),

  body('collaboratorId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator doit être un entier positif.'),
];

/**
 * Validation rule for user ID parameter
 */
export const userIdRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant de l\'utilisateur est invalide.'),
];
