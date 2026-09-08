// DEV UPLOAD SHIM controller — see services/lx/uploadService.js for why this
// exists and what replaces it at handoff.
import { presignedUrlSchema } from '../../validators/lx/uploadSchema.js';
import {
  createPresignedUrlService,
  getObjectService,
  putObjectService,
} from '../../services/lx/uploadService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const createPresignedUrlController = async (req, res) => {
  try {
    const validated = presignedUrlSchema.parse(req.body);
    const result = await createPresignedUrlService(validated);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    // Core returns these at the top level (not nested under `data`), so the
    // frontend upload client works unchanged against either server.
    return res.status(200).json({
      success: true,
      message: result.message,
      ...result.data,
    });
  } catch (error) {
    return handleControllerErrorResponse(error, 'createPresignedUrlController', req, res);
  }
};

export const putObjectController = async (req, res) => {
  try {
    const result = await putObjectService({
      key: req.params.key,
      body: req.body,
      contentType: req.header('content-type') ?? 'application/octet-stream',
    });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return handleControllerErrorResponse(error, 'putObjectController', req, res);
  }
};

export const getObjectController = async (req, res) => {
  try {
    const result = await getObjectService(req.params.key);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    res.setHeader('Content-Type', result.data.contentType);
    // Dev-only cache hint; production GETs are short-lived signed S3 URLs.
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).send(result.data.body);
  } catch (error) {
    return handleControllerErrorResponse(error, 'getObjectController', req, res);
  }
};

export default { createPresignedUrlController, putObjectController, getObjectController };
