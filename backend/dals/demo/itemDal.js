import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('itemDal');

export const createItemDal = async ({ title, description, status }) => {
  try {
    return await prisma.demoItem.create({
      data: {
        title,
        description: description ?? null,
        ...(status ? { status } : {}),
      },
    });
  } catch (error) {
    logger.error('Error in createItemDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getItemByIdDal = async (itemId) => {
  try {
    return await prisma.demoItem.findFirst({
      where: { id: itemId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getItemByIdDal', {
      error: { message: error.message, stack: error.stack },
      itemId,
    });
    throw error;
  }
};

export const getAllItemsDal = async ({ search, status, page, limit, sortBy, sortOrder }) => {
  try {
    const where = {
      deletedAt: null,
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

    const [items, total] = await Promise.all([
      prisma.demoItem.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.demoItem.count({ where }),
    ]);

    return {
      page,
      limit,
      totalRecords: total,
      data: items,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllItemsDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateItemDal = async (itemId, data) => {
  try {
    return await prisma.demoItem.update({
      where: { id: itemId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateItemDal', {
      error: { message: error.message, stack: error.stack },
      itemId,
    });
    throw error;
  }
};

export const deleteItemDal = async (itemId) => {
  try {
    return await prisma.demoItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteItemDal', {
      error: { message: error.message, stack: error.stack },
      itemId,
    });
    throw error;
  }
};
