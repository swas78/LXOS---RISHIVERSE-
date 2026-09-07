import createContextLogger from '../../logger/contextLogger.js';
import {
  createInitiativeDal,
  deleteInitiativeDal,
  getAllInitiativesDal,
  getInitiativeByIdDal,
  updateInitiativeDal,
} from '../../dals/lx/initiativeDal.js';

const logger = createContextLogger('initiativeService');

export const createInitiativeService = async (payload) => {
  try {
    const initiative = await createInitiativeDal(payload);
    if (!initiative) {
      return { success: false, message: 'Unable to create initiative', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Initiative created successfully',
      statusCode: 201,
      data: initiative,
    };
  } catch (error) {
    logger.error('Error in createInitiativeService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getInitiativeByIdService = async (initiativeId) => {
  try {
    const initiative = await getInitiativeByIdDal(initiativeId);
    if (!initiative) {
      return { success: false, message: 'Initiative not found', statusCode: 404 };
    }
    return { success: true, message: 'Initiative found', statusCode: 200, data: initiative };
  } catch (error) {
    logger.error('Error in getInitiativeByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllInitiativesService = async (query) => {
  try {
    const result = await getAllInitiativesDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list initiatives', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Initiatives fetched successfully',
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
    logger.error('Error in getAllInitiativesService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateInitiativeService = async (initiativeId, payload) => {
  try {
    const existing = await getInitiativeByIdDal(initiativeId);
    if (!existing) {
      return { success: false, message: 'Initiative not found', statusCode: 404 };
    }
    const initiative = await updateInitiativeDal(initiativeId, payload);
    if (!initiative) {
      return { success: false, message: 'Unable to update initiative', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Initiative updated successfully',
      statusCode: 200,
      data: initiative,
    };
  } catch (error) {
    logger.error('Error in updateInitiativeService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteInitiativeService = async (initiativeId) => {
  try {
    const existing = await getInitiativeByIdDal(initiativeId);
    if (!existing) {
      return { success: false, message: 'Initiative not found', statusCode: 404 };
    }
    const initiative = await deleteInitiativeDal(initiativeId);
    if (!initiative) {
      return { success: false, message: 'Unable to delete initiative', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Initiative deleted successfully',
      statusCode: 200,
      data: initiative,
    };
  } catch (error) {
    logger.error('Error in deleteInitiativeService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
