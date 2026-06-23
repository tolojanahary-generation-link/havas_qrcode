// ============================================================
// Response Helper — Standardized JSON responses
// ============================================================

/**
 * Send a success response
 * @param {import('express').Response} res
 * @param {string} message - Response message (French)
 * @param {object} data - Response data
 * @param {number} statusCode - HTTP status code
 */
export const success = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {string} message - Error message (French)
 * @param {Array} errors - Array of error details
 * @param {number} statusCode - HTTP status code
 */
export const error = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

/**
 * Send a paginated success response
 * @param {import('express').Response} res
 * @param {string} message - Response message (French)
 * @param {object} data - Response data
 * @param {object} pagination - Pagination metadata
 * @param {number} statusCode - HTTP status code
 */
export const paginated = (res, message, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};
