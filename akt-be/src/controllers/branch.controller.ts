import { Request, Response, NextFunction } from 'express';
import { branchService } from '../services/branch.service.js';
import { sendSuccess } from '../utils/response.js';

export class BranchController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.getAllBranches();
      return sendSuccess(res, data, 'Daftar cabang berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.getBranchById(req.params.id as string);
      return sendSuccess(res, data, 'Detail cabang berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.createBranch(req.body);
      return sendSuccess(res, data, 'Cabang berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.updateBranch(req.params.id as string, req.body);
      return sendSuccess(res, data, 'Cabang berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.toggleBranchStatus(req.params.id as string);
      return sendSuccess(res, data, 'Status cabang berhasil diubah');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await branchService.deleteBranch(req.params.id as string);
      return sendSuccess(res, data, 'Cabang berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }
}

export const branchController = new BranchController();
