import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';
import { LX_EVENT_ACTIVE_STATUSES } from '../../constants/lxEventConstant.js';

const logger = createContextLogger('eventDal');

export const createEventDal = async ({
  title,
  description,
  type,
  clubId,
  clubName,
  clanId,
  clanName,
  startDate,
  endDate,
  roomIds,
  roomNames,
  location,
  requirements,
  budgetAllocated,
  attendees,
  poster,
  status,
  createdById,
  createdByName,
  createdByRole,
}) => {
  try {
    return await prisma.lxEvent.create({
      data: {
        title,
        description,
        type,
        clubId: clubId ?? null,
        clubName: clubName ?? null,
        clanId: clanId ?? null,
        clanName: clanName ?? null,
        startDate,
        endDate,
        roomIds: roomIds ?? [],
        roomNames: roomNames ?? [],
        location: location ?? '',
        requirements: requirements ?? [],
        ...(budgetAllocated !== undefined ? { budgetAllocated } : {}),
        ...(attendees !== undefined ? { attendees } : {}),
        poster: poster ?? null,
        ...(status ? { status } : {}),
        createdById,
        createdByName,
        createdByRole: createdByRole ?? null,
      },
    });
  } catch (error) {
    logger.error('Error in createEventDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getEventByIdDal = async (eventId) => {
  try {
    return await prisma.lxEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getEventByIdDal', {
      error: { message: error.message, stack: error.stack },
      eventId,
    });
    throw error;
  }
};

export const getAllEventsDal = async ({
  search,
  type,
  status,
  clubId,
  clanId,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(Array.isArray(type) && type.length > 0 ? { type: { in: type } } : {}),
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(clubId ? { clubId } : {}),
      ...(clanId ? { clanId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.lxEvent.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxEvent.count({ where }),
    ]);

    return {
      page,
      limit,
      totalRecords: total,
      data: events,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error in getAllEventsDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateEventDal = async (eventId, data) => {
  try {
    return await prisma.lxEvent.update({
      where: { id: eventId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateEventDal', {
      error: { message: error.message, stack: error.stack },
      eventId,
    });
    throw error;
  }
};

export const deleteEventDal = async (eventId) => {
  try {
    return await prisma.lxEvent.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteEventDal', {
      error: { message: error.message, stack: error.stack },
      eventId,
    });
    throw error;
  }
};

// Candidate events that share at least one requested room and are in a
// blocking status. Time-overlap filtering is done in the service (JS) with
// rangesOverlap.
export const findRoomConflictCandidatesDal = async ({ roomIds, excludeEventId }) => {
  try {
    return await prisma.lxEvent.findMany({
      where: {
        deletedAt: null,
        status: { in: LX_EVENT_ACTIVE_STATUSES },
        roomIds: { hasSome: roomIds },
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      },
    });
  } catch (error) {
    logger.error('Error in findRoomConflictCandidatesDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
