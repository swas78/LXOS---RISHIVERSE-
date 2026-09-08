import {
  createClubSchema,
  getAllClubsSchema,
  updateClubSchema,
} from '../../validators/lx/clubSchema.js';
import { LX_CLUB_EDITABLE_FIELDS } from '../../constants/lxClubConstant.js';
import {
  createClubService,
  deleteClubService,
  getAllClubsService,
  getClubByIdService,
  updateClubService,
} from '../../services/lx/clubService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createClubController = async (req, res) => {
  try {
    const validatedData = createClubSchema.parse(req.body);
    const result = await createClubService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createClubController', req, res);
  }
};

export const getAllClubsController = async (req, res) => {
  try {
    const validatedData = getAllClubsSchema.parse(req.query);
    const result = await getAllClubsService(validatedData, req.actor);
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
    handleControllerErrorResponse(error, 'getAllClubsController', req, res);
  }
};

export const getClubByIdController = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clubId'], message: 'clubId is required in the path' }],
      });
    }
    const result = await getClubByIdService(clubId, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getClubByIdController', req, res);
  }
};

export const updateClubController = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clubId'], message: 'clubId is required in the path' }],
      });
    }

    const validatedData = updateClubSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_CLUB_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    const result = await updateClubService(clubId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateClubController', req, res);
  }
};

export const deleteClubController = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clubId'], message: 'clubId is required in the path' }],
      });
    }
    const result = await deleteClubService(clubId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteClubController', req, res);
  }
};
