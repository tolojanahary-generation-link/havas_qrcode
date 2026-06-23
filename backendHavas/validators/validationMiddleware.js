// ============================================================
// Validation Middleware — Express-validator result checker
// ============================================================

import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator validation results.
 * Returns standardized error response if validation fails.
 * Use after validation chains in route definitions.
 *
 * @example
 * router.post('/', [...validationChain], validate, controller.method);
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(422).json({
      success: false,
      message: 'Erreur de validation des données.',
      errors: formattedErrors,
    });
  }

  next();
};
