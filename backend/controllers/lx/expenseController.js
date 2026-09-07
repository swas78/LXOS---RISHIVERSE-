import {
  createExpenseSchema,
  getAllExpensesSchema,
  updateExpenseSchema,
  verifyExpenseSchema,
} from '../../validators/lx/expenseSchema.js';
import { LX_EXPENSE_EDITABLE_FIELDS } from '../../constants/lxExpenseConstant.js';
import {
  createExpenseService,
  deleteExpenseService,
  getAllExpensesService,
  getExpenseByIdService,
  updateExpenseService,
  verifyExpenseService,
} from '../../services/lx/expenseService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createExpenseController = async (req, res) => {
  try {
    const validatedData = createExpenseSchema.parse(req.body);
    // Snapshot the submitter from the acting user.
    const payload = {
      ...validatedData,
      submittedByRef: req.actor?.referenceId ?? 'unknown',
      submittedByName: req.actor?.displayName ?? null,
      // Money endpoint — honour the optional replay guard (api-envelope.md).
      idempotencyKey: req.get('Idempotency-Key') || null,
    };
    const result = await createExpenseService(payload);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createExpenseController', req, res);
  }
};

export const getAllExpensesController = async (req, res) => {
  try {
    const validatedData = getAllExpensesSchema.parse(req.query);
    const result = await getAllExpensesService(validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllExpensesController', req, res);
  }
};

export const getExpenseByIdController = async (req, res) => {
  try {
    const { expenseId } = req.params;
    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['expenseId'], message: 'expenseId is required in the path' }],
      });
    }
    const result = await getExpenseByIdService(expenseId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getExpenseByIdController', req, res);
  }
};

export const updateExpenseController = async (req, res) => {
  try {
    const { expenseId } = req.params;
    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['expenseId'], message: 'expenseId is required in the path' }],
      });
    }

    const validatedData = updateExpenseSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_EXPENSE_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    const result = await updateExpenseService(expenseId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateExpenseController', req, res);
  }
};

export const deleteExpenseController = async (req, res) => {
  try {
    const { expenseId } = req.params;
    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['expenseId'], message: 'expenseId is required in the path' }],
      });
    }
    const result = await deleteExpenseService(expenseId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteExpenseController', req, res);
  }
};

// Finance / Admin verify: approve or reject an expense.
export const verifyExpenseController = async (req, res) => {
  try {
    const { expenseId } = req.params;
    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['expenseId'], message: 'expenseId is required in the path' }],
      });
    }
    const { action, rejectionReason } = verifyExpenseSchema.parse(req.body);
    const result = await verifyExpenseService(expenseId, {
      action,
      rejectionReason,
      actor: req.actor,
    });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'verifyExpenseController', req, res);
  }
};
