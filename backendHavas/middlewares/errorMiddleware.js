// ============================================================
// Error Middleware — Global error handler
// ============================================================

/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns a standardized JSON response.
 * Must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'champ';
    return res.status(409).json({
      success: false,
      message: `La valeur du champ '${field}' existe déjà.`,
      errors: [{ field, message: 'Valeur dupliquée' }],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Enregistrement non trouvé.',
      errors: [],
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Violation de contrainte de clé étrangère.',
      errors: [{ message: err.meta?.cause || 'Référence invalide' }],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide.',
      errors: [],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré. Veuillez vous reconnecter.',
      errors: [],
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Le fichier est trop volumineux.',
      errors: [{ message: `Taille maximale autorisée : ${err.limit} octets` }],
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Champ de fichier inattendu.',
      errors: [],
    });
  }

  // Validation errors (express-validator)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Le corps de la requête est invalide (JSON malformé).',
      errors: [],
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Erreur interne du serveur.'
    : err.message || 'Une erreur est survenue.';

  return res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : [],
  });
};

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};
