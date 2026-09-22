import {
  actOnCabinBookingService,
  createCabinBookingService,
  getCabinBoardService,
  getDeskBoardService,
  listCabinBookingsService,
  searchDirectoryService,
} from '../../services/lx/cabinBookingService.js';
import {
  createBlockService,
  createCabinService,
  liftBlockService,
  listBlocksService,
  listCabinsService,
  removeCabinService,
  updateCabinService,
} from '../../services/lx/cabinAdminService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

// Every service here already returns { success, message, statusCode, data },
// so the controllers stay a thin translation to HTTP.
const send = (res, result) =>
  result.success
    ? res.status(result.statusCode).json({
        success: true,
        message: result.message,
        data: result.data,
      })
    : res.status(result.statusCode).json({
        success: false,
        message: result.message,
        ...(result.reason ? { reason: result.reason } : {}),
      });

// ---- Booking board (everyone) ---------------------------------------------

export const getCabinBoardController = async (req, res) => {
  try {
    const query = req.query;
    send(res, await getCabinBoardService(req.actor, query));
  } catch (error) {
    handleControllerErrorResponse(error, 'getCabinBoardController', req, res);
  }
};

export const createCabinBookingController = async (req, res) => {
  try {
    const validated = req.body;
    send(res, await createCabinBookingService(validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'createCabinBookingController', req, res);
  }
};

export const listCabinBookingsController = async (req, res) => {
  try {
    const query = req.query;
    send(res, await listCabinBookingsService(req.actor, query));
  } catch (error) {
    handleControllerErrorResponse(error, 'listCabinBookingsController', req, res);
  }
};

export const actOnCabinBookingController = async (req, res) => {
  try {
    const { action } = req.body;
    send(res, await actOnCabinBookingService(req.params.bookingId, action, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'actOnCabinBookingController', req, res);
  }
};

export const searchDirectoryController = async (req, res) => {
  try {
    const { q } = req.query;
    send(res, await searchDirectoryService(req.actor, q));
  } catch (error) {
    handleControllerErrorResponse(error, 'searchDirectoryController', req, res);
  }
};

// ---- Desk board + cabin admin (librarian) ---------------------------------

export const getDeskBoardController = async (req, res) => {
  try {
    const query = req.query;
    send(res, await getDeskBoardService(req.actor, query));
  } catch (error) {
    handleControllerErrorResponse(error, 'getDeskBoardController', req, res);
  }
};

export const listCabinsController = async (req, res) => {
  try {
    send(res, await listCabinsService());
  } catch (error) {
    handleControllerErrorResponse(error, 'listCabinsController', req, res);
  }
};

export const createCabinController = async (req, res) => {
  try {
    const validated = req.body;
    send(res, await createCabinService(validated));
  } catch (error) {
    handleControllerErrorResponse(error, 'createCabinController', req, res);
  }
};

export const updateCabinController = async (req, res) => {
  try {
    const validated = req.body;
    send(res, await updateCabinService(req.params.cabinId, validated));
  } catch (error) {
    handleControllerErrorResponse(error, 'updateCabinController', req, res);
  }
};

export const removeCabinController = async (req, res) => {
  try {
    send(res, await removeCabinService(req.params.cabinId));
  } catch (error) {
    handleControllerErrorResponse(error, 'removeCabinController', req, res);
  }
};

// ---- Blocks (librarian) ----------------------------------------------------

export const listBlocksController = async (req, res) => {
  try {
    send(res, await listBlocksService());
  } catch (error) {
    handleControllerErrorResponse(error, 'listBlocksController', req, res);
  }
};

export const createBlockController = async (req, res) => {
  try {
    const validated = req.body;
    send(res, await createBlockService(validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'createBlockController', req, res);
  }
};

export const liftBlockController = async (req, res) => {
  try {
    const validated = req.body;
    send(res, await liftBlockService(req.params.blockId, validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'liftBlockController', req, res);
  }
};
