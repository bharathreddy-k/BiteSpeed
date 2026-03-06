import { Router } from 'express';
import { IdentifyController } from '../controllers/identifyController';
import { identifyValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

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
