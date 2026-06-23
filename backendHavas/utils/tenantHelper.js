// ============================================================
// Tenant Helper — Multi-tenancy and RBAC logic
// ============================================================

import { error } from './responseHelper.js';

export const isSuperAdmin = (user) => {
  return user && user.role && user.role.name === 'SUPER_ADMIN';
};

/**
 * Apply tenant scoping to Prisma where clause.
 * SUPER_ADMIN: returns original filters (or overrides).
 * COLLAB: forces collaboratorId = req.user.collaboratorId OR collaboratorId = null (Global)
 */
export const scopeFilters = (user, filters = {}) => {
  if (isSuperAdmin(user)) {
    return filters;
  }

  // Collab: can see their own data OR global data (collaboratorId = null)
  // We use OR logic for collaboratorId.
  // Note: if filters already have OR, we must wrap it in AND.
  
  const scopedFilters = { ...filters };
  
  const tenantCondition = {
    OR: [
      { collaboratorId: user.collaboratorId },
      { collaboratorId: null }
    ]
  };

  if (scopedFilters.OR) {
    scopedFilters.AND = [
      tenantCondition,
      { OR: scopedFilters.OR }
    ];
    delete scopedFilters.OR;
  } else {
    scopedFilters.OR = tenantCondition.OR;
  }

  return scopedFilters;
};

/**
 * Verifies if the user is allowed to access/modify a specific resource.
 * Resource must have a collaboratorId field.
 */
export const canAccessResource = (user, resource) => {
  if (isSuperAdmin(user)) {
    return true;
  }

  // If resource is global, maybe they can't modify it, but they can view it.
  // This helper returns true if it belongs to them OR if it's global.
  if (!resource.collaboratorId || resource.collaboratorId === user.collaboratorId) {
    return true;
  }

  return false;
};

/**
 * Ensures the user can modify the resource. 
 * Collab CANNOT modify global resources (collaboratorId = null), only their own.
 */
export const canModifyResource = (user, resource) => {
  if (isSuperAdmin(user)) {
    return true;
  }
  
  // Collab can only modify resources that belong to their own collaboratorId.
  // They CANNOT modify global resources.
  if (resource.collaboratorId && resource.collaboratorId === user.collaboratorId) {
    return true;
  }

  return false;
};
