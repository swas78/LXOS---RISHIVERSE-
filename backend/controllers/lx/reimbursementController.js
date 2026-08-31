import {
  createReimbursementSchema,
  getAllReimbursementsSchema,
  updateReimbursementSchema,
  reviewReimbursementSchema,
} from '../../validators/lx/reimbursementSchema.js';
import { LX_REIMBURSEMENT_EDITABLE_FIELDS } from '../../constants/lxReimbursementConstant.js';
import {
  createReimbursementService,
  deleteReimbursementService,
  getAllReimbursementsService,
  getReimbursementByIdService,
  updateReimbursementService,
  reviewReimbursementService,
  processReimbursementService,
} from '../../services/lx/reimbursementService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createReimbursementController = async (req, res) => {
  try {
    const validatedData = createReimbursementSchema.parse(req.body);
    // Snapshot the submitter from the acting user.
    const payload = {
      ...validatedData,
      submittedById: req.actor?.id ?? 'unknown',
      submittedByName: req.actor?.name ?? 'Unknown',
    };
    const result = await createReimbursementService(payload);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createReimbursementController', req, res);
  }
};

export const getAllReimbursementsController = async (req, res) => {
  try {
    const validatedData = getAllReimbursementsSchema.parse(req.query);
    const result = await getAllReimbursementsService(validatedData);
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
    handleControllerErrorResponse(error, 'getAllReimbursementsController', req, res);
  }
};

export const getReimbursementByIdController = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    if (!reimbursementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['reimbursementId'], message: 'reimbursementId is required in the path' }],
      });
    }
    const result = await getReimbursementByIdService(reimbursementId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getReimbursementByIdController', req, res);
  }
};

export const updateReimbursementController = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    if (!reimbursementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['reimbursementId'], message: 'reimbursementId is required in the path' }],
      });
    }

    const validatedData = updateReimbursementSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            path: LX_REIMBURSEMENT_EDITABLE_FIELDS,
            message: 'At least one field is required to update',
          },
        ],
      });
    }

    const result = await updateReimbursementService(reimbursementId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateReimbursementController', req, res);
  }
};

export const deleteReimbursementController = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    if (!reimbursementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['reimbursementId'], message: 'reimbursementId is required in the path' }],
      });
    }
    const result = await deleteReimbursementService(reimbursementId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteReimbursementController', req, res);
  }
};

// LX / Admin review: approve or reject a claim.
export const reviewReimbursementController = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    if (!reimbursementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['reimbursementId'], message: 'reimbursementId is required in the path' }],
      });
    }
    const { action, rejectionReason } = reviewReimbursementSchema.parse(req.body);
    const result = await reviewReimbursementService(reimbursementId, {
      action,
      rejectionReason,
      actor: req.actor,
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
    handleControllerErrorResponse(error, 'reviewReimbursementController', req, res);
  }
};

// Finance process: mark an approved claim as paid out.
export const processReimbursementController = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    if (!reimbursementId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['reimbursementId'], message: 'reimbursementId is required in the path' }],
      });
    }
    const result = await processReimbursementService(reimbursementId, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'processReimbursementController', req, res);
  }
};
