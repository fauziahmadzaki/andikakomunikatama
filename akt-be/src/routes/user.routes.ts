import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
} from '../validations/user.validation.js';

const router = Router();

router.get('/', (req, res, next) => userController.getAll(req, res, next));
router.get('/:id', validate(getUserByIdSchema), (req, res, next) =>
  userController.getById(req, res, next)
);
router.post('/', validate(createUserSchema), (req, res, next) =>
  userController.create(req, res, next)
);
router.put('/:id', validate(updateUserSchema), (req, res, next) =>
  userController.update(req, res, next)
);
router.delete('/:id', validate(getUserByIdSchema), (req, res, next) =>
  userController.delete(req, res, next)
);

export default router;
