import {
  createLostFoundSchema,
  getAllLostFoundSchema,
  resolveLostFoundSchema,
  reviewLostFoundSchema,
  updateLostFoundSchema,
} from '../../validators/lx/lostFoundSchema.js';
import {
  createLostFoundService,
  deleteLostFoundService,
  getAllLostFoundService,
  getLostFoundByIdService,
  resolveLostFoundService,
  reviewLostFoundService,
  updateLostFoundService,
} from '../../services/lx/lostFoundService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

const send = (res, result) =>
  result.success
    ? res.status(result.statusCode).json({
        success: true,
        message: result.message,
        data: result.data,
        ...(result.pagination ? { pagination: result.pagination } : {}),
        ...(result.meta ? { meta: result.meta } : {}),
      })
    : res.status(result.statusCode).json({ success: false, message: result.message });

export const getAllLostFoundController = async (req, res) => {
  try {
    const query = getAllLostFoundSchema.parse(req.query);
    send(res, await getAllLostFoundService(query, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllLostFoundController', req, res);
  }
};

export const getLostFoundByIdController = async (req, res) => {
  try {
    send(res, await getLostFoundByIdService(req.params.itemId, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'getLostFoundByIdController', req, res);
  }
};

export const createLostFoundController = async (req, res) => {
  try {
    const validated = createLostFoundSchema.parse(req.body);
    send(res, await createLostFoundService(validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'createLostFoundController', req, res);
  }
};

export const updateLostFoundController = async (req, res) => {
  try {
    const validated = updateLostFoundSchema.parse(req.body);
    send(res, await updateLostFoundService(req.params.itemId, validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'updateLostFoundController', req, res);
  }
};

export const reviewLostFoundController = async (req, res) => {
  try {
    const validated = reviewLostFoundSchema.parse(req.body);
    send(res, await reviewLostFoundService(req.params.itemId, validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'reviewLostFoundController', req, res);
  }
};

export const resolveLostFoundController = async (req, res) => {
  try {
    const validated = resolveLostFoundSchema.parse(req.body ?? {});
    send(res, await resolveLostFoundService(req.params.itemId, validated, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'resolveLostFoundController', req, res);
  }
};

export const deleteLostFoundController = async (req, res) => {
  try {
    send(res, await deleteLostFoundService(req.params.itemId, req.actor));
  } catch (error) {
    handleControllerErrorResponse(error, 'deleteLostFoundController', req, res);
  }
};
