// ============================================================
// Export Routes
// ============================================================

import express from 'express';
import * as exportController from '../controllers/exportController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All export routes are protected
router.use(authenticate);

// Export to Excel
router.get('/excel', exportController.exportExcel);

// Export to CSV
router.get('/csv', exportController.exportCSV);

// Export to PDF
router.get('/pdf', exportController.exportPDF);

export default router;
