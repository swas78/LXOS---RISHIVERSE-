import { LX_ACHIEVEMENT_EDITABLE_FIELDS } from '../../constants/lxAchievementConstant.js';
import { actorSnapshot } from '../../helper/lxHelper.js';
import {
  createAchievementService,
  deleteAchievementService,
  getAllAchievementsService,
  getAchievementByIdService,
  reviewAchievementService,
  updateAchievementService,
} from '../../services/lx/achievementService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createAchievementController = async (req, res) => {
  try {
    const validatedData = req.body;
    // Snapshot the creator. LxAchievement stores createdByRef/createdByName only
    // (no createdByRole column), so drop the role from the snapshot.
    const { createdByRef, createdByName } = actorSnapshot(req.actor);
    const result = await createAchievementService({
      ...validatedData,
      createdByRef,
      createdByName,
    });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createAchievementController', req, res);
  }
};

export const getAllAchievementsController = async (req, res) => {
  try {
    const validatedData = req.query;
    const result = await getAllAchievementsService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllAchievementsController', req, res);
  }
};

export const getAchievementByIdController = async (req, res) => {
  try {
    const { achievementId } = req.params;
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['achievementId'], message: 'achievementId is required in the path' }],
      });
    }
    const result = await getAchievementByIdService(achievementId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAchievementByIdController', req, res);
  }
};

export const updateAchievementController = async (req, res) => {
  try {
    const { achievementId } = req.params;
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['achievementId'], message: 'achievementId is required in the path' }],
      });
    }

    const validatedData = req.body;
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            path: LX_ACHIEVEMENT_EDITABLE_FIELDS,
            message: 'At least one field is required to update',
          },
        ],
      });
    }

    const result = await updateAchievementService(achievementId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateAchievementController', req, res);
  }
};

export const deleteAchievementController = async (req, res) => {
  try {
    const { achievementId } = req.params;
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['achievementId'], message: 'achievementId is required in the path' }],
      });
    }
    const result = await deleteAchievementService(achievementId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteAchievementController', req, res);
  }
};

// Custom review action. Permission: ADMIN / LX_TEAM (enforced by the real auth
// layer at integration — no enforcement here, only the snapshot of the reviewer).
export const reviewAchievementController = async (req, res) => {
  try {
    const { achievementId } = req.params;
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['achievementId'], message: 'achievementId is required in the path' }],
      });
    }

    const validatedData = req.body;
    const result = await reviewAchievementService(achievementId, validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'reviewAchievementController', req, res);
  }
};
