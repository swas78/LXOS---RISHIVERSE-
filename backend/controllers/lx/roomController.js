import { LX_ROOM_EDITABLE_FIELDS } from '../../constants/lxRoomConstant.js';
import {
  createRoomService,
  deleteRoomService,
  getAllRoomsService,
  getRoomByIdService,
  updateRoomService,
} from '../../services/lx/roomService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createRoomController = async (req, res) => {
  try {
    const validatedData = req.body;
    const result = await createRoomService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createRoomController', req, res);
  }
};

export const getAllRoomsController = async (req, res) => {
  try {
    const validatedData = req.query;
    const result = await getAllRoomsService(validatedData);
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
    handleControllerErrorResponse(error, 'getAllRoomsController', req, res);
  }
};

export const getRoomByIdController = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['roomId'], message: 'roomId is required in the path' }],
      });
    }
    const result = await getRoomByIdService(roomId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getRoomByIdController', req, res);
  }
};

export const updateRoomController = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['roomId'], message: 'roomId is required in the path' }],
      });
    }

    const validatedData = req.body;
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_ROOM_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    const result = await updateRoomService(roomId, validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateRoomController', req, res);
  }
};

export const deleteRoomController = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['roomId'], message: 'roomId is required in the path' }],
      });
    }
    const result = await deleteRoomService(roomId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteRoomController', req, res);
  }
};
