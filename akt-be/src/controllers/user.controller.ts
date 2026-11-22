import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export class UserController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getAllUsers();
      return sendSuccess(res, data, 'Users retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getUserById(req.params.id as string);
      return sendSuccess(res, data, 'User retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.createUser(req.body);
      return sendSuccess(res, data, 'User created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateUser(req.params.id as string, req.body);
      return sendSuccess(res, data, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.deleteUser(req.params.id as string);
      return sendSuccess(res, data, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
