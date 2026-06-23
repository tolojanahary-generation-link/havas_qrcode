// ============================================================
// QRCode Validator — Validation chains for QR code endpoints
// ============================================================

import { body, param } from 'express-validator';

/**
 * Validation rules for creating a QR code
 */
export const createQRCodeRules = [
  body('name')
    .notEmpty().withMessage('Le nom du QR code est requis.')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
    .trim(),

  body('type')
    .notEmpty().withMessage('Le type de QR code est requis.')
    .isIn(['static', 'dynamic']).withMessage('Le type doit être "static" ou "dynamic".'),

  body('destinationUrl')
    .notEmpty().withMessage('L\'URL de destination est requise.')
    .isURL().withMessage('L\'URL de destination est invalide.'),

  body('collaboratorId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du collaborator doit être un entier positif.'),

  body('folderId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du dossier doit être un entier positif.'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur doit être au format hexadécimal (#RRGGBB).'),

  body('backgroundColor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur de fond doit être au format hexadécimal (#RRGGBB).'),
];

/**
 * Validation rules for updating a QR code
 */
export const updateQRCodeRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du QR code est invalide.'),

  body('name')
    .optional()
    .isLength({ min: 2, max: 200 }).withMessage('Le nom doit contenir entre 2 et 200 caractères.')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('La description ne doit pas dépasser 500 caractères.')
    .trim(),

  body('type')
    .optional()
    .isIn(['static', 'dynamic']).withMessage('Le type doit être "static" ou "dynamic".'),

  body('destinationUrl')
    .optional()
    .isURL().withMessage('L\'URL de destination est invalide.'),

  body('folderId')
    .optional()
    .isInt({ min: 1 }).withMessage('L\'identifiant du dossier doit être un entier positif.'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur doit être au format hexadécimal (#RRGGBB).'),

  body('backgroundColor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur de fond doit être au format hexadécimal (#RRGGBB).'),
];

/**
 * Validation rules for updating the destination URL
 */
export const updateDestinationURLRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du QR code est invalide.'),

  body('destinationUrl')
    .notEmpty().withMessage('L\'URL de destination est requise.')
    .isURL().withMessage('L\'URL de destination est invalide.'),
];

/**
 * Validation rule for QR code ID parameter
 */
export const qrcodeIdRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'identifiant du QR code est invalide.'),
];
