// ============================================================
// QRCode Routes
// ============================================================

import express from 'express';
import * as qrcodeController from '../controllers/qrcodeController.js';
import * as qrcodeValidator from '../validators/qrcodeValidator.js';
import { validate } from '../validators/validationMiddleware.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/authorizeMiddleware.js';
import { uploadExcel } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
// (Note: The actual public scan route is in scanRoutes.js)

// Protected routes
router.use(authenticate);

// List QR codes
router.get('/', qrcodeController.getQRCodes);

// Get a single QR code
router.get('/:id', qrcodeValidator.qrcodeIdRule, validate, qrcodeController.getQRCodeById);

// Generate/Download image
router.get('/:id/image', qrcodeValidator.qrcodeIdRule, validate, qrcodeController.generateQRCodeImage);
router.get('/:id/download', qrcodeValidator.qrcodeIdRule, validate, qrcodeController.downloadQRCode);

// Create a single QR code
router.post('/', qrcodeValidator.createQRCodeRules, validate, qrcodeController.createQRCode);

// Create multiple QR codes from Excel
router.post('/bulk', uploadExcel, qrcodeController.createBulkQRCodesFromExcel);

// Update a QR code
router.put('/:id', qrcodeValidator.updateQRCodeRules, validate, qrcodeController.updateQRCode);

// Update destination URL (dynamic QR codes only)
router.patch('/:id/destination', qrcodeValidator.updateDestinationURLRules, validate, qrcodeController.updateDestinationURL);

// Activate/Deactivate
router.patch('/:id/activate', qrcodeValidator.qrcodeIdRule, validate, qrcodeController.activateQRCode);
router.patch('/:id/deactivate', qrcodeValidator.qrcodeIdRule, validate, qrcodeController.deactivateQRCode);

// Delete a QR code
router.delete('/:id', authorize('SUPER_ADMIN'), qrcodeValidator.qrcodeIdRule, validate, qrcodeController.deleteQRCode);

export default router;
