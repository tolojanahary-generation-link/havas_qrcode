// ============================================================
// Pagination Helper — Reusable pagination utilities
// ============================================================

/**
 * Build pagination parameters from query string
 * @param {object} query - Express req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
export const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

/**
 * Build pagination metadata for response
 * @param {number} total - Total number of records
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean }}
 */
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Build sorting parameters from query string
 * @param {object} query - Express req.query
 * @param {string[]} allowedFields - Allowed fields for sorting
 * @param {string} defaultField - Default sort field
 * @param {string} defaultOrder - Default sort order ('asc' or 'desc')
 * @returns {{ field: string, order: string }}
 */
export const buildSorting = (query, allowedFields = ['createdAt'], defaultField = 'createdAt', defaultOrder = 'desc') => {
  const field = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = ['asc', 'desc'].includes(query.sortOrder) ? query.sortOrder : defaultOrder;

  return { [field]: order };
};
