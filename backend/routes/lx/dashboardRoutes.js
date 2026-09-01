import express from 'express';
import { getDashboardStatsController } from '../../controllers/lx/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStatsController);

export default router;
