import express from 'express';
import { getBudgetSummaryController } from '../../controllers/lx/budgetController.js';

const router = express.Router();

router.get('/summary', getBudgetSummaryController);

export default router;
