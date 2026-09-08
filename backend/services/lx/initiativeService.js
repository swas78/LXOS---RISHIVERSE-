import createContextLogger from '../../logger/contextLogger.js';
import {
  createInitiativeDal,
  deleteInitiativeDal,
  getAllInitiativesDal,
  getInitiativeByIdDal,
  updateInitiativeDal,
} from '../../dals/lx/initiativeDal.js';
import { assertClanWrite, resolveWriteClanId } from '../../helper/lxScope.js';

const logger = createContextLogger('initiativeService');

export const createInitiativeService = async (payload, actor) => {
  try {
    // A clan head may only open initiatives on their own clan. Pin the clanId to
    // theirs rather than trusting the body, so a forged clanId cannot land an
    // initiative on someone else's board.
    const clanId = resolveWriteClanId(actor, payload.clanId);
    const allowed = assertClanWrite(actor, clanId);
    if (!allowed.ok) {
      return { success: false, message: allowed.message, statusCode: allowed.statusCode };
    }

    const initiative = await createInitiativeDal({ ...payload, clanId });
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

export const updateInitiativeService = async (initiativeId, payload, actor) => {
  try {
    const existing = await getInitiativeByIdDal(initiativeId);
    if (!existing) {
      return { success: false, message: 'Initiative not found', statusCode: 404 };
    }
    // Check the clan that OWNS the row, not the one in the payload — otherwise a
    // clan head could edit a rival's initiative by omitting clanId.
    const owned = assertClanWrite(actor, existing.clanId);
    if (!owned.ok) {
      return { success: false, message: owned.message, statusCode: owned.statusCode };
    }
    // Nor may they move an initiative onto a clan they do not lead.
    if (payload.clanId && payload.clanId !== existing.clanId) {
      const target = assertClanWrite(actor, payload.clanId);
      if (!target.ok) {
        return { success: false, message: target.message, statusCode: target.statusCode };
      }
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

export const deleteInitiativeService = async (initiativeId, actor) => {
  try {
    const existing = await getInitiativeByIdDal(initiativeId);
    if (!existing) {
      return { success: false, message: 'Initiative not found', statusCode: 404 };
    }
    const owned = assertClanWrite(actor, existing.clanId);
    if (!owned.ok) {
      return { success: false, message: owned.message, statusCode: owned.statusCode };
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
