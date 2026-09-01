import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('dashboardDal');

export const getDashboardDataDal = async () => {
  try {
    const now = new Date();
    const [
      totalEvents,
      activeClubs,
      clansCount,
      upcomingEvents,
      nextUp,
      recentEvents,
      pendingEvents,
      pendingAchievements,
      pendingReimbursements,
      pendingExpenses,
      pendingProducts,
    ] = await Promise.all([
      prisma.lxEvent.count({ where: { deletedAt: null } }),
      prisma.lxClub.count({ where: { deletedAt: null, isActive: true } }),
      prisma.lxClan.count({ where: { deletedAt: null } }),
      prisma.lxEvent.count({
        where: { deletedAt: null, status: 'APPROVED', startDate: { gte: now } },
      }),
      prisma.lxEvent.findFirst({
        where: { deletedAt: null, status: 'APPROVED', startDate: { gte: now } },
        orderBy: { startDate: 'asc' },
      }),
      prisma.lxEvent.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.lxEvent.count({ where: { deletedAt: null, status: 'PENDING' } }),
      prisma.lxAchievement.count({ where: { deletedAt: null, status: 'PENDING' } }),
      prisma.lxReimbursement.count({ where: { deletedAt: null, status: 'PENDING' } }),
      prisma.lxExpense.count({ where: { deletedAt: null, status: 'PENDING' } }),
      prisma.lxProduct.count({ where: { deletedAt: null, status: 'PENDING' } }),
    ]);

    return {
      totalEvents,
      activeClubs,
      clansCount,
      upcomingEvents,
      nextUp,
      recentEvents,
      pending: {
        events: pendingEvents,
        achievements: pendingAchievements,
        reimbursements: pendingReimbursements,
        expenses: pendingExpenses,
        products: pendingProducts,
        total:
          pendingEvents +
          pendingAchievements +
          pendingReimbursements +
          pendingExpenses +
          pendingProducts,
      },
    };
  } catch (error) {
    logger.error('Error in getDashboardDataDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
