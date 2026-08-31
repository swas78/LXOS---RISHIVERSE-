import express from 'express';
import resolveActor from '../middleware/lxActor.js';
import userRoutes from './lx/userRoutes.js';
import roomRoutes from './lx/roomRoutes.js';
import clubRoutes from './lx/clubRoutes.js';
import clanRoutes from './lx/clanRoutes.js';
import eventRoutes from './lx/eventRoutes.js';
import achievementRoutes from './lx/achievementRoutes.js';
import expenseRoutes from './lx/expenseRoutes.js';
import reimbursementRoutes from './lx/reimbursementRoutes.js';
import initiativeRoutes from './lx/initiativeRoutes.js';
import fileRoutes from './lx/fileRoutes.js';
import productRoutes from './lx/productRoutes.js';
import approvalRoutes from './lx/approvalRoutes.js';
import feedRoutes from './lx/feedRoutes.js';
import budgetRoutes from './lx/budgetRoutes.js';
import dashboardRoutes from './lx/dashboardRoutes.js';
import analyticsRoutes from './lx/analyticsRoutes.js';
import calendarRoutes from './lx/calendarRoutes.js';

const router = express.Router();

// DEV actor shim — populates req.actor for every LX route (local only).
router.use(resolveActor);

// LX (Learner Experience OS) module aggregator.
// Each entity mounts here → /api/v1/lx/{entity}/...
router.use('/user', userRoutes); // dev switcher + /me
router.use('/room', roomRoutes);
router.use('/club', clubRoutes);
router.use('/clan', clanRoutes);
router.use('/event', eventRoutes);
router.use('/achievement', achievementRoutes);
router.use('/expense', expenseRoutes);
router.use('/reimbursement', reimbursementRoutes);
router.use('/initiative', initiativeRoutes);
router.use('/file', fileRoutes);
router.use('/product', productRoutes);
router.use('/approval', approvalRoutes);
router.use('/feed', feedRoutes);
router.use('/budget', budgetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/calendar', calendarRoutes);

export default router;
