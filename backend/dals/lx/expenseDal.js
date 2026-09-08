import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';
import { buildPagination, normalizeSortOrder, pageSkip } from '../../helper/lxHelper.js';

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
      submittedByRef,
      submittedByName,
      idempotencyKey,
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
        submittedByRef,
        submittedByName,
        idempotencyKey: idempotencyKey ?? null,
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

// Soft-deleted rows are deliberately in scope: replaying a key must never book
// the same spend twice, even if the original was withdrawn.
export const getExpenseByIdempotencyKeyDal = async (idempotencyKey) => {
  try {
    return await prisma.lxExpense.findUnique({ where: { idempotencyKey } });
  } catch (error) {
    logger.error('Error in getExpenseByIdempotencyKeyDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllExpensesDal = async ({
  eventId,
  status,
  category,
  submittedByRef,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(eventId ? { eventId } : {}),
      ...(submittedByRef ? { submittedByRef } : {}),
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(Array.isArray(category) && category.length > 0 ? { category: { in: category } } : {}),
    };

    const skip = pageSkip(page, limit);
    const [expenses, total] = await Promise.all([
      prisma.lxExpense.findMany({
        where,
        orderBy: { [sortBy]: normalizeSortOrder(sortOrder, 'desc') },
        skip,
        take: limit,
      }),
      prisma.lxExpense.count({ where }),
    ]);

    return { data: expenses, ...buildPagination(page, limit, total) };
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
