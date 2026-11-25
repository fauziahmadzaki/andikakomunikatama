import { Request, Response, NextFunction } from 'express';
import { planProfileService } from '../services/plan-profile.service.js';
import { sendSuccess } from '../utils/response.js';

export class PlanProfileController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.getAllProfiles();
      return sendSuccess(res, data, 'Daftar paket berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.getProfileById(req.params.id as string);
      return sendSuccess(res, data, 'Detail paket berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async getIpPools(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.getAllIpPools();
      return sendSuccess(res, data, 'Daftar IP pool berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.createProfile(req.body);
      return sendSuccess(res, data, 'Paket berhasil dibuat', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.updateProfile(
        req.params.id as string,
        req.body
      );
      return sendSuccess(res, data, 'Paket berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.syncProfileToRouter(
        req.params.id as string
      );
      return sendSuccess(res, data, data.message);
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.toggleProfileStatus(
        req.params.id as string
      );
      return sendSuccess(res, data, 'Status paket berhasil diubah');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await planProfileService.deleteProfile(req.params.id as string);
      return sendSuccess(res, data, 'Paket berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
}

export const planProfileController = new PlanProfileController();
