// Route guards that enforce the LX RBAC model on req.actor. In the kit the
// actor comes from the dev shim; in RishiVerse the same req.actor is populated
// by real auth, so these guards work unchanged. Mount AFTER resolveActor.
import { hasPermission } from "../helper/lxPermissions.js";

export const requirePermission = (permission) => (req, res, next) => {
    if (!req.actor?.role || !hasPermission(req.actor.role, permission)) {
        return res.status(403).json({
            success: false,
            message: `Forbidden — your role (${req.actor?.role ?? "none"}) lacks permission: ${permission}`,
        });
    }
    return next();
};

export const requireRole =
    (...roles) =>
    (req, res, next) => {
        if (!req.actor?.role || !roles.includes(req.actor.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden — requires role: ${roles.join(" or ")}`,
            });
        }
        return next();
    };
