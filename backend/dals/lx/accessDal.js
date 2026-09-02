// Access-management DAL — reads/writes role + club/clan linkage on LxUser.
// In the kit LxUser IS the directory; in RishiVerse this maps onto the core
// user/role system (userType → role). Admin-only (enforced in routes).
import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('accessDal');

export const getAccessOverviewDal = async () => {
  try {
    const [clubs, clans, users] = await Promise.all([
      prisma.lxClub.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.lxClan.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, color: true },
        orderBy: { name: 'asc' },
      }),
      prisma.lxUser.findMany({
        where: { isActive: true },
        select: { id: true, name: true, email: true, role: true, clubId: true, clanId: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    return { clubs, clans, users };
  } catch (error) {
    logger.error('Error in getAccessOverviewDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const findUserByEmailDal = async (email) => {
  try {
    return await prisma.lxUser.findFirst({ where: { email: email.toLowerCase().trim() } });
  } catch (error) {
    logger.error('Error in findUserByEmailDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const findUserByIdDal = async (id) => {
  try {
    return await prisma.lxUser.findFirst({ where: { id } });
  } catch (error) {
    logger.error('Error in findUserByIdDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const createUserDal = async ({ name, email, role = 'GUEST' }) => {
  try {
    return await prisma.lxUser.create({
      data: { name, email: email.toLowerCase().trim(), role, isActive: true },
    });
  } catch (error) {
    logger.error('Error in createUserDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateUserAccessDal = async (id, data) => {
  try {
    return await prisma.lxUser.update({ where: { id }, data });
  } catch (error) {
    logger.error('Error in updateUserAccessDal', {
      error: { message: error.message, stack: error.stack },
      id,
    });
    throw error;
  }
};
