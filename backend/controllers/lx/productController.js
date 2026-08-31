import {
  createProductSchema,
  getAllProductsSchema,
  reviewProductSchema,
  updateProductSchema,
} from '../../validators/lx/productSchema.js';
import { LX_PRODUCT_EDITABLE_FIELDS } from '../../constants/lxProductConstant.js';
import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  reviewProductService,
  updateProductService,
} from '../../services/lx/productService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createProductController = async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    // Snapshot the submitting learner from the actor shim.
    const payload = {
      ...validatedData,
      createdById: req.actor?.id ?? 'unknown',
      createdByName: req.actor?.name ?? 'Unknown',
    };
    const result = await createProductService(payload);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createProductController', req, res);
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const validatedData = getAllProductsSchema.parse(req.query);
    const result = await getAllProductsService(validatedData);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllProductsController', req, res);
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['productId'], message: 'productId is required in the path' }],
      });
    }
    const result = await getProductByIdService(productId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getProductByIdController', req, res);
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['productId'], message: 'productId is required in the path' }],
      });
    }
    const validatedData = updateProductSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: LX_PRODUCT_EDITABLE_FIELDS, message: 'At least one field is required to update' }],
      });
    }
    const result = await updateProductService(productId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateProductController', req, res);
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['productId'], message: 'productId is required in the path' }],
      });
    }
    const result = await deleteProductService(productId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteProductController', req, res);
  }
};

// Permission: ADMIN (per requirement); LX_TEAM allowed for parity with other
// review flows. Enforced by RishiVerse checkPermission at integration.
export const reviewProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['productId'], message: 'productId is required in the path' }],
      });
    }
    const validatedData = reviewProductSchema.parse(req.body);
    const result = await reviewProductService(productId, validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'reviewProductController', req, res);
  }
};
