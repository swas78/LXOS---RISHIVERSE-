// Access-management DAL — reads/writes role + club/clan linkage on LxMember.
// In the kit LxMember IS the directory; in RishiVerse this maps onto the core
// user/role system (userType → role). Admin-only (enforced in routes).
import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("accessDal");

export const getAccessOverviewDal = async () => {
    try {
        const [clubs, clans, users] = await Promise.all([
            prisma.lxClub.findMany({
                where: { deletedAt: null },
                select: { id: true, name: true },
                orderBy: { name: "asc" },
            }),
            prisma.lxClan.findMany({
                where: { deletedAt: null },
                select: { id: true, name: true, color: true },
                orderBy: { name: "asc" },
            }),
            prisma.lxMember.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    referenceId: true,
                    displayName: true,
                    email: true,
                    role: true,
                    clubId: true,
                    clanId: true,
                },
                orderBy: { displayName: "asc" },
            }),
        ]);
        return { clubs, clans, users };
    } catch (error) {
        logger.error("Error in getAccessOverviewDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// Canonical lookup: core User.referenceId (enrollmentNo / employeeId).
export const findUserByReferenceIdDal = async (referenceId) => {
    try {
        return await prisma.lxMember.findUnique({ where: { referenceId: referenceId.trim() } });
    } catch (error) {
        logger.error("Error in findUserByReferenceIdDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// DEV-ONLY lookup — core owns email. Drop at handoff.
export const findUserByEmailDal = async (email) => {
    try {
        return await prisma.lxMember.findFirst({ where: { email: email.toLowerCase().trim() } });
    } catch (error) {
        logger.error("Error in findUserByEmailDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const findUserByIdDal = async (id) => {
    try {
        return await prisma.lxMember.findFirst({ where: { id } });
    } catch (error) {
        logger.error("Error in findUserByIdDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const createUserDal = async ({ referenceId, displayName, email, role = "GUEST" }) => {
    try {
        return await prisma.lxMember.create({
            // email is optional: granting access by referenceId alone is the normal
            // path, since core — not LX — owns the address.
            data: {
                referenceId,
                displayName: displayName ?? null,
                email: email ? email.toLowerCase().trim() : null,
                role,
                isActive: true,
            },
        });
    } catch (error) {
        logger.error("Error in createUserDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateUserAccessDal = async (id, data) => {
    try {
        return await prisma.lxMember.update({ where: { id }, data });
    } catch (error) {
        logger.error("Error in updateUserAccessDal", {
            error: { message: error.message, stack: error.stack },
            id,
        });
        throw error;
    }
};
