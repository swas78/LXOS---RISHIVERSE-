import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('achievementDal');

export const createAchievementDal = async (data) => {
  try {
    return await prisma.lxAchievement.create({ data });
  } catch (error) {
    logger.error('Error in createAchievementDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAchievementByIdDal = async (achievementId) => {
  try {
    return await prisma.lxAchievement.findFirst({
      where: { id: achievementId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getAchievementByIdDal', {
      error: { message: error.message, stack: error.stack },
      achievementId,
    });
    throw error;
  }
};

export const getAllAchievementsDal = async ({
  search,
  person,
  clubId,
  clanId,
  kind,
  category,
  status,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const andFilters = [];

    if (search) {
      andFilters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (person) {
      andFilters.push({
        OR: [
          { createdByName: { contains: person, mode: 'insensitive' } },
          { participants: { has: person } },
        ],
      });
    }

    const where = {
      deletedAt: null,
      ...(kind ? { kind } : {}),
      ...(clubId ? { clubId } : {}),
      ...(clanId ? { clanId } : {}),
      ...(Array.isArray(category) && category.length > 0 ? { category: { in: category } } : {}),
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      prisma.lxAchievement.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxAchievement.count({ where }),
    ]);

    return {
      page,
      limit,
      totalRecords: total,
      data: achievements,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllAchievementsDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateAchievementDal = async (achievementId, data) => {
  try {
    return await prisma.lxAchievement.update({
      where: { id: achievementId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateAchievementDal', {
      error: { message: error.message, stack: error.stack },
      achievementId,
    });
    throw error;
  }
};

export const deleteAchievementDal = async (achievementId) => {
  try {
    return await prisma.lxAchievement.update({
      where: { id: achievementId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteAchievementDal', {
      error: { message: error.message, stack: error.stack },
      achievementId,
    });
    throw error;
  }
};
