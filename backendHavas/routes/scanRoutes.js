// ============================================================
// Scan Routes
// ============================================================

import express from 'express';
import * as scanController from '../controllers/scanController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route: Register a scan and redirect
// This handles the actual scanning of a QR code by an end user
router.get('/:uuid', scanController.registerScan);

// Protected routes for analytics/dashboard
router.use('/history', authenticate);
router.use('/stats', authenticate);
router.use('/dashboard', authenticate);

// Get scan history for a specific QR code
router.get('/history/:qrCodeId', scanController.getScanHistory);

// Get detailed statistics for a specific QR code
router.get('/stats/:qrCodeId', scanController.getQRCodeStatistics);

// Get global or per-collaborator dashboard statistics
router.get('/dashboard/stats', scanController.getDashboardStatistics);

export default router;
