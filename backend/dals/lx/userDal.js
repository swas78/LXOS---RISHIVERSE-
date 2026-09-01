// DEV-ONLY user DAL — backs the local role/user switcher. Not part of handoff.
import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('lxUserDal');

export const getAllUsersDal = async () => {
  try {
    return await prisma.lxUser.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    logger.error('Error in getAllUsersDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getUserByIdDal = async (userId) => {
  try {
    return await prisma.lxUser.findFirst({ where: { id: userId, isActive: true } });
  } catch (error) {
    logger.error('Error in getUserByIdDal', {
      error: { message: error.message, stack: error.stack },
      userId,
    });
    throw error;
  }
};
