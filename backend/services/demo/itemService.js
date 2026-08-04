import createContextLogger from '../../logger/contextLogger.js';
import {
  createItemDal,
  deleteItemDal,
  getAllItemsDal,
  getItemByIdDal,
  updateItemDal,
} from '../../dals/demo/itemDal.js';

const logger = createContextLogger('itemService');

export const createItemService = async (payload) => {
  try {
    const item = await createItemDal(payload);
    if (!item) {
      return { success: false, message: 'Unable to create item', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Item created successfully',
      statusCode: 201,
      data: item,
    };
  } catch (error) {
    logger.error('Error in createItemService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getItemByIdService = async (itemId) => {
  try {
    const item = await getItemByIdDal(itemId);
    if (!item) {
      return { success: false, message: 'Item not found', statusCode: 404 };
    }
    return {
      success: true,
      message: 'Item found',
      statusCode: 200,
      data: item,
    };
  } catch (error) {
    logger.error('Error in getItemByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllItemsService = async (query) => {
  try {
    const result = await getAllItemsDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list items', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Items fetched successfully',
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
    logger.error('Error in getAllItemsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateItemService = async (itemId, payload) => {
  try {
    const existing = await getItemByIdDal(itemId);
    if (!existing) {
      return { success: false, message: 'Item not found', statusCode: 404 };
    }

    const item = await updateItemDal(itemId, payload);
    if (!item) {
      return { success: false, message: 'Unable to update item', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Item updated successfully',
      statusCode: 200,
      data: item,
    };
  } catch (error) {
    logger.error('Error in updateItemService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteItemService = async (itemId) => {
  try {
    const existing = await getItemByIdDal(itemId);
    if (!existing) {
      return { success: false, message: 'Item not found', statusCode: 404 };
    }

    const item = await deleteItemDal(itemId);
    if (!item) {
      return { success: false, message: 'Unable to delete item', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Item deleted successfully',
      statusCode: 200,
      data: item,
    };
  } catch (error) {
    logger.error('Error in deleteItemService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
