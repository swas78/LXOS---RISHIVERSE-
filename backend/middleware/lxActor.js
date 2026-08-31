// ---------------------------------------------------------------------------
// DEV ACTOR SHIM — LOCAL ONLY. NOT PART OF HANDOFF.
//
// The kit ships no auth, but LX features need to know the acting user (creator,
// approver, role-based views). In RishiVerse the auth layer populates the request
// with the authenticated user; here we simulate that by reading an `x-lx-user-id`
// header (set by the frontend role/user switcher) and loading the matching
// LxUser dev record. Modules only ever read `req.actor` — so at integration this
// single middleware is replaced by the real auth wiring and nothing else changes.
// ---------------------------------------------------------------------------
import prisma from '../services/prismaClient.js';
import createContextLogger from '../logger/contextLogger.js';

const logger = createContextLogger('lxActor');

// A safe fallback actor when no dev user is selected / seeded, so endpoints
// never crash for lack of an actor during local development.
const FALLBACK_ACTOR = {
  id: 'dev-admin',
  name: 'Dev Admin',
  email: 'dev-admin@rishihood.edu.in',
  role: 'ADMIN',
  clubId: null,
  clanId: null,
};

export const resolveActor = async (req, _res, next) => {
  try {
    const headerId = req.header('x-lx-user-id');
    if (headerId) {
      const user = await prisma.lxUser.findFirst({
        where: { id: headerId, isActive: true },
      });
      if (user) {
        req.actor = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clubId: user.clubId,
          clanId: user.clanId,
        };
        return next();
      }
    }
    // Fall back to the first seeded ADMIN, else the static fallback.
    const admin = await prisma.lxUser.findFirst({
      where: { role: 'ADMIN', isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    req.actor = admin
      ? {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          clubId: admin.clubId,
          clanId: admin.clanId,
        }
      : FALLBACK_ACTOR;
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
