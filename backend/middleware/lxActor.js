// ---------------------------------------------------------------------------
// DEV ACTOR SHIM — LOCAL ONLY. NOT PART OF HANDOFF.
//
// This kit ships no auth, but LX features need to know who is acting (creator,
// approver, role-scoped views). This middleware fabricates what RishiVerse's
// `authenticate` middleware will provide for real.
//
// THE SEAM
// --------
// Everything downstream reads ONLY `req.actor`. Replacing this one file with
// the real wiring is the entire auth integration:
//
//   // production
//   router.use(authenticate);          // core: sets req.user from the JWT
//   router.use(resolveLxActor);        // maps req.user -> req.actor (below)
//
// In production `resolveLxActor` becomes:
//
//   const referenceId = req.user?.referenceId;
//   if (!referenceId) return unauthorized(res);           // 401
//   const member = await prisma.lxMember.findUnique({ where: { referenceId } });
//   req.actor = {
//     referenceId,
//     coreUserId: req.user.userId,
//     coreRole:   req.user.userType,       // STUDENT | EMPLOYEE | ADMIN | …
//     role:       member?.role ?? 'GUEST', // LxMemberRole — NOT coreRole
//     clubId:     member?.clubId ?? null,
//     clanId:     member?.clanId ?? null,
//   };
//
// `coreRole` and `role` are deliberately separate: a campus ADMIN is not
// automatically an LX ADMIN (lxos-core-pack/permissions.md).
//
// In the kit the referenceId arrives in an `x-lx-actor-ref` header set by the
// frontend RoleSwitcher. That header is trusted ONLY because nothing here is
// authenticated — it must never survive into production.
// ---------------------------------------------------------------------------
import { findFallbackAdminDal, findMemberByReferenceIdDal } from '../dals/lx/memberDal.js';
import createContextLogger from '../logger/contextLogger.js';

const logger = createContextLogger('lxActor');

// Header carrying the impersonated core `User.referenceId`. Dev-only.
export const ACTOR_HEADER = 'x-lx-actor-ref';

// A safe fallback so endpoints never crash for lack of an actor locally.
const FALLBACK_ACTOR = {
  referenceId: 'DEV-ADMIN',
  coreUserId: null,
  coreRole: null,
  role: 'ADMIN',
  clubId: null,
  clanId: null,
  displayName: 'Dev Admin',
};

const toActor = (member) => ({
  referenceId: member.referenceId,
  // Null in the kit: core owns User.userId and User.userType. Production fills
  // both from req.user so downstream code can tell core identity from LX role.
  coreUserId: null,
  coreRole: null,
  role: member.role,
  clubId: member.clubId,
  clanId: member.clanId,
  // DEV-SHIM ONLY — production resolves names via services/lx/identityService.js.
  displayName: member.displayName ?? member.referenceId,
});

export const resolveActor = async (req, _res, next) => {
  try {
    const ref = req.header(ACTOR_HEADER);
    if (ref) {
      const member = await findMemberByReferenceIdDal(ref);
      if (member) {
        req.actor = toActor(member);
        return next();
      }
    }

    // No/unknown header: fall back to the first seeded ADMIN so the kit is
    // usable straight after `npm run seed`.
    const admin = await findFallbackAdminDal();
    req.actor = admin ? toActor(admin) : FALLBACK_ACTOR;
    return next();
  } catch (error) {
    logger.warn('resolveActor failed; using fallback actor', {
      error: { message: error.message },
    });
    req.actor = FALLBACK_ACTOR;
    return next();
  }
};

export default resolveActor;
