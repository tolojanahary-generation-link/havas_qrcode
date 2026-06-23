// ============================================================
// Authorize Middleware — Role-based access control
// ============================================================

import { error } from '../utils/responseHelper.js';

/**
 * Middleware factory to restrict access to specific roles.
 * Must be used AFTER the authenticate middleware.
 * @param  {...string} allowedRoles - Role names allowed to access the route
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/admin-only', authenticate, authorize('admin'), controller.method);
 * router.get('/multi-role', authenticate, authorize('admin', 'manager'), controller.method);
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentification requise.', [], 401);
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role.name)) {
      return error(
        res,
        'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
        [`Rôle requis : ${allowedRoles.join(', ')}`],
        403
      );
    }

    next();
  };
};
