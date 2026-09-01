import createContextLogger from '../../logger/contextLogger.js';
import {
  createProductDal,
  deleteProductDal,
  getAllProductsDal,
  getProductByIdDal,
  updateProductDal,
} from '../../dals/lx/productDal.js';

const logger = createContextLogger('productService');

export const createProductService = async (payload) => {
  try {
    const product = await createProductDal(payload);
    if (!product) {
      return { success: false, message: 'Unable to submit product', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Product submitted — it will appear once an admin approves it',
      statusCode: 201,
      data: product,
    };
  } catch (error) {
    logger.error('Error in createProductService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getProductByIdService = async (productId) => {
  try {
    const product = await getProductByIdDal(productId);
    if (!product) {
      return { success: false, message: 'Product not found', statusCode: 404 };
    }
    return { success: true, message: 'Product found', statusCode: 200, data: product };
  } catch (error) {
    logger.error('Error in getProductByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllProductsService = async (query) => {
  try {
    const result = await getAllProductsDal(query);
    return {
      success: true,
      message: 'Products fetched successfully',
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
    logger.error('Error in getAllProductsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateProductService = async (productId, payload) => {
  try {
    const existing = await getProductByIdDal(productId);
    if (!existing) {
      return { success: false, message: 'Product not found', statusCode: 404 };
    }
    const product = await updateProductDal(productId, payload);
    return {
      success: true,
      message: 'Product updated successfully',
      statusCode: 200,
      data: product,
    };
  } catch (error) {
    logger.error('Error in updateProductService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteProductService = async (productId) => {
  try {
    const existing = await getProductByIdDal(productId);
    if (!existing) {
      return { success: false, message: 'Product not found', statusCode: 404 };
    }
    const product = await deleteProductDal(productId);
    return {
      success: true,
      message: 'Product deleted successfully',
      statusCode: 200,
      data: product,
    };
  } catch (error) {
    logger.error('Error in deleteProductService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Admin/LX review — approve makes the product publicly visible.
export const reviewProductService = async (productId, { action, rejectionReason }, actor) => {
  try {
    const existing = await getProductByIdDal(productId);
    if (!existing) {
      return { success: false, message: 'Product not found', statusCode: 404 };
    }
    const data =
      action === 'approve'
        ? {
            status: 'APPROVED',
            approvedById: actor?.id ?? null,
            approvedByName: actor?.name ?? null,
            approvedAt: new Date(),
            rejectionReason: null,
          }
        : {
            status: 'REJECTED',
            rejectionReason: rejectionReason || 'Rejected',
          };
    const product = await updateProductDal(productId, data);
    return {
      success: true,
      message: `Product ${action}d successfully`,
      statusCode: 200,
      data: product,
    };
  } catch (error) {
    logger.error('Error in reviewProductService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
