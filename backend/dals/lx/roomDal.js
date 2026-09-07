import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('roomDal');

export const createRoomDal = async ({
  name,
  building,
  floor,
  capacity,
  type,
  amenities,
  isActive,
}) => {
  try {
    return await prisma.lxRoom.create({
      data: {
        name,
        building: building ?? null,
        floor: floor ?? null,
        ...(capacity !== undefined ? { capacity } : {}),
        ...(type ? { type } : {}),
        ...(amenities ? { amenities } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  } catch (error) {
    logger.error('Error in createRoomDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getRoomByIdDal = async (roomId) => {
  try {
    return await prisma.lxRoom.findFirst({
      where: { id: roomId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getRoomByIdDal', {
      error: { message: error.message, stack: error.stack },
      roomId,
    });
    throw error;
  }
};

export const getAllRoomsDal = async ({
  search,
  type,
  isActive,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(Array.isArray(type) && type.length > 0 ? { type: { in: type } } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { building: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      prisma.lxRoom.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxRoom.count({ where }),
    ]);

    return {
      page,
      limit,
      totalCount: total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      data: rooms,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllRoomsDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateRoomDal = async (roomId, data) => {
  try {
    return await prisma.lxRoom.update({
      where: { id: roomId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateRoomDal', {
      error: { message: error.message, stack: error.stack },
      roomId,
    });
    throw error;
  }
};

export const deleteRoomDal = async (roomId) => {
  try {
    return await prisma.lxRoom.update({
      where: { id: roomId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteRoomDal', {
      error: { message: error.message, stack: error.stack },
      roomId,
    });
    throw error;
  }
};
