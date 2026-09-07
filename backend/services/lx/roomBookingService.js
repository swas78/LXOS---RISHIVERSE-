import createContextLogger from '../../logger/contextLogger.js';
import {
  createRoomBookingDal,
  deleteRoomBookingDal,
  findConflictingBookingsDal,
  getAllRoomBookingsDal,
  getRoomBookingByIdDal,
  updateRoomBookingDal,
} from '../../dals/lx/roomBookingDal.js';

const logger = createContextLogger('roomBookingService');

export const checkRoomAvailabilityService = async ({
  roomId,
  startTime,
  endTime,
  excludeBookingId,
}) => {
  try {
    const conflicts = await findConflictingBookingsDal({
      roomId,
      startTime,
      endTime,
      excludeBookingId,
    });
    return {
      success: true,
      message: conflicts.length === 0 ? 'Room is available' : 'Room is not available',
      statusCode: 200,
      data: { available: conflicts.length === 0, conflicts },
    };
  } catch (error) {
    logger.error('Error in checkRoomAvailabilityService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const createRoomBookingService = async (payload, actor) => {
  try {
    // Prevent double-booking: no overlapping active booking may exist.
    const conflicts = await findConflictingBookingsDal({
      roomId: payload.roomId,
      startTime: payload.startTime,
      endTime: payload.endTime,
    });
    if (conflicts.length > 0) {
      return {
        success: false,
        message: 'Room is not available for the selected time',
        statusCode: 409,
        conflicts,
      };
    }

    const booking = await createRoomBookingDal({
      roomId: payload.roomId,
      roomName: payload.roomName ?? null,
      eventId: payload.eventId ?? null,
      eventTitle: payload.eventTitle ?? null,
      title: payload.title,
      purpose: payload.purpose ?? '',
      startTime: payload.startTime,
      endTime: payload.endTime,
      requestedByRef: actor?.referenceId ?? 'unknown',
      requestedByName: actor?.displayName ?? null,
    });

    return {
      success: true,
      message: 'Room booking requested successfully',
      statusCode: 201,
      data: booking,
    };
  } catch (error) {
    logger.error('Error in createRoomBookingService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getRoomBookingByIdService = async (bookingId) => {
  try {
    const booking = await getRoomBookingByIdDal(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found', statusCode: 404 };
    }
    return { success: true, message: 'Booking found', statusCode: 200, data: booking };
  } catch (error) {
    logger.error('Error in getRoomBookingByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllRoomBookingsService = async (query) => {
  try {
    const result = await getAllRoomBookingsDal(query);
    return {
      success: true,
      message: 'Bookings fetched successfully',
      statusCode: 200,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (error) {
    logger.error('Error in getAllRoomBookingsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const reviewRoomBookingService = async (bookingId, { action, rejectionReason }, actor) => {
  try {
    const existing = await getRoomBookingByIdDal(bookingId);
    if (!existing) {
      return { success: false, message: 'Booking not found', statusCode: 404 };
    }
    if (action === 'approve') {
      // Re-check conflicts against other APPROVED/PENDING bookings before approving.
      const conflicts = await findConflictingBookingsDal({
        roomId: existing.roomId,
        startTime: existing.startTime,
        endTime: existing.endTime,
        excludeBookingId: existing.id,
      });
      if (conflicts.some((c) => c.status === 'APPROVED')) {
        return {
          success: false,
          message: 'Cannot approve — the room is already booked for this time',
          statusCode: 409,
          conflicts,
        };
      }
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
        : { status: 'REJECTED', rejectionReason: rejectionReason || 'Rejected' };
    const booking = await updateRoomBookingDal(bookingId, data);
    return {
      success: true,
      message: `Booking ${action}d successfully`,
      statusCode: 200,
      data: booking,
    };
  } catch (error) {
    logger.error('Error in reviewRoomBookingService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const cancelRoomBookingService = async (bookingId) => {
  try {
    const existing = await getRoomBookingByIdDal(bookingId);
    if (!existing) {
      return { success: false, message: 'Booking not found', statusCode: 404 };
    }
    const booking = await updateRoomBookingDal(bookingId, { status: 'CANCELLED' });
    return { success: true, message: 'Booking cancelled', statusCode: 200, data: booking };
  } catch (error) {
    logger.error('Error in cancelRoomBookingService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteRoomBookingService = async (bookingId) => {
  try {
    const existing = await getRoomBookingByIdDal(bookingId);
    if (!existing) {
      return { success: false, message: 'Booking not found', statusCode: 404 };
    }
    const booking = await deleteRoomBookingDal(bookingId);
    return { success: true, message: 'Booking deleted', statusCode: 200, data: booking };
  } catch (error) {
    logger.error('Error in deleteRoomBookingService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
