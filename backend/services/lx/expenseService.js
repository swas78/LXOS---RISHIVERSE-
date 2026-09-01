import createContextLogger from '../../logger/contextLogger.js';
import {
  createExpenseDal,
  deleteExpenseDal,
  getAllExpensesDal,
  getExpenseByIdDal,
  updateExpenseDal,
  incrementEventBudgetSpentDal,
} from '../../dals/lx/expenseDal.js';

const logger = createContextLogger('expenseService');

export const createExpenseService = async (payload) => {
  try {
    const expense = await createExpenseDal(payload);
    if (!expense) {
      return { success: false, message: 'Unable to create expense', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expense created successfully',
      statusCode: 201,
      data: expense,
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
    return { success: true, message: 'Expense found', statusCode: 200, data: expense };
  } catch (error) {
    logger.error('Error in getExpenseByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllExpensesService = async (query) => {
  try {
    const result = await getAllExpensesDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list expenses', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expenses fetched successfully',
      statusCode: 200,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalRecords: result.totalRecords,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
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
    const expense = await updateExpenseDal(expenseId, payload);
    if (!expense) {
      return { success: false, message: 'Unable to update expense', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Expense updated successfully',
      statusCode: 200,
      data: expense,
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

    const verifiedById = actor?.id ?? 'unknown';
    const verifiedByName = actor?.name ?? 'Unknown';

    if (action === 'reject') {
      const expense = await updateExpenseDal(expenseId, {
        status: 'REJECTED',
        verifiedById,
        verifiedByName,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      });
      return { success: true, message: 'Expense rejected', statusCode: 200, data: expense };
    }

    // action === 'approve'
    const shouldApplyBudget = !existing.budgetApplied && existing.eventId;
    if (shouldApplyBudget) {
      await incrementEventBudgetSpentDal(existing.eventId, existing.amount);
    }

    const expense = await updateExpenseDal(expenseId, {
      status: 'APPROVED',
      verifiedById,
      verifiedByName,
      verifiedAt: new Date(),
      ...(shouldApplyBudget ? { budgetApplied: true } : {}),
    });

    return { success: true, message: 'Expense approved', statusCode: 200, data: expense };
  } catch (error) {
    logger.error('Error in verifyExpenseService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
