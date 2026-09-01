import {
  createRoomBookingSchema,
  getAllRoomBookingsSchema,
  reviewRoomBookingSchema,
  roomBookingAvailabilitySchema,
} from '../../validators/lx/roomBookingSchema.js';
import {
  cancelRoomBookingService,
  checkRoomAvailabilityService,
  createRoomBookingService,
  deleteRoomBookingService,
  getAllRoomBookingsService,
  getRoomBookingByIdService,
  reviewRoomBookingService,
} from '../../services/lx/roomBookingService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createRoomBookingController = async (req, res) => {
  try {
    const validatedData = createRoomBookingSchema.parse(req.body);
    const result = await createRoomBookingService(validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        ...(result.conflicts ? { conflicts: result.conflicts } : {}),
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createRoomBookingController', req, res);
  }
};

export const getAllRoomBookingsController = async (req, res) => {
  try {
    const validatedData = getAllRoomBookingsSchema.parse(req.query);
    const result = await getAllRoomBookingsService(validatedData);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllRoomBookingsController', req, res);
  }
};

export const getRoomBookingByIdController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['bookingId'], message: 'bookingId is required in the path' }],
      });
    }
    const result = await getRoomBookingByIdService(bookingId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getRoomBookingByIdController', req, res);
  }
};

export const checkRoomAvailabilityController = async (req, res) => {
  try {
    const validatedData = roomBookingAvailabilitySchema.parse(req.body);
    const result = await checkRoomAvailabilityService(validatedData);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      available: result.data.available,
      conflicts: result.data.conflicts,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'checkRoomAvailabilityController', req, res);
  }
};

// Permission: ADMIN / LX_TEAM (BOOK_ROOM approval). Enforced by RishiVerse.
export const reviewRoomBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['bookingId'], message: 'bookingId is required in the path' }],
      });
    }
    const validatedData = reviewRoomBookingSchema.parse(req.body);
    const result = await reviewRoomBookingService(bookingId, validatedData, req.actor);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        ...(result.conflicts ? { conflicts: result.conflicts } : {}),
      });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'reviewRoomBookingController', req, res);
  }
};

export const cancelRoomBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['bookingId'], message: 'bookingId is required in the path' }],
      });
    }
    const result = await cancelRoomBookingService(bookingId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'cancelRoomBookingController', req, res);
  }
};

export const deleteRoomBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['bookingId'], message: 'bookingId is required in the path' }],
      });
    }
    const result = await deleteRoomBookingService(bookingId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteRoomBookingController', req, res);
  }
};
