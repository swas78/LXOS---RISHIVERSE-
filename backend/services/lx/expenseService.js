import createContextLogger from '../../logger/contextLogger.js';
import { expenseScope } from '../../helper/lxPermissions.js';
import { objectExists, withResolvedUrls } from './uploadService.js';
import {
  createExpenseDal,
  deleteExpenseDal,
  getAllExpensesDal,
  getExpenseByIdDal,
  getExpenseByIdempotencyKeyDal,
  updateExpenseDal,
  incrementEventBudgetSpentDal,
} from '../../dals/lx/expenseDal.js';

const logger = createContextLogger('expenseService');

/**
 * A bill is the evidence a verifier approves money against, so a pointer with
 * no object behind it is worse than no bill at all. upload.md treats the
 * confirm step as untrusted — check the bytes actually landed.
 */
const findMissingBill = async (bills) => {
  for (const bill of bills ?? []) {
    // Sequential on purpose: the first bad attachment is the one worth naming.
    if (!(await objectExists(bill?.s3Path))) return bill;
  }
  return null;
};

/** Reads carry a short-lived GET URL per bill; only `s3Path` is persisted. */
const withBillUrls = (expense) =>
  expense && { ...expense, bills: withResolvedUrls(expense.bills) };

export const createExpenseService = async (payload) => {
  try {
    // A retried POST (flaky network, double-tapped Save) must not book the
    // spend twice — hand back the original row with 200 instead of a 201.
    if (payload.idempotencyKey) {
      const replayed = await getExpenseByIdempotencyKeyDal(payload.idempotencyKey);
      if (replayed) {
        return {
          success: true,
          message: 'Expense already created for this idempotency key',
          statusCode: 200,
          data: withBillUrls(replayed),
        };
      }
    }

    const missing = await findMissingBill(payload.bills);
    if (missing) {
      return {
        success: false,
        message: `Bill "${missing.fileName ?? missing.s3Path}" was never uploaded — upload it before submitting`,
        statusCode: 400,
      };
    }

    const expense = await createExpenseDal(payload);
    if (!expense) {
      return { success: false, message: 'Unable to create expense', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expense created successfully',
      statusCode: 201,
      data: withBillUrls(expense),
    };
  } catch (error) {
    logger.error('Error in createExpenseService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getExpenseByIdService = async (expenseId) => {
  try {
    const expense = await getExpenseByIdDal(expenseId);
    if (!expense) {
      return { success: false, message: 'Expense not found', statusCode: 404 };
    }
    return { success: true, message: 'Expense found', statusCode: 200, data: withBillUrls(expense) };
  } catch (error) {
    logger.error('Error in getExpenseByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllExpensesService = async (query, actor) => {
  try {
    const scope = expenseScope(actor);
    const result = await getAllExpensesDal({ ...query, ...scope });
    if (!result) {
      return { success: false, message: 'Unable to list expenses', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expenses fetched successfully',
      statusCode: 200,
      data: result.data.map(withBillUrls),
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    logger.error('Error in getAllExpensesService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateExpenseService = async (expenseId, payload) => {
  try {
    const existing = await getExpenseByIdDal(expenseId);
    if (!existing) {
      return { success: false, message: 'Expense not found', statusCode: 404 };
    }
    const missing = await findMissingBill(payload.bills);
    if (missing) {
      return {
        success: false,
        message: `Bill "${missing.fileName ?? missing.s3Path}" was never uploaded — upload it before saving`,
        statusCode: 400,
      };
    }

    const expense = await updateExpenseDal(expenseId, payload);
    if (!expense) {
      return { success: false, message: 'Unable to update expense', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expense updated successfully',
      statusCode: 200,
      data: withBillUrls(expense),
    };
  } catch (error) {
    logger.error('Error in updateExpenseService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteExpenseService = async (expenseId) => {
  try {
    const existing = await getExpenseByIdDal(expenseId);
    if (!existing) {
      return { success: false, message: 'Expense not found', statusCode: 404 };
    }
    const expense = await deleteExpenseDal(expenseId);
    if (!expense) {
      return { success: false, message: 'Unable to delete expense', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expense deleted successfully',
      statusCode: 200,
      data: expense,
    };
  } catch (error) {
    logger.error('Error in deleteExpenseService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Verify workflow (Finance / Admin): approve or reject an expense.
// On approve, if the expense budget has not yet been applied, increment the
// linked event's budgetSpent by the expense amount.
export const verifyExpenseService = async (expenseId, { action, rejectionReason, actor }) => {
  try {
    const existing = await getExpenseByIdDal(expenseId);
    if (!existing) {
      return { success: false, message: 'Expense not found', statusCode: 404 };
    }

    const verifiedByRef = actor?.referenceId ?? 'unknown';
    const verifiedByName = actor?.displayName ?? null;

    if (action === 'reject') {
      const expense = await updateExpenseDal(expenseId, {
        status: 'REJECTED',
        verifiedByRef,
        verifiedByName,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      });
      return { success: true, message: 'Expense rejected', statusCode: 200, data: withBillUrls(expense) };
    }

    // action === 'approve'
    const shouldApplyBudget = !existing.budgetApplied && existing.eventId;
    if (shouldApplyBudget) {
      await incrementEventBudgetSpentDal(existing.eventId, existing.amount);
    }

    const expense = await updateExpenseDal(expenseId, {
      status: 'APPROVED',
      verifiedByRef,
      verifiedByName,
      verifiedAt: new Date(),
      ...(shouldApplyBudget ? { budgetApplied: true } : {}),
    });

    return { success: true, message: 'Expense approved', statusCode: 200, data: withBillUrls(expense) };
  } catch (error) {
    logger.error('Error in verifyExpenseService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
