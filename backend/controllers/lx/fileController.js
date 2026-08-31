import {
  createFileSchema,
  getAllFilesSchema,
  updateFileSchema,
} from '../../validators/lx/fileSchema.js';
import { LX_FILE_EDITABLE_FIELDS } from '../../constants/lxFileConstant.js';
import {
  createFileService,
  deleteFileService,
  getAllFilesService,
  getFileByIdService,
  updateFileService,
} from '../../services/lx/fileService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createFileController = async (req, res) => {
  try {
    const validatedData = createFileSchema.parse(req.body);
    const payload = {
      ...validatedData,
      uploadedById: req.actor?.id ?? 'unknown',
      uploadedByName: req.actor?.name ?? 'Unknown',
    };
    const result = await createFileService(payload);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createFileController', req, res);
  }
};

export const getAllFilesController = async (req, res) => {
  try {
    const validatedData = getAllFilesSchema.parse(req.query);
    const result = await getAllFilesService(validatedData);
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
    handleControllerErrorResponse(error, 'getAllFilesController', req, res);
  }
};

export const getFileByIdController = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['fileId'], message: 'fileId is required in the path' }],
      });
    }
    const result = await getFileByIdService(fileId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getFileByIdController', req, res);
  }
};

export const updateFileController = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['fileId'], message: 'fileId is required in the path' }],
      });
    }

    const validatedData = updateFileSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_FILE_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    const result = await updateFileService(fileId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateFileController', req, res);
  }
};

export const deleteFileController = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['fileId'], message: 'fileId is required in the path' }],
      });
    }
    const result = await deleteFileService(fileId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteFileController', req, res);
  }
};
