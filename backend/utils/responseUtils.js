import { ZodError } from 'zod';
import createContextLogger from '../logger/contextLogger.js';

const logger = createContextLogger('responseUtils');

export const handleControllerErrorResponse = (error, controllerName, req, res) => {
  if (error instanceof ZodError || error?.name === 'ZodError') {
    logger.warn(`Validation failed in ${controllerName}`, {
      errors: error.issues ?? error.errors,
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues ?? error.errors,
    });
  }

  logger.error(`Error in ${controllerName}`, {
    error: { message: error.message, stack: error.stack },
    ip: req.ip,
  });

  const statusCode =
    Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode <= 599
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(error.code ? { code: error.code } : {}),
  });
};
