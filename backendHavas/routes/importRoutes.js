// ============================================================
// Import Routes
// ============================================================

import express from 'express';
import * as importController from '../controllers/importController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { uploadExcel } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// All import routes are protected
router.use(authenticate);

// Upload an Excel file
router.post('/upload', uploadExcel, importController.uploadExcel);

// Validate an uploaded Excel file
router.post('/validate', importController.validateExcel);

// Process the import
router.post('/execute', importController.importExcel);

// Get import history
router.get('/history', importController.importHistory);

export default router;
