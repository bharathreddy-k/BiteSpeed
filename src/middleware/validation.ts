import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation rules for /identify endpoint
 */
export const identifyValidation = [
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  
  body('phoneNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Phone number must be a string')
    .trim(),

  // Custom validation: at least one of email or phoneNumber must be provided
  body().custom((_value: any, { req }: any) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      throw new Error('At least one of email or phoneNumber must be provided');
    }
    return true;
  }),
];

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err: any) => ({
        field: err.type === 'field' ? err.path : 'body',
        message: err.msg,
      })),
    });
    return;
  }
  
  next();
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};
