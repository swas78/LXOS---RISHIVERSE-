import createContextLogger from '../../logger/contextLogger.js';
import {
  createUserDal,
  findUserByEmailDal,
  findUserByReferenceIdDal,
  findUserByIdDal,
  getAccessOverviewDal,
  updateUserAccessDal,
} from '../../dals/lx/accessDal.js';

const logger = createContextLogger('accessService');

const PROTECTED = ['ADMIN', 'FINANCE'];

// Derive a fallback role from a user's remaining linkage (used after removals).
function roleFromLinkage(user) {
  if (user.clubId) return 'CLUB_HEAD';
  if (user.clanId) return 'CLAN_HEAD';
  return 'GUEST';
}

export const getAccessOverviewService = async () => {
  try {
    const { clubs, clans, users } = await getAccessOverviewDal();
    const headsFor = (key, id) =>
      users
        .filter((u) => u[key] === id)
        .map((u) => ({ id: u.id, referenceId: u.referenceId, displayName: u.displayName, email: u.email }));

    return {
      success: true,
      message: 'Access overview',
      statusCode: 200,
      data: {
        clubs: clubs.map((c) => ({ ...c, heads: headsFor('clubId', c.id) })),
        clans: clans.map((c) => ({ ...c, heads: headsFor('clanId', c.id) })),
        admins: users.filter((u) => u.role === 'ADMIN'),
        lxMembers: users.filter((u) => u.role === 'LX_TEAM'),
        financeMembers: users.filter((u) => u.role === 'FINANCE'),
        users,
      },
    };
  } catch (error) {
    logger.error('Error in getAccessOverviewService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const assignAccessService = async ({
  memberId,
  referenceId,
  email,
  displayName,
  type,
  clubId,
  clanId,
}) => {
  try {
    // Resolution order runs most-specific first: an existing LxMember row, then
    // the core identity key, then the dev-only email fallback.
    let user = null;
    if (memberId) {
      user = await findUserByIdDal(memberId);
    } else if (referenceId) {
      const ref = referenceId.trim();
      user = await findUserByReferenceIdDal(ref);
      // Granting a role to someone with no LX overlay yet creates that overlay.
      // In production the person already exists in core; this row only records
      // what they may do inside LX.
      if (!user) {
        user = await createUserDal({
          referenceId: ref,
          displayName: displayName || ref,
          email: email ?? null,
          role: 'GUEST',
        });
      }
    } else if (email) {
      user = await findUserByEmailDal(email);
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          message: `No member with email ${email}. Provide a referenceId (enrollment or employee id) to add them.`,
        };
      }
    }
    if (!user) return { success: false, message: 'Member not found', statusCode: 404 };

    const data = {};
    switch (type) {
      case 'admin':
        data.role = 'ADMIN';
        break;
      case 'lx':
        data.role = 'LX_TEAM';
        break;
      case 'finance':
        data.role = 'FINANCE';
        break;
      case 'club':
        data.clubId = clubId;
        if (!PROTECTED.includes(user.role) && user.role !== 'LX_TEAM') data.role = 'CLUB_HEAD';
        break;
      case 'clan':
        data.clanId = clanId;
        if (!PROTECTED.includes(user.role) && user.role !== 'LX_TEAM' && user.role !== 'CLUB_HEAD')
          data.role = 'CLAN_HEAD';
        break;
      case 'guest':
        data.role = 'GUEST';
        data.clubId = null;
        data.clanId = null;
        break;
      default:
        return { success: false, message: `Invalid type: ${type}`, statusCode: 400 };
    }

    const updated = await updateUserAccessDal(user.id, data);
    return { success: true, message: 'Access updated', statusCode: 200, data: updated };
  } catch (error) {
    logger.error('Error in assignAccessService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const removeAccessService = async ({ memberId, type }) => {
  try {
    const user = await findUserByIdDal(memberId);
    if (!user) return { success: false, message: 'User not found', statusCode: 404 };

    const next = { ...user };
    const data = {};
    if (type === 'club') {
      data.clubId = null;
      next.clubId = null;
      data.role = roleFromLinkage(next);
    } else if (type === 'clan') {
      data.clanId = null;
      next.clanId = null;
      data.role = roleFromLinkage(next);
    } else if (type === 'lx') {
      if (user.role === 'LX_TEAM') data.role = roleFromLinkage(user);
    } else if (type === 'finance') {
      if (user.role === 'FINANCE') data.role = roleFromLinkage(user);
    } else if (type === 'admin') {
      if (user.role === 'ADMIN') data.role = roleFromLinkage(user);
    }

    const updated = await updateUserAccessDal(user.id, data);
    return { success: true, message: 'Access removed', statusCode: 200, data: updated };
  } catch (error) {
    logger.error('Error in removeAccessService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
