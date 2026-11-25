import { Request, Response, NextFunction } from 'express';
import { routerQueueService } from '../services/router-queue.service.js';
import { sendSuccess } from '../utils/response.js';

export class RouterQueueController {
  async getByRouter(req: Request, res: Response, next: NextFunction) {
    try {
      const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const data = await routerQueueService.getRouterQueues(
        req.params.id as string,
        refresh
      );
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }

  async getPppoeSecrets(req: Request, res: Response, next: NextFunction) {
    try {
      const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const data = await routerQueueService.getPppoeSecrets(
        req.params.id as string,
        refresh
      );
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }

  async getHotspotUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const data = await routerQueueService.getHotspotUsers(
        req.params.id as string,
        refresh
      );
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }
}

export const routerQueueController = new RouterQueueController();
