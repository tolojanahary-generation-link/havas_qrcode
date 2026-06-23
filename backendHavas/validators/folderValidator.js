// ============================================================
// Folder Validator — Validation chains for folder endpoints
// ============================================================

import { body, param } from 'express-validator';

/**
 * Validation rules for creating a folder
 */
export const createFolderRules = [
  body('name')
    .notEmpty().withMessage('Le nom du dossier est requis.')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom du dossier doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
    .trim(),

  body('collaboratorId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator doit être un entier positif.'),
];

/**
 * Validation rules for updating a folder
 */
export const updateFolderRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du dossier est invalide.'),

  body('name')
    .optional()
    .isLength({ min: 2, max: 200 }).withMessage('Le nom du dossier doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
    .trim(),

  body('collaboratorId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator doit être un entier positif.'),
];

/**
 * Validation rule for folder ID parameter
 */
export const folderIdRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du dossier est invalide.'),
];
