import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('clanDal');

export const createClanDal = async ({
  name,
  color,
  points,
  budgetAllocated,
  budgetSpent,
  semester,
  description,
}) => {
  try {
    return await prisma.lxClan.create({
      data: {
        name,
        color,
        ...(points !== undefined ? { points } : {}),
        ...(budgetAllocated !== undefined ? { budgetAllocated } : {}),
        ...(budgetSpent !== undefined ? { budgetSpent } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
  } catch (error) {
    logger.error('Error in createClanDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getClanByIdDal = async (clanId) => {
  try {
    return await prisma.lxClan.findFirst({
      where: { id: clanId, deletedAt: null },
      include: {
        pointTxns: {
          orderBy: { date: 'desc' },
        },
      },
    });
  } catch (error) {
    logger.error('Error in getClanByIdDal', {
      error: { message: error.message, stack: error.stack },
      clanId,
    });
    throw error;
  }
};

export const getAllClansDal = async ({ search, page, limit, sortBy, sortOrder }) => {
  try {
    const where = {
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const [clans, total] = await Promise.all([
      prisma.lxClan.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxClan.count({ where }),
    ]);

    return {
      page,
      limit,
      totalCount: total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      data: clans,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllClansDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateClanDal = async (clanId, data) => {
  try {
    return await prisma.lxClan.update({
      where: { id: clanId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateClanDal', {
      error: { message: error.message, stack: error.stack },
      clanId,
    });
    throw error;
  }
};

export const deleteClanDal = async (clanId) => {
  try {
    return await prisma.lxClan.update({
      where: { id: clanId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteClanDal', {
      error: { message: error.message, stack: error.stack },
      clanId,
    });
    throw error;
  }
};

// Atomically set the clan's new point total and append a point transaction to
// the (append-only) ledger, then return the updated clan with its ledger.
export const applyClanPointsDal = async ({
  clanId,
  newPoints,
  previousPoints,
  reason,
  createdByRef,
  createdByName,
}) => {
  try {
    await prisma.$transaction([
      prisma.lxClan.update({
        where: { id: clanId },
        data: { points: newPoints },
      }),
      prisma.lxClanPointTxn.create({
        data: {
          clanId,
          delta: newPoints - previousPoints,
          points: newPoints,
          previousPoints,
          reason,
          ...(createdByRef !== undefined ? { createdByRef } : {}),
          ...(createdByName !== undefined ? { createdByName } : {}),
        },
      }),
    ]);

    return await getClanByIdDal(clanId);
  } catch (error) {
    logger.error('Error in applyClanPointsDal', {
      error: { message: error.message, stack: error.stack },
      clanId,
    });
    throw error;
  }
};
