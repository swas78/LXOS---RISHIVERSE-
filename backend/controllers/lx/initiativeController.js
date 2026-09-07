import {
  createInitiativeSchema,
  getAllInitiativesSchema,
  updateInitiativeSchema,
} from '../../validators/lx/initiativeSchema.js';
import { LX_INITIATIVE_EDITABLE_FIELDS } from '../../constants/lxInitiativeConstant.js';
import {
  createInitiativeService,
  deleteInitiativeService,
  getAllInitiativesService,
  getInitiativeByIdService,
  updateInitiativeService,
} from '../../services/lx/initiativeService.js';
import { actorSnapshot } from '../../helper/lxHelper.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createInitiativeController = async (req, res) => {
  try {
    const validatedData = createInitiativeSchema.parse(req.body);
    // Snapshot the creator (initiative only stores createdByRef/createdByName).
    const { createdByRef, createdByName } = actorSnapshot(req.actor);
    const result = await createInitiativeService({
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
    handleControllerErrorResponse(error, 'createInitiativeController', req, res);
  }
};

export const getAllInitiativesController = async (req, res) => {
  try {
    const validatedData = getAllInitiativesSchema.parse(req.query);
    const result = await getAllInitiativesService(validatedData);
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
    handleControllerErrorResponse(error, 'getAllInitiativesController', req, res);
  }
};

export const getInitiativeByIdController = async (req, res) => {
  try {
    const { initiativeId } = req.params;
    if (!initiativeId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['initiativeId'], message: 'initiativeId is required in the path' }],
      });
    }
    const result = await getInitiativeByIdService(initiativeId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getInitiativeByIdController', req, res);
  }
};

export const updateInitiativeController = async (req, res) => {
  try {
    const { initiativeId } = req.params;
    if (!initiativeId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['initiativeId'], message: 'initiativeId is required in the path' }],
      });
    }

    const validatedData = updateInitiativeSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            path: LX_INITIATIVE_EDITABLE_FIELDS,
            message: 'At least one field is required to update',
          },
        ],
      });
    }

    const result = await updateInitiativeService(initiativeId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateInitiativeController', req, res);
  }
};

export const deleteInitiativeController = async (req, res) => {
  try {
    const { initiativeId } = req.params;
    if (!initiativeId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['initiativeId'], message: 'initiativeId is required in the path' }],
      });
    }
    const result = await deleteInitiativeService(initiativeId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteInitiativeController', req, res);
  }
};
