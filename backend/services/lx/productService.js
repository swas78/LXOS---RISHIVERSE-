import createContextLogger from '../../logger/contextLogger.js';
import { objectExists, resolveS3Url } from './uploadService.js';
import {
  createProductDal,
  deleteProductDal,
  getAllProductsDal,
  getProductByIdDal,
  updateProductDal,
} from '../../dals/lx/productDal.js';

const logger = createContextLogger('productService');

/**
 * `images` arrives straight from the browser, so a caller can name any object
 * they like — including one they never uploaded, or someone else's. upload.md
 * requires the confirm step to be treated as untrusted, so refuse to persist a
 * pointer with no bytes behind it rather than storing a broken card image.
 */
const findMissingImage = async (images) => {
  for (const s3Path of images ?? []) {
    // Sequential on purpose: the first bad pointer is the one worth naming.
    if (!(await objectExists(s3Path))) return s3Path;
  }
  return null;
};

/**
 * Attach displayable URLs for the read path.
 *
 * `images` stays the durable contract (pointers); `imageUrls` is a parallel,
 * ephemeral array — `imageUrls[i]` renders `images[i]`, so `imageUrls[0]` is
 * the cover. Clients must never write it back.
 */
const withImageUrls = (product) =>
  product && { ...product, imageUrls: (product.images ?? []).map(resolveS3Url) };

export const createProductService = async (payload) => {
  try {
    const missing = await findMissingImage(payload.images);
    if (missing) {
      return {
        success: false,
        message: `Image "${missing}" was never uploaded — presign and upload it before submitting`,
        statusCode: 400,
      };
    }

    const product = await createProductDal(payload);
    if (!product) {
      return { success: false, message: 'Unable to submit product', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Product submitted — it will appear once an admin approves it',
      statusCode: 201,
      data: withImageUrls(product),
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
    return { success: true, message: 'Product found', statusCode: 200, data: withImageUrls(product) };
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
      data: result.data.map(withImageUrls),
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        totalPages: result.totalPages,
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
    const missing = await findMissingImage(payload.images);
    if (missing) {
      return {
        success: false,
        message: `Image "${missing}" was never uploaded — presign and upload it before saving`,
        statusCode: 400,
      };
    }

    const product = await updateProductDal(productId, payload);
    return {
      success: true,
      message: 'Product updated successfully',
      statusCode: 200,
      data: withImageUrls(product),
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
            approvedByRef: actor?.referenceId ?? null,
            approvedByName: actor?.displayName ?? null,
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
      data: withImageUrls(product),
    };
  } catch (error) {
    logger.error('Error in reviewProductService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
