import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import routerRoutes from './router.routes.js';
import branchRoutes from './branch.routes.js';
import { monitoringRoutes } from './monitoring.routes.js';
import planProfileRoutes from './plan-profile.routes.js';
import customerRoutes from './customer.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/routers', routerRoutes);
router.use('/branches', branchRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/plan-profiles', planProfileRoutes);
router.use('/customers', customerRoutes);

export default router;
