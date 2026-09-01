import createContextLogger from '../../logger/contextLogger.js';
import {
  createRoomDal,
  deleteRoomDal,
  getAllRoomsDal,
  getRoomByIdDal,
  updateRoomDal,
} from '../../dals/lx/roomDal.js';

const logger = createContextLogger('roomService');

export const createRoomService = async (payload) => {
  try {
    const room = await createRoomDal(payload);
    if (!room) {
      return { success: false, message: 'Unable to create room', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Room created successfully',
      statusCode: 201,
      data: room,
    };
  } catch (error) {
    logger.error('Error in createRoomService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getRoomByIdService = async (roomId) => {
  try {
    const room = await getRoomByIdDal(roomId);
    if (!room) {
      return { success: false, message: 'Room not found', statusCode: 404 };
    }
    return { success: true, message: 'Room found', statusCode: 200, data: room };
  } catch (error) {
    logger.error('Error in getRoomByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllRoomsService = async (query) => {
  try {
    const result = await getAllRoomsDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list rooms', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Rooms fetched successfully',
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
    logger.error('Error in getAllRoomsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateRoomService = async (roomId, payload) => {
  try {
    const existing = await getRoomByIdDal(roomId);
    if (!existing) {
      return { success: false, message: 'Room not found', statusCode: 404 };
    }
    const room = await updateRoomDal(roomId, payload);
    if (!room) {
      return { success: false, message: 'Unable to update room', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Room updated successfully',
      statusCode: 200,
      data: room,
    };
  } catch (error) {
    logger.error('Error in updateRoomService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteRoomService = async (roomId) => {
  try {
    const existing = await getRoomByIdDal(roomId);
    if (!existing) {
      return { success: false, message: 'Room not found', statusCode: 404 };
    }
    const room = await deleteRoomDal(roomId);
    if (!room) {
      return { success: false, message: 'Unable to delete room', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Room deleted successfully',
      statusCode: 200,
      data: room,
    };
  } catch (error) {
    logger.error('Error in deleteRoomService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
