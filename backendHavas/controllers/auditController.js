// ============================================================
// Audit Controller — Audit log business logic
// ============================================================

import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as auditService from '../services/auditService.js';
import * as userService from '../services/userService.js';
import { isSuperAdmin, canAccessResource } from '../utils/tenantHelper.js';

/**
 * GET /api/audit/logs
 * Get all audit logs with pagination and filtering
 * Query params: page, limit, action, entity, userId, startDate, endDate, sortBy, sortOrder
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'action', 'entity'], 'createdAt', 'desc');

    // Build filters
    const filters = {};

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.entity) {
      filters.entity = req.query.entity;
    }

    if (req.query.userId) {
      filters.userId = parseInt(req.query.userId, 10);
    }

    if (req.query.search) {
      filters.description = { contains: req.query.search, mode: 'insensitive' };
    }

    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) filters.createdAt.gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.createdAt.lte = new Date(req.query.endDate);
    }

    // Scoping pour les collaborateurs normaux
    if (!isSuperAdmin(req.user)) {
      filters.user = { collaboratorId: req.user.collaboratorId };
    }

    const { logs, total } = await auditService.getLogs(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Logs d\'audit récupérés avec succès.', { logs }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/audit/users/:userId
 * Get audit logs for a specific user
 * Query params: page, limit, action, entity, startDate, endDate, sortBy, sortOrder
 */
export const getUserLogs = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId) || userId < 1) {
      return error(res, 'L\'identifiant de l\'utilisateur est invalide.', [], 400);
    }

    // Security check: can the user view logs for this specific user?
    const targetUser = await userService.findUserById(userId);
    if (!targetUser) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    if (!canAccessResource(req.user, targetUser)) {
      return error(res, 'Accès refusé. Vous ne pouvez pas voir les logs de cet utilisateur.', [], 403);
    }

    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'action', 'entity'], 'createdAt', 'desc');

    // Build additional filters
    const filters = {};

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.entity) {
      filters.entity = req.query.entity;
    }

    if (req.query.search) {
      filters.description = { contains: req.query.search, mode: 'insensitive' };
    }

    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) filters.createdAt.gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.createdAt.lte = new Date(req.query.endDate);
    }

    const { logs, total } = await auditService.getUserLogs(userId, filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, `Logs de l'utilisateur #${userId} récupérés avec succès.`, { logs }, meta);
  } catch (err) {
    next(err);
  }
};
