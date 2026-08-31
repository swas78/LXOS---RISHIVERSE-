import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';
import { buildPagination, pageSkip } from '../../helper/lxHelper.js';

const logger = createContextLogger('feedDal');

// The activity feed: approved achievements + club/clan updates (kind UPDATE),
// most recent first.
export const getFeedDal = async ({ kind, page, limit }) => {
  try {
    const where = {
      deletedAt: null,
      status: 'APPROVED',
      ...(kind ? { kind } : {}),
    };
    const skip = pageSkip(page, limit);
    const [items, total] = await Promise.all([
      prisma.lxAchievement.findMany({
        where,
        orderBy: [{ achievedDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.lxAchievement.count({ where }),
    ]);
    return { data: items, ...buildPagination(page, limit, total) };
  } catch (error) {
    logger.error('Error in getFeedDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
