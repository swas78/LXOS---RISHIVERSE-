import createContextLogger from '../../logger/contextLogger.js';
import {
  createClubDal,
  deleteClubDal,
  getAllClubsDal,
  getClubByIdDal,
  updateClubDal,
} from '../../dals/lx/clubDal.js';

const logger = createContextLogger('clubService');

export const createClubService = async (payload) => {
  try {
    const club = await createClubDal(payload);
    if (!club) {
      return { success: false, message: 'Unable to create club', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Club created successfully',
      statusCode: 201,
      data: club,
    };
  } catch (error) {
    logger.error('Error in createClubService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getClubByIdService = async (clubId) => {
  try {
    const club = await getClubByIdDal(clubId);
    if (!club) {
      return { success: false, message: 'Club not found', statusCode: 404 };
    }
    return { success: true, message: 'Club found', statusCode: 200, data: club };
  } catch (error) {
    logger.error('Error in getClubByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllClubsService = async (query) => {
  try {
    const result = await getAllClubsDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list clubs', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Clubs fetched successfully',
      statusCode: 200,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (error) {
    logger.error('Error in getAllClubsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateClubService = async (clubId, payload) => {
  try {
    const existing = await getClubByIdDal(clubId);
    if (!existing) {
      return { success: false, message: 'Club not found', statusCode: 404 };
    }
    const club = await updateClubDal(clubId, payload);
    if (!club) {
      return { success: false, message: 'Unable to update club', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Club updated successfully',
      statusCode: 200,
      data: club,
    };
  } catch (error) {
    logger.error('Error in updateClubService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteClubService = async (clubId) => {
  try {
    const existing = await getClubByIdDal(clubId);
    if (!existing) {
      return { success: false, message: 'Club not found', statusCode: 404 };
    }
    const club = await deleteClubDal(clubId);
    if (!club) {
      return { success: false, message: 'Unable to delete club', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Club deleted successfully',
      statusCode: 200,
      data: club,
    };
  } catch (error) {
    logger.error('Error in deleteClubService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
