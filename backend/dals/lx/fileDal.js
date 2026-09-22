import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('fileDal');

export const createFileDal = async ({
  fileKey,
  originalName,
  mimeType,
  size,
  type,
  tags,
  eventId,
  clubId,
  semester,
  description,
  uploadedByRef,
  uploadedByName,
}) => {
  try {
    return await prisma.lxFile.create({
      data: {
        fileKey,
        originalName,
        mimeType: mimeType ?? null,
        ...(size !== undefined ? { size } : {}),
        ...(type ? { type } : {}),
        ...(tags ? { tags } : {}),
        eventId: eventId ?? null,
        clubId: clubId ?? null,
        ...(semester ? { semester } : {}),
        description: description ?? null,
        uploadedByRef,
        uploadedByName,
      },
    });
  } catch (error) {
    logger.error('Error in createFileDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getFileByIdDal = async (fileId) => {
  try {
    return await prisma.lxFile.findFirst({
      where: { id: fileId, deletedAt: null },
    });
  } catch (error) {
    logger.error('Error in getFileByIdDal', {
      error: { message: error.message, stack: error.stack },
      fileId,
    });
    throw error;
  }
};

export const getAllFilesDal = async ({
  search,
  type,
  tag,
  eventId,
  clubId,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(Array.isArray(type) && type.length > 0 ? { type: { in: type } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(eventId ? { eventId } : {}),
      ...(clubId ? { clubId } : {}),
      ...(search
        ? {
            OR: [
              { originalName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const normalizedSortOrder =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.lxFile.findMany({
        where,
        orderBy: { [sortBy]: normalizedSortOrder },
        skip,
        take: limit,
      }),
      prisma.lxFile.count({ where }),
    ]);

    return {
      page,
      limit,
      totalCount: total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      data: files,
    };
  } catch (error) {
    logger.error('Error in getAllFilesDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateFileDal = async (fileId, data) => {
  try {
    return await prisma.lxFile.update({
      where: { id: fileId },
      data,
    });
  } catch (error) {
    logger.error('Error in updateFileDal', {
      error: { message: error.message, stack: error.stack },
      fileId,
    });
    throw error;
  }
};

export const deleteFileDal = async (fileId) => {
  try {
    return await prisma.lxFile.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteFileDal', {
      error: { message: error.message, stack: error.stack },
      fileId,
    });
    throw error;
  }
};
