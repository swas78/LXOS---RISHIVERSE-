import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('initiativeDal');

export const createInitiativeDal = async ({
  title,
  description,
  clanId,
  clanName,
  semester,
  status,
  progress,
  priority,
  team,
  createdByRef,
  createdByName,
}) => {
  try {
    return await prisma.lxInitiative.create({
      data: {
        title,
        clanId,
        ...(description !== undefined ? { description } : {}),
        ...(clanName !== undefined ? { clanName } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(status ? { status } : {}),
        ...(progress !== undefined ? { progress } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(team ? { team } : {}),
        ...(createdByRef !== undefined ? { createdByRef } : {}),
        ...(createdByName !== undefined ? { createdByName } : {}),
      },
    });
  } catch (error) {
    logger.error('Error in createInitiativeDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getInitiativeByIdDal = async (initiativeId) => {
  try {
    return await prisma.lxInitiative.findFirst({
      where: { id: initiativeId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getInitiativeByIdDal', {
      error: { message: error.message, stack: error.stack },
      initiativeId,
    });
    throw error;
  }
};

export const getAllInitiativesDal = async ({
  search,
  clanId,
  status,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(clanId ? { clanId } : {}),
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const [initiatives, total] = await Promise.all([
      prisma.lxInitiative.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxInitiative.count({ where }),
    ]);

    return {
      page,
      limit,
      totalCount: total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      data: initiatives,
    };
  } catch (error) {
    logger.error('Error in getAllInitiativesDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateInitiativeDal = async (initiativeId, data) => {
  try {
    return await prisma.lxInitiative.update({
      where: { id: initiativeId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateInitiativeDal', {
      error: { message: error.message, stack: error.stack },
      initiativeId,
    });
    throw error;
  }
};

export const deleteInitiativeDal = async (initiativeId) => {
  try {
    return await prisma.lxInitiative.update({
      where: { id: initiativeId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteInitiativeDal', {
      error: { message: error.message, stack: error.stack },
      initiativeId,
    });
    throw error;
  }
};
