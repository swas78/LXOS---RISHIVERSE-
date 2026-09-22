import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("clubDal");

export const createClubDal = async ({
    name,
    description,
    logo,
    category,
    budgetAllocated,
    budgetSpent,
    semester,
    headName,
    headEmail,
    isActive,
}) => {
    try {
        return await prisma.lxClub.create({
            data: {
                name,
                description,
                logo: logo ?? null,
                ...(category ? { category } : {}),
                ...(budgetAllocated !== undefined ? { budgetAllocated } : {}),
                ...(budgetSpent !== undefined ? { budgetSpent } : {}),
                ...(semester ? { semester } : {}),
                headName: headName ?? null,
                headEmail: headEmail ?? null,
                ...(isActive !== undefined ? { isActive } : {}),
            },
        });
    } catch (error) {
        logger.error("Error in createClubDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getClubByIdDal = async (clubId) => {
    try {
        return await prisma.lxClub.findFirst({
            where: { id: clubId, deletedAt: null },
        });
    } catch (error) {
        logger.error("Error in getClubByIdDal", {
            error: { message: error.message, stack: error.stack },
            clubId,
        });
        throw error;
    }
};

export const getAllClubsDal = async ({
    search,
    category,
    isActive,
    page,
    limit,
    sortBy,
    sortOrder,
}) => {
    try {
        const where = {
            deletedAt: null,
            ...(Array.isArray(category) && category.length > 0
                ? { category: { in: category } }
                : {}),
            ...(typeof isActive === "boolean" ? { isActive } : {}),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { description: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        const normalizedSortOrder =
            String(sortOrder || "asc").toLowerCase() === "desc" ? "desc" : "asc";
        const skip = (page - 1) * limit;

        const [clubs, total] = await Promise.all([
            prisma.lxClub.findMany({
                where,
                orderBy: { [sortBy]: normalizedSortOrder },
                skip,
                take: limit,
            }),
            prisma.lxClub.count({ where }),
        ]);

        return {
            page,
            limit,
            totalCount: total,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
            data: clubs,
        };
    } catch (error) {
        logger.error("Error in getAllClubsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateClubDal = async (clubId, data) => {
    try {
        return await prisma.lxClub.update({
            where: { id: clubId },
            data,
        });
    } catch (error) {
        logger.error("Error in updateClubDal", {
            error: { message: error.message, stack: error.stack },
            clubId,
        });
        throw error;
    }
};

export const deleteClubDal = async (clubId) => {
    try {
        return await prisma.lxClub.update({
            where: { id: clubId },
            data: { deletedAt: new Date() },
        });
    } catch (error) {
        logger.error("Error in deleteClubDal", {
            error: { message: error.message, stack: error.stack },
            clubId,
        });
        throw error;
    }
};
