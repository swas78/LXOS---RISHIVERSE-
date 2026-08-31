import createContextLogger from '../../logger/contextLogger.js';
import { rangesOverlap } from '../../helper/lxHelper.js';
import {
  createEventDal,
  deleteEventDal,
  findRoomConflictCandidatesDal,
  getAllEventsDal,
  getEventByIdDal,
  updateEventDal,
} from '../../dals/lx/eventDal.js';

const logger = createContextLogger('eventService');

// Returns the subset of blocking events whose time range overlaps the request.
const findRoomConflicts = async ({ roomIds, startDate, endDate, excludeEventId }) => {
  const candidates = await findRoomConflictCandidatesDal({ roomIds, excludeEventId });
  return candidates.filter((event) =>
    rangesOverlap(startDate, endDate, event.startDate, event.endDate),
  );
};

export const checkEventAvailabilityService = async ({
  roomIds,
  startDate,
  endDate,
  excludeEventId,
}) => {
  try {
    const conflicts = await findRoomConflicts({ roomIds, startDate, endDate, excludeEventId });
    return {
      success: true,
      message:
        conflicts.length === 0
          ? 'Rooms are available for the selected time'
          : 'Room not available for the selected time',
      statusCode: 200,
      data: { available: conflicts.length === 0, conflicts },
    };
  } catch (error) {
    logger.error('Error in checkEventAvailabilityService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const createEventService = async (payload) => {
  try {
    // If rooms are requested, ensure none are double-booked for the window.
    if (Array.isArray(payload.roomIds) && payload.roomIds.length > 0) {
      const conflicts = await findRoomConflicts({
        roomIds: payload.roomIds,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      if (conflicts.length > 0) {
        return {
          success: false,
          message: 'Room not available for the selected time',
          statusCode: 409,
          conflicts,
        };
      }
    }

    const event = await createEventDal(payload);
    if (!event) {
      return { success: false, message: 'Unable to create event', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Event created successfully',
      statusCode: 201,
      data: event,
    };
  } catch (error) {
    logger.error('Error in createEventService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getEventByIdService = async (eventId) => {
  try {
    const event = await getEventByIdDal(eventId);
    if (!event) {
      return { success: false, message: 'Event not found', statusCode: 404 };
    }
    return { success: true, message: 'Event found', statusCode: 200, data: event };
  } catch (error) {
    logger.error('Error in getEventByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getAllEventsService = async (query) => {
  try {
    const result = await getAllEventsDal(query);
    if (!result) {
      return { success: false, message: 'Unable to list events', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Events fetched successfully',
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
    logger.error('Error in getAllEventsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateEventService = async (eventId, payload) => {
  try {
    const existing = await getEventByIdDal(eventId);
    if (!existing) {
      return { success: false, message: 'Event not found', statusCode: 404 };
    }

    // If the update changes rooms or the time window, re-check availability.
    const roomIds = payload.roomIds ?? existing.roomIds;
    const startDate = payload.startDate ?? existing.startDate;
    const endDate = payload.endDate ?? existing.endDate;
    const touchesSchedule =
      payload.roomIds !== undefined ||
      payload.startDate !== undefined ||
      payload.endDate !== undefined;

    if (touchesSchedule && Array.isArray(roomIds) && roomIds.length > 0) {
      const conflicts = await findRoomConflicts({
        roomIds,
        startDate,
        endDate,
        excludeEventId: eventId,
      });
      if (conflicts.length > 0) {
        return {
          success: false,
          message: 'Room not available for the selected time',
          statusCode: 409,
          conflicts,
        };
      }
    }

    const event = await updateEventDal(eventId, payload);
    if (!event) {
      return { success: false, message: 'Unable to update event', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Event updated successfully',
      statusCode: 200,
      data: event,
    };
  } catch (error) {
    logger.error('Error in updateEventService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteEventService = async (eventId) => {
  try {
    const existing = await getEventByIdDal(eventId);
    if (!existing) {
      return { success: false, message: 'Event not found', statusCode: 404 };
    }
    const event = await deleteEventDal(eventId);
    if (!event) {
      return { success: false, message: 'Unable to delete event', statusCode: 400 };
    }
    return {
      success: true,
      message: 'Event deleted successfully',
      statusCode: 200,
      data: event,
    };
  } catch (error) {
    logger.error('Error in deleteEventService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Approve or reject a pending event. Actor is the reviewing user (req.actor).
export const reviewEventService = async (eventId, { action, rejectionReason, actor }) => {
  try {
    const existing = await getEventByIdDal(eventId);
    if (!existing) {
      return { success: false, message: 'Event not found', statusCode: 404 };
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
            rejectionReason: rejectionReason ?? null,
          };

    const event = await updateEventDal(eventId, data);
    return {
      success: true,
      message: action === 'approve' ? 'Event approved' : 'Event rejected',
      statusCode: 200,
      data: event,
    };
  } catch (error) {
    logger.error('Error in reviewEventService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Mark an event completed. Actor is the user closing it out (req.actor).
export const completeEventService = async (eventId, { actor }) => {
  try {
    const existing = await getEventByIdDal(eventId);
    if (!existing) {
      return { success: false, message: 'Event not found', statusCode: 404 };
    }

    const event = await updateEventDal(eventId, {
      status: 'COMPLETED',
      isCompleted: true,
      completedAt: new Date(),
      completedById: actor?.id ?? null,
    });
    return {
      success: true,
      message: 'Event marked as completed',
      statusCode: 200,
      data: event,
    };
  } catch (error) {
    logger.error('Error in completeEventService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
