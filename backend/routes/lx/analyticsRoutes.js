import express from 'express';
import { getAnalyticsController } from '../../controllers/lx/analyticsController.js';

const router = express.Router();

router.get('/all', getAnalyticsController);

export default router;
