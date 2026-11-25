import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  registerCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
  customerIdParamSchema,
  customerAddressParamSchema,
  customerChildParamSchema,
  createAddressSchema,
  updateAddressSchema,
  createContactSchema,
  updateContactSchema,
  createIdentitySchema,
  updateIdentitySchema,
  upsertAccountSchema,
} from '../validations/customer.validation.js';

const router = Router();

router.use(authenticate);

router.post('/register', validate(registerCustomerSchema), (req, res, next) =>
  customerController.register(req, res, next)
);

router.get('/', (req, res, next) => customerController.getAll(req, res, next));

router.get('/:id', validate(customerIdParamSchema), (req, res, next) =>
  customerController.getById(req, res, next)
);

router.patch('/:id', validate(updateCustomerSchema), (req, res, next) =>
  customerController.update(req, res, next)
);

router.patch('/:id/status', validate(updateCustomerStatusSchema), (req, res, next) =>
  customerController.updateStatus(req, res, next)
);

router.delete('/:id', validate(customerIdParamSchema), (req, res, next) =>
  customerController.delete(req, res, next)
);

router.post('/:id/addresses', validate(createAddressSchema), (req, res, next) =>
  customerController.addAddress(req, res, next)
);

router.patch(
  '/:id/addresses/:addressId',
  validate(updateAddressSchema),
  (req, res, next) => customerController.updateAddress(req, res, next)
);

router.delete(
  '/:id/addresses/:addressId',
  validate(customerAddressParamSchema),
  (req, res, next) => customerController.deleteAddress(req, res, next)
);

router.post('/:id/contacts', validate(createContactSchema), (req, res, next) =>
  customerController.addContact(req, res, next)
);

router.patch(
  '/:id/contacts/:childId',
  validate(updateContactSchema),
  (req, res, next) => customerController.updateContact(req, res, next)
);

router.delete(
  '/:id/contacts/:childId',
  validate(customerChildParamSchema),
  (req, res, next) => customerController.deleteContact(req, res, next)
);

router.post('/:id/identities', validate(createIdentitySchema), (req, res, next) =>
  customerController.addIdentity(req, res, next)
);

router.patch(
  '/:id/identities/:childId',
  validate(updateIdentitySchema),
  (req, res, next) => customerController.updateIdentity(req, res, next)
);

router.delete(
  '/:id/identities/:childId',
  validate(customerChildParamSchema),
  (req, res, next) => customerController.deleteIdentity(req, res, next)
);

router.put('/:id/account', validate(upsertAccountSchema), (req, res, next) =>
  customerController.upsertAccount(req, res, next)
);

export default router;
