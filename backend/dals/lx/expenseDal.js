import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('expenseDal');

export const createExpenseDal = async (payload) => {
  try {
    const {
      eventId,
      eventTitle,
      title,
      description,
      amount,
      category,
      bills,
      submittedById,
      submittedByName,
    } = payload;

    return await prisma.lxExpense.create({
      data: {
        eventId,
        eventTitle: eventTitle ?? null,
        title,
        ...(description !== undefined ? { description } : {}),
        amount,
        category,
        bills: bills ?? [],
        submittedById,
        submittedByName,
      },
    });
  } catch (error) {
    logger.error('Error in createExpenseDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getExpenseByIdDal = async (expenseId) => {
  try {
    return await prisma.lxExpense.findFirst({
      where: { id: expenseId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getExpenseByIdDal', {
      error: { message: error.message, stack: error.stack },
      expenseId,
    });
    throw error;
  }
};

export const getAllExpensesDal = async ({
  eventId,
  status,
  category,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(eventId ? { eventId } : {}),
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(Array.isArray(category) && category.length > 0 ? { category: { in: category } } : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.lxExpense.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxExpense.count({ where }),
    ]);

    return {
      page,
      limit,
      totalRecords: total,
      data: expenses,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllExpensesDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateExpenseDal = async (expenseId, data) => {
  try {
    return await prisma.lxExpense.update({
      where: { id: expenseId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateExpenseDal', {
      error: { message: error.message, stack: error.stack },
      expenseId,
    });
    throw error;
  }
};

export const deleteExpenseDal = async (expenseId) => {
  try {
    return await prisma.lxExpense.update({
      where: { id: expenseId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteExpenseDal', {
      error: { message: error.message, stack: error.stack },
      expenseId,
    });
    throw error;
  }
};

// Increment the linked event's budgetSpent (used when an expense is verified/approved).
export const incrementEventBudgetSpentDal = async (eventId, amount) => {
  try {
    return await prisma.lxEvent.update({
      where: { id: eventId },
      data: { budgetSpent: { increment: amount } },
    });
  } catch (error) {
    logger.error('Error in incrementEventBudgetSpentDal', {
      error: { message: error.message, stack: error.stack },
      eventId,
    });
    throw error;
  }
};
