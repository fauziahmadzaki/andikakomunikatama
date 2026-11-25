import { Router } from 'express';
import { routerController } from '../controllers/router.controller.js';
import { routerQueueController } from '../controllers/router-queue.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createRouterSchema,
  updateRouterSchema,
  routerIdParamSchema,
  testConnectionSchema,
} from '../validations/router.validation.js';

const router = Router();

router.get('/', (req, res, next) => routerController.getAll(req, res, next));

router.post('/test-connection', validate(testConnectionSchema), (req, res, next) =>
  routerController.testDirect(req, res, next)
);

router.get(
  '/:id/queues',
  authenticate,
  validate(routerIdParamSchema),
  (req, res, next) => routerQueueController.getByRouter(req, res, next)
);

router.get(
  '/:id/pppoe-secrets',
  authenticate,
  validate(routerIdParamSchema),
  (req, res, next) => routerQueueController.getPppoeSecrets(req, res, next)
);

router.get(
  '/:id/hotspot-users',
  authenticate,
  validate(routerIdParamSchema),
  (req, res, next) => routerQueueController.getHotspotUsers(req, res, next)
);

router.get('/:id', validate(routerIdParamSchema), (req, res, next) =>
  routerController.getById(req, res, next)
);

router.get('/:id/telemetry', validate(routerIdParamSchema), (req, res, next) =>
  routerController.getTelemetry(req, res, next)
);

router.post('/', validate(createRouterSchema), (req, res, next) =>
  routerController.create(req, res, next)
);

router.put('/:id', validate(updateRouterSchema), (req, res, next) =>
  routerController.update(req, res, next)
);

router.delete('/:id', validate(routerIdParamSchema), (req, res, next) =>
  routerController.delete(req, res, next)
);

router.post('/:id/test', validate(routerIdParamSchema), (req, res, next) =>
  routerController.testById(req, res, next)
);

export default router;
