import createContextLogger from '../../logger/contextLogger.js';
import {
  createFileDal,
  deleteFileDal,
  getAllFilesDal,
  getFileByIdDal,
  updateFileDal,
} from '../../dals/lx/fileDal.js';

const logger = createContextLogger('fileService');

export const createFileService = async (payload) => {
  try {
    const file = await createFileDal(payload);
    if (!file) {
      return { success: false, message: 'Unable to create file record', statusCode: 400 };
    }
    return {
      success: true,
      message: 'File record created successfully',
      statusCode: 201,
      data: file,
    };
  } catch (error) {
    logger.error('Error in createFileService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getFileByIdService = async (fileId) => {
  try {
    const file = await getFileByIdDal(fileId);
    if (!file) {
      return { success: false, message: 'File not found', statusCode: 404 };
    }
    return { success: true, message: 'File found', statusCode: 200, data: file };
  } catch (error) {
    logger.error('Error in getFileByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllFilesService = async (query) => {
  try {
    const result = await getAllFilesDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list files', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Files fetched successfully',
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
    logger.error('Error in getAllFilesService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateFileService = async (fileId, payload) => {
  try {
    const existing = await getFileByIdDal(fileId);
    if (!existing) {
      return { success: false, message: 'File not found', statusCode: 404 };
    }
    const file = await updateFileDal(fileId, payload);
    if (!file) {
      return { success: false, message: 'Unable to update file record', statusCode: 400 };
    }
    return {
      success: true,
      message: 'File record updated successfully',
      statusCode: 200,
      data: file,
    };
  } catch (error) {
    logger.error('Error in updateFileService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteFileService = async (fileId) => {
  try {
    const existing = await getFileByIdDal(fileId);
    if (!existing) {
      return { success: false, message: 'File not found', statusCode: 404 };
    }
    const file = await deleteFileDal(fileId);
    if (!file) {
      return { success: false, message: 'Unable to delete file record', statusCode: 400 };
    }
    return {
      success: true,
      message: 'File record deleted successfully',
      statusCode: 200,
      data: file,
    };
  } catch (error) {
    logger.error('Error in deleteFileService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
