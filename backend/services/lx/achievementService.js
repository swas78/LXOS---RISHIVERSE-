import createContextLogger from '../../logger/contextLogger.js';
import {
  createAchievementDal,
  deleteAchievementDal,
  getAllAchievementsDal,
  getAchievementByIdDal,
  updateAchievementDal,
} from '../../dals/lx/achievementDal.js';

const logger = createContextLogger('achievementService');

export const createAchievementService = async (payload) => {
  try {
    const achievement = await createAchievementDal(payload);
    if (!achievement) {
      return { success: false, message: 'Unable to create achievement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Achievement created successfully',
      statusCode: 201,
      data: achievement,
    };
  } catch (error) {
    logger.error('Error in createAchievementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAchievementByIdService = async (achievementId) => {
  try {
    const achievement = await getAchievementByIdDal(achievementId);
    if (!achievement) {
      return { success: false, message: 'Achievement not found', statusCode: 404 };
    }
    return { success: true, message: 'Achievement found', statusCode: 200, data: achievement };
  } catch (error) {
    logger.error('Error in getAchievementByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllAchievementsService = async (query) => {
  try {
    // The Achievements page shows only kind=ACHIEVEMENT; UPDATE posts live in the
    // feed. Default the kind filter so the list excludes blog updates unless a
    // caller explicitly asks for them.
    const result = await getAllAchievementsDal({
      ...query,
      kind: query.kind ?? 'ACHIEVEMENT',
    });
    if (!result) {
      return { success: false, message: 'Unable to list achievements', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Achievements fetched successfully',
      statusCode: 200,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalRecords: result.totalRecords,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (error) {
    logger.error('Error in getAllAchievementsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateAchievementService = async (achievementId, payload) => {
  try {
    const existing = await getAchievementByIdDal(achievementId);
    if (!existing) {
      return { success: false, message: 'Achievement not found', statusCode: 404 };
    }
    const achievement = await updateAchievementDal(achievementId, payload);
    if (!achievement) {
      return { success: false, message: 'Unable to update achievement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Achievement updated successfully',
      statusCode: 200,
      data: achievement,
    };
  } catch (error) {
    logger.error('Error in updateAchievementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteAchievementService = async (achievementId) => {
  try {
    const existing = await getAchievementByIdDal(achievementId);
    if (!existing) {
      return { success: false, message: 'Achievement not found', statusCode: 404 };
    }
    const achievement = await deleteAchievementDal(achievementId);
    if (!achievement) {
      return { success: false, message: 'Unable to delete achievement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Achievement deleted successfully',
      statusCode: 200,
      data: achievement,
    };
  } catch (error) {
    logger.error('Error in deleteAchievementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const reviewAchievementService = async (achievementId, { action, rejectionReason }, actor) => {
  try {
    const existing = await getAchievementByIdDal(achievementId);
    if (!existing) {
      return { success: false, message: 'Achievement not found', statusCode: 404 };
    }

    const updateData =
      action === 'approve'
        ? {
            status: 'APPROVED',
            approvedById: actor?.id ?? 'unknown',
            approvedByName: actor?.name ?? 'Unknown',
            approvedAt: new Date(),
            rejectionReason: null,
          }
        : {
            status: 'REJECTED',
            rejectionReason: rejectionReason ?? null,
          };

    const achievement = await updateAchievementDal(achievementId, updateData);
    if (!achievement) {
      return { success: false, message: 'Unable to review achievement', statusCode: 400 };
    }
    return {
      success: true,
      message: action === 'approve' ? 'Achievement approved' : 'Achievement rejected',
      statusCode: 200,
      data: achievement,
    };
  } catch (error) {
    logger.error('Error in reviewAchievementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
