// ============================================================
// Collaborator Validator — Validation chains for collaborator endpoints
// ============================================================

import { body, param } from 'express-validator';

/**
 * Validation rules for creating a collaborator
 */
export const createCollaboratorRules = [
  body('companyName')
    .notEmpty().withMessage('Le nom de l\'entreprise est requis.')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom de l\'entreprise doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('contactName')
    .notEmpty().withMessage('Le nom du contact est requis.')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom du contact doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('email')
    .notEmpty().withMessage('L\'adresse email est requise.')
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),

  body('phone')
    .notEmpty().withMessage('Le numéro de téléphone est requis.')
    .trim(),

  body('address')
    .notEmpty().withMessage('L\'adresse est requise.')
    .trim(),

  body('city')
    .notEmpty().withMessage('La ville est requise.')
    .trim(),

  body('country')
    .notEmpty().withMessage('Le pays est requis.')
    .trim(),
];

/**
 * Validation rules for updating a collaborator
 */
export const updateCollaboratorRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator est invalide.'),

  body('companyName')
    .optional()
    .isLength({ min: 2, max: 200 }).withMessage('Le nom de l\'entreprise doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('contactName')
    .optional()
    .isLength({ min: 2, max: 200 }).withMessage('Le nom du contact doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('email')
    .optional()
    .isEmail().withMessage('L\'adresse email est invalide.')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim(),

  body('address')
    .optional()
    .trim(),

  body('city')
    .optional()
    .trim(),

  body('country')
    .optional()
    .trim(),
];

/**
 * Validation rule for collaborator ID parameter
 */
export const collaboratorIdRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator est invalide.'),
];
