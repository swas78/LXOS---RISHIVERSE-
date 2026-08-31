import express from 'express';
import { getFeedController } from '../../controllers/lx/feedController.js';

const router = express.Router();

router.get('/all', getFeedController);

export default router;
