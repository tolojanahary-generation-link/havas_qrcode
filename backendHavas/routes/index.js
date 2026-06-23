// ============================================================
// Main Router Aggregator
// ============================================================

import express from 'express';

// Import all route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import collaboratorRoutes from './collaboratorRoutes.js';
import folderRoutes from './folderRoutes.js';
import qrcodeRoutes from './qrcodeRoutes.js';
import scanRoutes from './scanRoutes.js';
import importRoutes from './importRoutes.js';
import exportRoutes from './exportRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/collaborators', collaboratorRoutes);
router.use('/folders', folderRoutes);
router.use('/qrcodes', qrcodeRoutes);
// Note: scanRoutes handles both /scan/:uuid and /scans/*
router.use('/scan', scanRoutes); // For public redirect
router.use('/scans', scanRoutes); // For protected analytics
router.use('/import', importRoutes);
router.use('/export', exportRoutes);
router.use('/audit', auditRoutes);

export default router;
