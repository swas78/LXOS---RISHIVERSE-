import {
  createItemSchema,
  getAllItemsSchema,
  updateItemSchema,
} from '../../validators/demo/itemSchema.js';
import { DEMO_ITEM_EDITABLE_FIELDS } from '../../constants/demoConstant.js';
import {
  createItemService,
  deleteItemService,
  getAllItemsService,
  getItemByIdService,
  updateItemService,
} from '../../services/demo/itemService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createItemController = async (req, res) => {
  try {
    const validatedData = createItemSchema.parse(req.body);
    const result = await createItemService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createItemController', req, res);
  }
};

export const getAllItemsController = async (req, res) => {
  try {
    const validatedData = getAllItemsSchema.parse(req.query);
    const result = await getAllItemsService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllItemsController', req, res);
  }
};

export const getItemByIdController = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['itemId'], message: 'itemId is required in the path' }],
      });
    }
    const result = await getItemByIdService(itemId);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getItemByIdController', req, res);
  }
};

export const updateItemController = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['itemId'], message: 'itemId is required in the path' }],
      });
    }

    const validatedData = updateItemSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            path: DEMO_ITEM_EDITABLE_FIELDS,
            message: 'At least one field is required to update',
          },
        ],
      });
    }

    const result = await updateItemService(itemId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateItemController', req, res);
  }
};

export const deleteItemController = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['itemId'], message: 'itemId is required in the path' }],
      });
    }
    const result = await deleteItemService(itemId);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteItemController', req, res);
  }
};
