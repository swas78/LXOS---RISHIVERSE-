// DEV-ONLY user service — backs the local role/user switcher. Not part of handoff.
import createContextLogger from '../../logger/contextLogger.js';
import { getAllUsersDal, getUserByIdDal } from '../../dals/lx/userDal.js';

const logger = createContextLogger('lxMemberService');

export const getAllUsersService = async () => {
  try {
    const users = await getAllUsersDal();
    return {
      success: true,
      message: 'Users fetched successfully',
      statusCode: 200,
      data: users,
    };
  } catch (error) {
    logger.error('Error in getAllUsersService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getUserByIdService = async (userId) => {
  try {
    const user = await getUserByIdDal(userId);
    if (!user) {
      return { success: false, message: 'User not found', statusCode: 404 };
    }
    return { success: true, message: 'User found', statusCode: 200, data: user };
  } catch (error) {
    logger.error('Error in getUserByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
