import createContextLogger from '../../logger/contextLogger.js';
import {
  getReportSourceDal,
  getSemestersDal,
  rolloverSemesterDal,
} from '../../dals/lx/reportDal.js';

const logger = createContextLogger('reportService');

const money = (n) => Number(n || 0);
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

// Budget figure for an entity in a given semester (current or from history).
function figureFor(entity, semester) {
  if (entity.semester === semester) {
    return { allocated: entity.budgetAllocated || 0, spent: entity.budgetSpent || 0 };
  }
  const hist = Array.isArray(entity.budgetHistory) ? entity.budgetHistory : [];
  const h = hist.find((x) => x.semester === semester);
  return h ? { allocated: h.budgetAllocated || 0, spent: h.budgetSpent || 0 } : null;
}

export const getSemestersService = async () => {
  try {
    const data = await getSemestersDal();
    return { success: true, message: 'Semesters', statusCode: 200, data };
  } catch (error) {
    logger.error('Error in getSemestersService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Builds the full LX report for a semester (mirrors the original lx-report-data).
export const getReportService = async (requestedSemester) => {
  try {
    const { clubs, clans, events, achievements, reimbursements, initiatives } =
      await getReportSourceDal();

    let semester = requestedSemester;
    if (!semester) {
      const counts = {};
      [...clubs, ...clans].forEach((e) => {
        counts[e.semester] = (counts[e.semester] || 0) + 1;
      });
      semester = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Current';
    }

    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 864e5);

    const clubBudgets = clubs
      .map((c) => {
        const f = figureFor(c, semester);
        if (!f) return null;
        return { name: c.name, allocated: f.allocated, used: f.spent, remaining: f.allocated - f.spent };
      })
      .filter(Boolean);

    const clanBudgets = clans.map((c) => {
      const f = figureFor(c, semester) || { allocated: 0, spent: 0 };
      return {
        name: c.name,
        points: c.points || 0,
        allocated: f.allocated,
        used: f.spent,
        remaining: f.allocated - f.spent,
      };
    });

    const sumA = [...clubBudgets, ...clanBudgets].reduce((s, b) => s + b.allocated, 0);
    const sumS = [...clubBudgets, ...clanBudgets].reduce((s, b) => s + b.used, 0);

    const summary = [
      { metric: 'Events — total', value: events.length },
      { metric: 'Events — completed', value: events.filter((e) => e.isCompleted || e.status === 'COMPLETED').length },
      { metric: 'Events — upcoming (next 30 days)', value: events.filter((e) => e.status === 'APPROVED' && new Date(e.startDate) >= now && new Date(e.startDate) <= in30).length },
      { metric: 'Budget allocated (semester)', value: sumA },
      { metric: 'Budget used (semester)', value: sumS },
      { metric: 'Budget remaining (semester)', value: sumA - sumS },
      { metric: 'Achievements', value: achievements.filter((a) => a.kind !== 'UPDATE').length },
      { metric: 'Reimbursements', value: reimbursements.length },
      { metric: 'Reimbursements processed (₹)', value: reimbursements.filter((r) => r.status === 'PROCESSED').reduce((s, r) => s + money(r.amount), 0) },
    ];

    const data = {
      semester,
      generatedAt: now,
      summary,
      clubBudgets,
      clanBudgets,
      events: events.map((e) => ({
        title: e.title,
        type: e.type,
        org: e.clubName || e.clanName || (e.type === 'FEST' ? 'Fest' : 'LX'),
        start: fmtDate(e.startDate),
        end: fmtDate(e.endDate),
        status: e.status,
        venue: (e.roomNames?.length ? e.roomNames.join(' / ') : '') || e.location || '',
        allocated: money(e.budgetAllocated),
        spent: money(e.budgetSpent),
        completed: e.isCompleted || e.status === 'COMPLETED' ? 'Yes' : 'No',
      })),
      achievements: achievements
        .filter((a) => a.kind !== 'UPDATE')
        .map((a) => ({
          title: a.title,
          category: a.category,
          org: a.clubName || a.clanName || '',
          points: money(a.points),
          status: a.status,
          date: fmtDate(a.achievedDate),
          participants: (a.participants || []).join('; '),
          addedBy: a.createdByName || '',
        })),
      reimbursements: reimbursements.map((r) => ({
        title: r.title,
        by: r.submittedByName || '',
        amount: money(r.amount),
        category: r.category,
        chargedTo: r.clubName || r.clanName || '',
        purpose: r.eventTitle || r.purpose || '',
        status: r.status,
        date: fmtDate(r.expenseDate),
      })),
      initiatives: initiatives.map((it) => ({
        title: it.title,
        clan: it.clanName || '',
        semester: it.semester || '',
        status: it.status,
        date: fmtDate(it.date),
        description: it.description || '',
      })),
      pointHistory: clans.flatMap((c) =>
        (c.pointTxns || []).map((h) => ({
          clan: c.name,
          delta: money(h.delta),
          points: money(h.points),
          reason: h.reason || '',
          date: fmtDate(h.date),
        })),
      ),
    };

    return { success: true, message: 'LX report', statusCode: 200, data };
  } catch (error) {
    logger.error('Error in getReportService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

// Build a sectioned CSV of a report (mirrors the original /api/lx-report).
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvRow = (arr) => arr.map(csvCell).join(',');

export const buildReportCsv = (data) => {
  const lines = [];
  const push = (...rs) => rs.forEach((r) => lines.push(r));
  const section = (title) => {
    lines.push('');
    lines.push(`== ${title} ==`);
  };
  const statusOf = (rem) => (rem < 0 ? 'OVER BUDGET' : 'Within budget');

  push('LX SEMESTER REPORT');
  push(csvRow(['Semester', data.semester]));
  push(csvRow(['Generated', new Date(data.generatedAt).toLocaleString('en-IN')]));
  push(csvRow(['Note', 'Budget figures are for the selected semester. Events, achievements & reimbursements list all records.']));

  section('SUMMARY');
  push(csvRow(['Metric', 'Value']));
  data.summary.forEach((s) => push(csvRow([s.metric, s.value])));

  section(`CLUB BUDGETS (${data.semester})`);
  push(csvRow(['Club', 'Allocated', 'Used', 'Remaining', 'Status']));
  data.clubBudgets.forEach((b) => push(csvRow([b.name, b.allocated, b.used, b.remaining, statusOf(b.remaining)])));

  section(`CLAN BUDGETS & POINTS (${data.semester})`);
  push(csvRow(['Clan', 'Points', 'Allocated', 'Used', 'Remaining', 'Status']));
  data.clanBudgets.forEach((b) => push(csvRow([b.name, b.points, b.allocated, b.used, b.remaining, statusOf(b.remaining)])));

  section('EVENTS');
  push(csvRow(['Title', 'Type', 'Organisation', 'Start', 'End', 'Status', 'Venue', 'Budget Allocated', 'Budget Spent', 'Completed']));
  data.events.forEach((e) => push(csvRow([e.title, e.type, e.org, e.start, e.end, e.status, e.venue, e.allocated, e.spent, e.completed])));

  section('ACHIEVEMENTS');
  push(csvRow(['Title', 'Category', 'Club/Clan', 'Points', 'Status', 'Date', 'Participants', 'Added By']));
  data.achievements.forEach((a) => push(csvRow([a.title, a.category, a.org, a.points, a.status, a.date, a.participants, a.addedBy])));

  section('REIMBURSEMENTS');
  push(csvRow(['Title', 'Submitted By', 'Amount', 'Category', 'Charged To', 'Event/Purpose', 'Status', 'Expense Date']));
  data.reimbursements.forEach((r) => push(csvRow([r.title, r.by, r.amount, r.category, r.chargedTo, r.purpose, r.status, r.date])));

  section('INITIATIVES');
  push(csvRow(['Title', 'Clan', 'Semester', 'Status', 'Date', 'Description']));
  data.initiatives.forEach((it) => push(csvRow([it.title, it.clan, it.semester, it.status, it.date, it.description])));

  section('CLAN POINT HISTORY');
  push(csvRow(['Clan', 'Points Change', 'Total', 'Reason', 'Date']));
  data.pointHistory.forEach((h) => push(csvRow([h.clan, (h.delta >= 0 ? '+' : '') + h.delta, h.points, h.reason, h.date])));

  return lines.join('\n');
};

export const rolloverSemesterService = async ({ newSemester, resetAllocation }) => {
  try {
    const result = await rolloverSemesterDal({ newSemester, resetAllocation });
    return {
      success: true,
      message: `Rolled over to ${newSemester} — ${result.updated} club/clan budgets archived`,
      statusCode: 200,
      data: result,
    };
  } catch (error) {
    logger.error('Error in rolloverSemesterService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
