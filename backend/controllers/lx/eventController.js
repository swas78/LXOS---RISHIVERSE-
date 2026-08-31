import {
  approveEventSchema,
  availabilitySchema,
  createEventSchema,
  getAllEventsSchema,
  updateEventSchema,
} from '../../validators/lx/eventSchema.js';
import { LX_EVENT_EDITABLE_FIELDS } from '../../constants/lxEventConstant.js';
import { actorSnapshot } from '../../helper/lxHelper.js';
import {
  checkEventAvailabilityService,
  completeEventService,
  createEventService,
  deleteEventService,
  getAllEventsService,
  getEventByIdService,
  reviewEventService,
  updateEventService,
} from '../../services/lx/eventService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createEventController = async (req, res) => {
  try {
    const validatedData = createEventSchema.parse(req.body);

    // Type-driven ownership: CLUB events belong to a club, CLAN events to a clan.
    if (validatedData.type === 'CLUB' && !validatedData.clubId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clubId'], message: 'clubId is required for CLUB events' }],
      });
    }
    if (validatedData.type === 'CLAN' && !validatedData.clanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['clanId'], message: 'clanId is required for CLAN events' }],
      });
    }

    // endDate must not precede startDate.
    if (validatedData.endDate < validatedData.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['endDate'], message: 'endDate must be on or after startDate' }],
      });
    }

    // Snapshot creator (createdById / createdByName / createdByRole match schema).
    const payload = { ...validatedData, ...actorSnapshot(req.actor) };

    const result = await createEventService(payload);
    if (!result.success) {
      // Room double-booking surfaces the conflicting events for the client.
      if (result.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: result.message,
          conflicts: result.conflicts ?? [],
        });
      }
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'createEventController', req, res);
  }
};

export const getAllEventsController = async (req, res) => {
  try {
    const validatedData = getAllEventsSchema.parse(req.query);
    const result = await getAllEventsService(validatedData);
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
    handleControllerErrorResponse(error, 'getAllEventsController', req, res);
  }
};

export const getEventByIdController = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['eventId'], message: 'eventId is required in the path' }],
      });
    }
    const result = await getEventByIdService(eventId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getEventByIdController', req, res);
  }
};

export const updateEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['eventId'], message: 'eventId is required in the path' }],
      });
    }

    const validatedData = updateEventSchema.parse(req.body);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { path: LX_EVENT_EDITABLE_FIELDS, message: 'At least one field is required to update' },
        ],
      });
    }

    // If both dates are supplied, keep the ordering invariant.
    if (
      validatedData.startDate !== undefined &&
      validatedData.endDate !== undefined &&
      validatedData.endDate < validatedData.startDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['endDate'], message: 'endDate must be on or after startDate' }],
      });
    }

    const result = await updateEventService(eventId, validatedData);
    if (!result.success) {
      if (result.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: result.message,
          conflicts: result.conflicts ?? [],
        });
      }
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'updateEventController', req, res);
  }
};

export const deleteEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['eventId'], message: 'eventId is required in the path' }],
      });
    }
    const result = await deleteEventService(eventId);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteEventController', req, res);
  }
};

export const checkAvailabilityController = async (req, res) => {
  try {
    const validatedData = availabilitySchema.parse(req.body);

    if (validatedData.endDate < validatedData.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['endDate'], message: 'endDate must be on or after startDate' }],
      });
    }

    const result = await checkEventAvailabilityService(validatedData);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      available: result.data.available,
      conflicts: result.data.conflicts,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'checkAvailabilityController', req, res);
  }
};

// Approve / reject an event. Intended for ADMIN / LX_TEAM roles; the kit ships
// no auth layer, so the action is performed for any actor. Role enforcement is
// added when the real auth middleware replaces the dev actor shim.
export const approveEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['eventId'], message: 'eventId is required in the path' }],
      });
    }

    const { action, rejectionReason } = approveEventSchema.parse(req.body);

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['rejectionReason'], message: 'rejectionReason is required to reject' }],
      });
    }

    const result = await reviewEventService(eventId, {
      action,
      rejectionReason,
      actor: req.actor,
    });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'approveEventController', req, res);
  }
};

// Mark an event completed. Intended for ADMIN / LX_TEAM / owning head; no auth
// enforcement here (kit ships none) — enforced at integration.
export const completeEventController = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ path: ['eventId'], message: 'eventId is required in the path' }],
      });
    }

    const result = await completeEventService(eventId, { actor: req.actor });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'completeEventController', req, res);
  }
};
