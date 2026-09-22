import { LX_CLAN_EDITABLE_FIELDS } from '../../constants/lxClanConstant.js';
import {
  createClanService,
  deleteClanService,
  getAllClansService,
  getClanByIdService,
  manageClanPointsService,
  updateClanService,
} from '../../services/lx/clanService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createClanController = async (req, res) => {
  try {
    const validatedData = req.body;
    const result = await createClanService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createClanController', req, res);
  }
};

export const getAllClansController = async (req, res) => {
  try {
    const validatedData = req.query;
    const result = await getAllClansService(validatedData, req.actor);
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
    handleControllerErrorResponse(error, 'getAllClansController', req, res);
  }
};

export const getClanByIdController = async (req, res) => {
  try {
    const { clanId } = req.params;
    if (!clanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clanId'], message: 'clanId is required in the path' }],
      });
    }
    const result = await getClanByIdService(clanId, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getClanByIdController', req, res);
  }
};

export const updateClanController = async (req, res) => {
  try {
    const { clanId } = req.params;
    if (!clanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clanId'], message: 'clanId is required in the path' }],
      });
    }

    const validatedData = req.body;
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_CLAN_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    const result = await updateClanService(clanId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateClanController', req, res);
  }
};

export const deleteClanController = async (req, res) => {
  try {
    const { clanId } = req.params;
    if (!clanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clanId'], message: 'clanId is required in the path' }],
      });
    }
    const result = await deleteClanService(clanId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteClanController', req, res);
  }
};

export const manageClanPointsController = async (req, res) => {
  try {
    const { clanId } = req.params;
    if (!clanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clanId'], message: 'clanId is required in the path' }],
      });
    }

    const validatedData = req.body;
    const result = await manageClanPointsService(clanId, validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'manageClanPointsController', req, res);
  }
};
