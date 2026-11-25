import { Router } from 'express';
import { planProfileController } from '../controllers/plan-profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createPlanProfileSchema,
  updatePlanProfileSchema,
  planProfileIdParamSchema,
} from '../validations/plan-profile.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => planProfileController.getAll(req, res, next));

router.get('/ip-pools', (req, res, next) =>
  planProfileController.getIpPools(req, res, next)
);

router.get('/:id', validate(planProfileIdParamSchema), (req, res, next) =>
  planProfileController.getById(req, res, next)
);

router.post('/', validate(createPlanProfileSchema), (req, res, next) =>
  planProfileController.create(req, res, next)
);

router.put('/:id', validate(updatePlanProfileSchema), (req, res, next) =>
  planProfileController.update(req, res, next)
);

router.post('/:id/sync', validate(planProfileIdParamSchema), (req, res, next) =>
  planProfileController.sync(req, res, next)
);

router.patch('/:id/toggle', validate(planProfileIdParamSchema), (req, res, next) =>
  planProfileController.toggleStatus(req, res, next)
);

router.delete('/:id', validate(planProfileIdParamSchema), (req, res, next) =>
  planProfileController.delete(req, res, next)
);

export default router;
