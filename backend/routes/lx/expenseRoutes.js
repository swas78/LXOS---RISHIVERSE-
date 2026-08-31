import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createExpenseController,
  deleteExpenseController,
  getAllExpensesController,
  getExpenseByIdController,
  updateExpenseController,
  verifyExpenseController,
} from '../../controllers/lx/expenseController.js';

const router = express.Router();
const logger = createContextLogger('expenseRoutes');

router.use((req, res, next) => {
  logger.debug('LX expense route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createExpenseController);
router.get('/all', getAllExpensesController);
router.get('/:expenseId', getExpenseByIdController);
router.patch('/:expenseId', updateExpenseController);
router.delete('/:expenseId', deleteExpenseController);

// Workflow action: Finance / Admin approve or reject an expense.
router.post('/:expenseId/verify', verifyExpenseController);

export default router;
