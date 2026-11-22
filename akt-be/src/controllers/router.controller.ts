import { Request, Response, NextFunction } from 'express';
import { routerService } from '../services/router.service.js';
import { sendSuccess } from '../utils/response.js';

export class RouterController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.getAllRouters();
      return sendSuccess(res, data, 'Daftar router berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.getRouterById(req.params.id as string);
      return sendSuccess(res, data, 'Detail router berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.createRouter(req.body);
      const testMsg = data.connectionTest
        ? ` (${data.connectionTest.message})`
        : '';
      return sendSuccess(res, data, `Router berhasil ditambahkan${testMsg}`, 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.updateRouter(req.params.id as string, req.body);
      return sendSuccess(res, data, 'Router berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.deleteRouter(req.params.id as string);
      return sendSuccess(res, data, 'Router berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  async testById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.testRouterById(req.params.id as string);
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }

  async testDirect(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.testDirectConnection(req.body);
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }

  async getTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await routerService.getRouterTelemetry(req.params.id as string);
      return sendSuccess(res, data, data.message || 'Telemetri router berhasil diambil');
    } catch (err) {
      next(err);
    }
  }
}

export const routerController = new RouterController();
