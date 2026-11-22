import { Router } from 'express';
import { branchController } from '../controllers/branch.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createBranchSchema,
  updateBranchSchema,
  branchIdParamSchema,
} from '../validations/branch.validation.js';

const router = Router();

router.get('/', (req, res, next) => branchController.getAll(req, res, next));

router.get('/:id', validate(branchIdParamSchema), (req, res, next) =>
  branchController.getById(req, res, next)
);

router.post('/', validate(createBranchSchema), (req, res, next) =>
  branchController.create(req, res, next)
);

router.put('/:id', validate(updateBranchSchema), (req, res, next) =>
  branchController.update(req, res, next)
);

router.patch('/:id/toggle', validate(branchIdParamSchema), (req, res, next) =>
  branchController.toggleStatus(req, res, next)
);

router.delete('/:id', validate(branchIdParamSchema), (req, res, next) =>
  branchController.delete(req, res, next)
);

export default router;
