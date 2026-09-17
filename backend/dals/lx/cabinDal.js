import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';
import { LIVE_STATUSES, COUNTED_STATUSES } from '../../helper/lxLibrary.js';

const logger = createContextLogger('cabinDal');

const wrap = (name, fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    logger.error(`Error in ${name}`, { error: { message: error.message, stack: error.stack } });
    throw error;
  }
};

// ---- Cabins ---------------------------------------------------------------

export const getAllCabinsDal = wrap('getAllCabinsDal', ({ activeOnly = false } = {}) =>
  prisma.lxCabin.findMany({
    where: { deletedAt: null, ...(activeOnly ? { isActive: true } : {}) },
    orderBy: { code: 'asc' },
  }));

export const getCabinByIdDal = wrap('getCabinByIdDal', (id) =>
  prisma.lxCabin.findFirst({ where: { id, deletedAt: null } }));

export const createCabinDal = wrap('createCabinDal', (data) =>
  prisma.lxCabin.create({ data }));

export const updateCabinDal = wrap('updateCabinDal', (id, data) =>
  prisma.lxCabin.update({ where: { id }, data }));

// Soft delete — reads filter on deletedAt, so history survives.
export const softDeleteCabinDal = wrap('softDeleteCabinDal', (id) =>
  prisma.lxCabin.update({ where: { id }, data: { deletedAt: new Date() } }));

export const countLiveBookingsForCabinDal = wrap('countLiveBookingsForCabinDal', (cabinId) =>
  prisma.lxCabinBooking.count({
    where: { cabinId, deletedAt: null, status: { in: LIVE_STATUSES } },
  }));

// ---- Bookings -------------------------------------------------------------

export const getBookingsForDateDal = wrap('getBookingsForDateDal', (date) =>
  prisma.lxCabinBooking.findMany({
    where: { date, deletedAt: null },
    orderBy: { startAt: 'asc' },
  }));

export const getBookingsForMemberDal = wrap('getBookingsForMemberDal', (bookedByRef, date) =>
  prisma.lxCabinBooking.findMany({
    where: { bookedByRef, date, deletedAt: null },
    orderBy: { startAt: 'asc' },
  }));

export const getBookingByIdDal = wrap('getBookingByIdDal', (id) =>
  prisma.lxCabinBooking.findFirst({ where: { id, deletedAt: null } }));

export const createBookingDal = wrap('createBookingDal', (data) =>
  prisma.lxCabinBooking.create({ data }));

export const updateBookingDal = wrap('updateBookingDal', (id, data) =>
  prisma.lxCabinBooking.update({ where: { id }, data }));

/** How many of today's allowance a student has already used. */
export const countBookingsTodayDal = wrap('countBookingsTodayDal', (bookedByRef, date) =>
  prisma.lxCabinBooking.count({
    where: { bookedByRef, date, deletedAt: null, status: { in: COUNTED_STATUSES } },
  }));

/**
 * Anyone in `refs` who already holds a live booking in this slot — as owner OR
 * as a group member. Nobody can be in two cabins at the same hour.
 *
 * `groupMembers` is Json, so the member half is matched with a raw containment
 * query; Prisma's Json filters cannot express "array contains an object with
 * this key" portably.
 */
export const findSlotClashForRefsDal = wrap('findSlotClashForRefsDal', async (refs, date, slotStart) => {
  if (!refs?.length) return null;

  const owner = await prisma.lxCabinBooking.findFirst({
    where: {
      date,
      slotStart,
      deletedAt: null,
      status: { in: LIVE_STATUSES },
      bookedByRef: { in: refs },
    },
  });
  if (owner) return owner;

  const asMember = await prisma.$queryRaw`
    SELECT id, "bookedByRef", "cabinName"
    FROM lx_cabin_bookings
    WHERE date = ${date}
      AND "slotStart" = ${slotStart}
      AND "deletedAt" IS NULL
      AND status IN ('BOOKED', 'CHECKED_IN')
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements("groupMembers"::jsonb) AS m
        WHERE m->>'referenceId' = ANY(${refs}::text[])
      )
    LIMIT 1
  `;
  return asMember?.[0] ?? null;
});

/** Live bookings whose hour has ended — settled to COMPLETED. */
export const findFinishedSessionsDal = wrap('findFinishedSessionsDal', (now) =>
  prisma.lxCabinBooking.findMany({
    where: { status: 'CHECKED_IN', endAt: { lte: now }, deletedAt: null },
    select: { id: true },
  }));

