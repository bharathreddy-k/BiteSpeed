import { Router } from 'express';
import { IdentifyController } from '../controllers/identifyController';
import { identifyValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

/**
 * GET /
 * API information endpoint
 */
router.get('/', (_req, res) => {
  res.json({
    service: 'Bitespeed Identity Reconciliation API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      identify: {
        method: 'POST',
        path: '/identify',
        description: 'Reconcile customer identity based on email and/or phone number',
        body: {
          email: 'string (optional)',
          phoneNumber: 'string (optional)',
        },
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Check API health status',
      },
    },
    documentation: 'https://github.com/bharathreddy-k/BiteSpeed',
  });
});

/**
 * POST /identify
 * Main endpoint for identity reconciliation
 */
router.post(
  '/identify',
  identifyValidation,
  handleValidationErrors,
  IdentifyController.identify
);

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', IdentifyController.healthCheck);

export default router;
