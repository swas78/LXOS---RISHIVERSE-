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
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createExpenseSchema,
  getAllExpensesSchema,
  updateExpenseSchema,
  verifyExpenseSchema,
} from '../../validations/lx/expense.validation.js';

const router = express.Router();
const logger = createContextLogger('expenseRoutes');

router.use((req, res, next) => {
  logger.debug('LX expense route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.SUBMIT_EXPENSE), validateBody(createExpenseSchema), createExpenseController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllExpensesSchema), getAllExpensesController);
router.get('/:expenseId', requirePermission(PERMISSIONS.VIEW_LX), getExpenseByIdController);
router.patch('/:expenseId', requirePermission(PERMISSIONS.SUBMIT_EXPENSE), validateBody(updateExpenseSchema), updateExpenseController);
router.delete('/:expenseId', requirePermission(PERMISSIONS.SUBMIT_EXPENSE), deleteExpenseController);

// Workflow action: Finance / Admin approve or reject an expense.
router.post('/:expenseId/verify', requirePermission(PERMISSIONS.APPROVE_EXPENSE), validateBody(verifyExpenseSchema), verifyExpenseController);

export default router;
