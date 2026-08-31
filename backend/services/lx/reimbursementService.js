import createContextLogger from '../../logger/contextLogger.js';
import {
  createReimbursementDal,
  deleteReimbursementDal,
  getAllReimbursementsDal,
  getReimbursementByIdDal,
  updateReimbursementDal,
  incrementClubBudgetSpentDal,
  incrementClanBudgetSpentDal,
} from '../../dals/lx/reimbursementDal.js';

const logger = createContextLogger('reimbursementService');

export const createReimbursementService = async (payload) => {
  try {
    const reimbursement = await createReimbursementDal(payload);
    if (!reimbursement) {
      return { success: false, message: 'Unable to create reimbursement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Reimbursement submitted successfully',
      statusCode: 201,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in createReimbursementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getReimbursementByIdService = async (reimbursementId) => {
  try {
    const reimbursement = await getReimbursementByIdDal(reimbursementId);
    if (!reimbursement) {
      return { success: false, message: 'Reimbursement not found', statusCode: 404 };
    }
    return {
      success: true,
      message: 'Reimbursement found',
      statusCode: 200,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in getReimbursementByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllReimbursementsService = async (query) => {
  try {
    const result = await getAllReimbursementsDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list reimbursements', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Reimbursements fetched successfully',
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
    logger.error('Error in getAllReimbursementsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateReimbursementService = async (reimbursementId, payload) => {
  try {
    const existing = await getReimbursementByIdDal(reimbursementId);
    if (!existing) {
      return { success: false, message: 'Reimbursement not found', statusCode: 404 };
    }
    const reimbursement = await updateReimbursementDal(reimbursementId, payload);
    if (!reimbursement) {
      return { success: false, message: 'Unable to update reimbursement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Reimbursement updated successfully',
      statusCode: 200,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in updateReimbursementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteReimbursementService = async (reimbursementId) => {
  try {
    const existing = await getReimbursementByIdDal(reimbursementId);
    if (!existing) {
      return { success: false, message: 'Reimbursement not found', statusCode: 404 };
    }
    const reimbursement = await deleteReimbursementDal(reimbursementId);
    if (!reimbursement) {
      return { success: false, message: 'Unable to delete reimbursement', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Reimbursement deleted successfully',
      statusCode: 200,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in deleteReimbursementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Review workflow (LX / Admin): approve or reject a PENDING claim.
// On approve, if the claim is charged to a club or clan and its budget has not
// yet been deducted, increment that club/clan's budgetSpent by the claim amount.
export const reviewReimbursementService = async (reimbursementId, { action, rejectionReason, actor }) => {
  try {
    const existing = await getReimbursementByIdDal(reimbursementId);
    if (!existing) {
      return { success: false, message: 'Reimbursement not found', statusCode: 404 };
    }

    const reviewedById = actor?.id ?? 'unknown';
    const reviewedByName = actor?.name ?? 'Unknown';

    if (action === 'reject') {
      const reimbursement = await updateReimbursementDal(reimbursementId, {
        status: 'REJECTED',
        reviewedById,
        reviewedByName,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      });
      return {
        success: true,
        message: 'Reimbursement rejected',
        statusCode: 200,
        data: reimbursement,
      };
    }

    // action === 'approve'
    const shouldDeductBudget =
      !existing.budgetDeducted && (existing.clubId || existing.clanId);

    if (shouldDeductBudget) {
      if (existing.clubId) {
        await incrementClubBudgetSpentDal(existing.clubId, existing.amount);
      } else if (existing.clanId) {
        await incrementClanBudgetSpentDal(existing.clanId, existing.amount);
      }
    }

    const reimbursement = await updateReimbursementDal(reimbursementId, {
      status: 'APPROVED',
      reviewedById,
      reviewedByName,
      reviewedAt: new Date(),
      ...(shouldDeductBudget ? { budgetDeducted: true } : {}),
    });

    return {
      success: true,
      message: 'Reimbursement approved',
      statusCode: 200,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in reviewReimbursementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Process workflow (Finance): mark an APPROVED claim as PROCESSED (paid out).
export const processReimbursementService = async (reimbursementId, actor) => {
  try {
    const existing = await getReimbursementByIdDal(reimbursementId);
    if (!existing) {
      return { success: false, message: 'Reimbursement not found', statusCode: 404 };
    }
    if (existing.status !== 'APPROVED') {
      return {
        success: false,
        message: 'Reimbursement must be APPROVED before it can be processed',
        statusCode: 400,
      };
    }

    const reimbursement = await updateReimbursementDal(reimbursementId, {
      status: 'PROCESSED',
      processedById: actor?.id ?? 'unknown',
      processedByName: actor?.name ?? 'Unknown',
      processedAt: new Date(),
    });

    return {
      success: true,
      message: 'Reimbursement processed',
      statusCode: 200,
      data: reimbursement,
    };
  } catch (error) {
    logger.error('Error in processReimbursementService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
