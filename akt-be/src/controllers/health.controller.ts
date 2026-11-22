import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export const getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const health = await healthService.checkHealth();
    sendSuccess(res, health, 'Health check passed', health.database === 'healthy' ? 200 : 503);
  } catch (error) {
    next(error);
  }
};
