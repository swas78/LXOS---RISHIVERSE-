import createContextLogger from '../../logger/contextLogger.js';
import prisma from '../../services/prismaClient.js';

const logger = createContextLogger('reportDal');

export const getReportSourceDal = async () => {
  try {
    const [clubs, clans, events, achievements, reimbursements, initiatives] = await Promise.all([
      prisma.lxClub.findMany({ where: { deletedAt: null } }),
      prisma.lxClan.findMany({
        where: { deletedAt: null },
        include: { pointTxns: { orderBy: { date: 'desc' } } },
      }),
      prisma.lxEvent.findMany({ where: { deletedAt: null }, orderBy: { startDate: 'desc' } }),
      prisma.lxAchievement.findMany({ where: { deletedAt: null }, orderBy: { achievedDate: 'desc' } }),
      prisma.lxReimbursement.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.lxInitiative.findMany({ where: { deletedAt: null }, orderBy: { date: 'desc' } }),
    ]);
    return { clubs, clans, events, achievements, reimbursements, initiatives };
  } catch (error) {
    logger.error('Error in getReportSourceDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Distinct semesters known across clubs/clans (current + archived history).
export const getSemestersDal = async () => {
  try {
    const [clubs, clans] = await Promise.all([
      prisma.lxClub.findMany({ where: { deletedAt: null }, select: { semester: true, budgetHistory: true } }),
      prisma.lxClan.findMany({ where: { deletedAt: null }, select: { semester: true, budgetHistory: true } }),
    ]);
    const set = new Set();
    const currentCounts = {};
    for (const e of [...clubs, ...clans]) {
      if (e.semester) {
        set.add(e.semester);
        currentCounts[e.semester] = (currentCounts[e.semester] || 0) + 1;
      }
      const hist = Array.isArray(e.budgetHistory) ? e.budgetHistory : [];
      for (const h of hist) if (h?.semester) set.add(h.semester);
    }
    const current = Object.entries(currentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { semesters: [...set].sort(), current };
  } catch (error) {
    logger.error('Error in getSemestersDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Close the current semester and open a new one: archive each club/clan's
// current budget into budgetHistory, then set the new semester and reset spend.
export const rolloverSemesterDal = async ({ newSemester, resetAllocation }) => {
  try {
    let updated = 0;

    const applyTo = async (rows, model) => {
      for (const doc of rows) {
        if (doc.semester === newSemester) continue;
        const history = Array.isArray(doc.budgetHistory) ? [...doc.budgetHistory] : [];
        const existing = history.find((h) => h.semester === doc.semester);
        if (existing) {
          existing.budgetAllocated = doc.budgetAllocated;
          existing.budgetSpent = doc.budgetSpent;
        } else {
          history.push({
            semester: doc.semester,
            budgetAllocated: doc.budgetAllocated,
            budgetSpent: doc.budgetSpent,
          });
        }
        await model.update({
          where: { id: doc.id },
          data: {
            budgetHistory: history,
            semester: newSemester,
            budgetSpent: 0,
            ...(resetAllocation ? { budgetAllocated: 0 } : {}),
          },
        });
        updated += 1;
      }
    };

    const clubs = await prisma.lxClub.findMany({ where: { deletedAt: null } });
    const clans = await prisma.lxClan.findMany({ where: { deletedAt: null } });
    await applyTo(clubs, prisma.lxClub);
    await applyTo(clans, prisma.lxClan);

    return { updated, semester: newSemester };
  } catch (error) {
    logger.error('Error in rolloverSemesterDal', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
