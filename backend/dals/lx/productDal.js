import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';
import { buildPagination, normalizeSortOrder, pageSkip } from '../../helper/lxHelper.js';

const logger = createContextLogger('productDal');

const clean = (v) => (v === '' ? null : v);

export const createProductDal = async (payload) => {
  try {
    return await prisma.lxProduct.create({
      data: {
        title: payload.title,
        tagline: payload.tagline ?? '',
        description: payload.description,
        url: clean(payload.url) ?? null,
        repoUrl: clean(payload.repoUrl) ?? null,
        imageUrl: clean(payload.imageUrl) ?? null,
        ...(payload.category ? { category: payload.category } : {}),
        ...(payload.techStack ? { techStack: payload.techStack } : {}),
        ...(payload.tags ? { tags: payload.tags } : {}),
        ...(payload.teamMembers ? { teamMembers: payload.teamMembers } : {}),
        clubId: payload.clubId ?? null,
        clubName: payload.clubName ?? null,
        createdById: payload.createdById,
        createdByName: payload.createdByName,
        // Always starts PENDING — shown publicly only once an admin approves.
        status: 'PENDING',
      },
    });
  } catch (error) {
    logger.error('Error in createProductDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getProductByIdDal = async (productId) => {
  try {
    return await prisma.lxProduct.findFirst({ where: { id: productId, deletedAt: null } });
  } catch (error) {
    logger.error('Error in getProductByIdDal', {
      error: { message: error.message, stack: error.stack },
      productId,
    });
    throw error;
  }
};

export const getAllProductsDal = async ({
  search,
  status,
  category,
  createdById,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {
      deletedAt: null,
      ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
      ...(Array.isArray(category) && category.length > 0 ? { category: { in: category } } : {}),
      ...(createdById ? { createdById } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tagline: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const skip = pageSkip(page, limit);
    const [products, total] = await Promise.all([
      prisma.lxProduct.findMany({
        where,
        orderBy: { [sortBy]: normalizeSortOrder(sortOrder, 'desc') },
        skip,
        take: limit,
      }),
      prisma.lxProduct.count({ where }),
    ]);

    return { data: products, ...buildPagination(page, limit, total) };
  } catch (error) {
    logger.error('Error in getAllProductsDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateProductDal = async (productId, data) => {
  try {
    return await prisma.lxProduct.update({ where: { id: productId }, data });
  } catch (error) {
    logger.error('Error in updateProductDal', {
      error: { message: error.message, stack: error.stack },
      productId,
    });
    throw error;
  }
};

export const deleteProductDal = async (productId) => {
  try {
    return await prisma.lxProduct.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logger.error('Error in deleteProductDal', {
      error: { message: error.message, stack: error.stack },
      productId,
    });
    throw error;
  }
};
