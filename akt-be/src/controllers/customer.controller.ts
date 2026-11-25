import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service.js';
import { sendSuccess } from '../utils/response.js';

function actor(req: Request) {
  return req.user?.email ?? 'System';
}

export class CustomerController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.getAll();
      return sendSuccess(res, data, 'Daftar pelanggan berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.getById(req.params.id as string);
      return sendSuccess(res, data, 'Detail pelanggan berhasil diambil');
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.register(req.body, actor(req));
      return sendSuccess(res, data, 'Pelanggan berhasil didaftarkan', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.updateCustomer(
        req.params.id as string,
        req.body
      );
      return sendSuccess(res, data, 'Pelanggan berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.updateStatus(
        req.params.id as string,
        req.body.status,
        req.body.reason ?? '',
        actor(req)
      );
      return sendSuccess(res, data, 'Status pelanggan berhasil diubah');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.deleteCustomer(req.params.id as string);
      return sendSuccess(res, data, 'Pelanggan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.addAddress(req.params.id as string, req.body);
      return sendSuccess(res, data, 'Alamat berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.updateAddress(
        req.params.id as string,
        req.params.addressId as string,
        req.body
      );
      return sendSuccess(res, data, 'Alamat berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.deleteAddress(
        req.params.id as string,
        req.params.addressId as string
      );
      return sendSuccess(res, data, 'Alamat berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  async addContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.addContact(req.params.id as string, req.body);
      return sendSuccess(res, data, 'Kontak berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.updateContact(
        req.params.id as string,
        req.params.childId as string,
        req.body
      );
      return sendSuccess(res, data, 'Kontak berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.deleteContact(
        req.params.id as string,
        req.params.childId as string
      );
      return sendSuccess(res, data, 'Kontak berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  async addIdentity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.addIdentity(req.params.id as string, req.body);
      return sendSuccess(res, data, 'Identitas berhasil ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateIdentity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.updateIdentity(
        req.params.id as string,
        req.params.childId as string,
        req.body
      );
      return sendSuccess(res, data, 'Identitas berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  async deleteIdentity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.deleteIdentity(
        req.params.id as string,
        req.params.childId as string
      );
      return sendSuccess(res, data, 'Identitas berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  async upsertAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.upsertAccount(
        req.params.id as string,
        req.body
      );
      return sendSuccess(res, data, 'Account pelanggan berhasil disimpan');
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
