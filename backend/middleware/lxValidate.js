// ---------------------------------------------------------------------------
// Request validation middleware.
//
// Deliberately the SAME shape as core's validateBody / validateQuery /
// validateParams, so the integration swap is an import path change rather than
// a rewrite of every route file.
//
// Why middleware rather than `schema.parse()` inside the controller:
//
//   * A route file now states its own contract. You can read routes/lx/*.js and
//     see what each endpoint accepts without opening the controller.
//   * Validation cannot be forgotten. A controller that skips parse() still
//     compiles and still runs; a route without validateBody is visible in
//     review next to twenty that have it.
//   * The controller receives data that is already parsed and coerced, so it
//     stops being a place where raw input and business logic mix.
//
// The parsed value REPLACES req.body / req.query / req.params, so downstream
// code sees coerced types (dates as Date, numbers as number) and defaults are
// already applied.
// ---------------------------------------------------------------------------
import createContextLogger from '../logger/contextLogger.js';

const logger = createContextLogger('lxValidate');

const validate = (source) => (schema) => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    logger.warn('Validation failed', {
      source,
      path: req.originalUrl,
      errors: result.error.issues,
      ip: req.ip,
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }

  // Express 5 makes req.query a getter, so assigning to it throws. Defining the
  // property keeps the coerced value available without fighting the framework.
  Object.defineProperty(req, source, {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  return next();
};

export const validateBody = validate('body');
export const validateQuery = validate('query');
export const validateParams = validate('params');

export default { validateBody, validateQuery, validateParams };
