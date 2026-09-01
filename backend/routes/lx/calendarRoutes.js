import express from 'express';
import { getCalendarController } from '../../controllers/lx/calendarController.js';

const router = express.Router();

router.get('/all', getCalendarController);

export default router;
