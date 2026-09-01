// DEV-ONLY user controller — backs the local role/user switcher + `me`.
// Not part of handoff (RishiVerse supplies the authenticated user).
import { getAllUsersService } from '../../services/lx/userService.js';
import { getRolePermissions } from '../../helper/lxPermissions.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getAllUsersController = async (req, res) => {
  try {
    const result = await getAllUsersService();
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAllUsersController', req, res);
  }
};

// Returns the currently-acting dev user (resolved by the lxActor shim), plus
// the permission list for their role so the frontend can gate UI.
export const getMeController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current actor',
      data: {
        ...req.actor,
        permissions: getRolePermissions(req.actor?.role),
      },
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getMeController', req, res);
  }
};