/** Bookings whose slot has started and are still waiting for a check-in. */
export const findPendingCheckInsDal = wrap('findPendingCheckInsDal', (now) =>
  prisma.lxCabinBooking.findMany({
    where: { status: 'BOOKED', startAt: { lte: now }, deletedAt: null },
  }));

export const completeSessionsDal = wrap('completeSessionsDal', (ids, now) =>
  prisma.lxCabinBooking.updateMany({
    where: { id: { in: ids } },
    data: { status: 'COMPLETED', checkedOutAt: now, slotKey: null },
  }));

/**
 * Settle one booking as a no-show. Guarded on `status: 'BOOKED'` so two
 * concurrent settle passes cannot both fire; the loser updates zero rows.
 */
export const markNoShowDal = wrap('markNoShowDal', (id, now) =>
  prisma.lxCabinBooking.updateMany({
    where: { id, status: 'BOOKED' },
    data: { status: 'NO_SHOW', markedNoShowAt: now, slotKey: null },
  }));

/** Cancellations per person over a rolling window, for the desk watchlist. */
export const findFrequentCancellersDal = wrap('findFrequentCancellersDal', (since, threshold) =>
  prisma.lxCabinBooking.groupBy({
    by: ['bookedByRef'],
    where: { status: 'CANCELLED', cancelledAt: { gte: since }, deletedAt: null },
    _count: { _all: true },
    having: { bookedByRef: { _count: { gte: threshold } } },
    orderBy: { _count: { bookedByRef: 'desc' } },
    take: 10,
  }));

// ---- Blocks ---------------------------------------------------------------

/** The live block on a person, if any. */
export const findActiveBlockDal = wrap('findActiveBlockDal', (memberRef, now = new Date()) =>
  prisma.lxCabinBlock.findFirst({
    where: {
      memberRef,
      liftedAt: null,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: 'desc' },
  }));

/** Live blocks for a set of people, in one query (group-member validation). */
export const findActiveBlocksForRefsDal = wrap('findActiveBlocksForRefsDal', (refs, now = new Date()) =>
  prisma.lxCabinBlock.findMany({
    where: {
      memberRef: { in: refs },
      liftedAt: null,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  }));

export const listActiveBlocksDal = wrap('listActiveBlocksDal', (now = new Date()) =>
  prisma.lxCabinBlock.findMany({
    where: { liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { createdAt: 'desc' },
    take: 100,
  }));

export const createBlockDal = wrap('createBlockDal', (data) =>
  prisma.lxCabinBlock.create({ data }));

export const findBlockByBookingDal = wrap('findBlockByBookingDal', (bookingId) =>
  prisma.lxCabinBlock.findUnique({ where: { bookingId } }));

export const getBlockByIdDal = wrap('getBlockByIdDal', (id) =>
  prisma.lxCabinBlock.findUnique({ where: { id } }));

export const liftBlockDal = wrap('liftBlockDal', (id, { liftedByRef, liftReason }) =>
  prisma.lxCabinBlock.update({
    where: { id },
    data: { liftedAt: new Date(), liftedByRef, liftReason },
  }));

// ---- Directory (kit stand-in for core User/Student/Employee) ---------------

/**
 * Typeahead over the LX membership. At handoff this becomes a query against
 * core `User` joined to `Student`, filtered to STUDENT — see identityService.
 */
export const searchDirectoryDal = wrap('searchDirectoryDal', (query, excludeRef, take = 8) =>
  prisma.lxMember.findMany({
    where: {
      isActive: true,
      referenceId: { not: excludeRef },
      OR: [
        { displayName: { contains: query, mode: 'insensitive' } },
        { referenceId: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { referenceId: true, displayName: true, email: true },
    orderBy: { displayName: 'asc' },
    take,
  }));

export const findMembersByRefsDal = wrap('findMembersByRefsDal', (refs) =>
  prisma.lxMember.findMany({
    where: { referenceId: { in: refs } },
    select: { referenceId: true, displayName: true, email: true },
  }));

export const getMemberByRefDal = wrap('getMemberByRefDal', (referenceId) =>
  prisma.lxMember.findUnique({ where: { referenceId } }));

export const saveContactPhoneDal = wrap('saveContactPhoneDal', (referenceId, contactPhone) =>
  prisma.lxMember.update({ where: { referenceId }, data: { contactPhone } }));
