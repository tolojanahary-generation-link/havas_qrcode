// ============================================================
// Audit Routes
// ============================================================

import express from 'express';
import * as auditController from '../controllers/auditController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All audit routes are protected
router.use(authenticate);

// Get all audit logs
router.get('/logs', auditController.getAuditLogs);

// Get audit logs for a specific user
router.get('/users/:userId', auditController.getUserLogs);

export default router;
