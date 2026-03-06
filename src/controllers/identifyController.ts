import { Request, Response, NextFunction } from 'express';
import { IdentityService } from '../services/identityService';
import { IdentifyRequest } from '../types';

export class IdentifyController {
  /**
   * Handle POST /identify requests
   */
  static async identify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phoneNumber }: IdentifyRequest = req.body;

      // Call the identity service
      const result = await IdentityService.identify({
        email: email || null,
        phoneNumber: phoneNumber || null,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Bitespeed Identity Reconciliation',
    });
  }
}
