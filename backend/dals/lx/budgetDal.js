import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('budgetDal');

export const getBudgetDataDal = async () => {
  try {
    const [clubs, clans, approvedExpenseAgg, processedReimbAgg] = await Promise.all([
      prisma.lxClub.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, category: true, budgetAllocated: true, budgetSpent: true },
        orderBy: { name: 'asc' },
      }),
      prisma.lxClan.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, color: true, budgetAllocated: true, budgetSpent: true, points: true },
        orderBy: { points: 'desc' },
      }),
      prisma.lxExpense.aggregate({
        where: { deletedAt: null, status: 'APPROVED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.lxReimbursement.aggregate({
        where: { deletedAt: null, status: 'PROCESSED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
    return { clubs, clans, approvedExpenseAgg, processedReimbAgg };
  } catch (error) {
    logger.error('Error in getBudgetDataDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
