// ---------------------------------------------------------------------------
// LX data scoping — WHICH ROWS AND WHICH COLUMNS an actor may see.
//
// This is the companion to lxPermissions.js. That file answers "may this role
// call this endpoint at all"; this one answers the two questions middleware
// cannot (lxos-core-pack/permissions.md §"Data scoping"):
//
//   1. ROW scope   — which clubs/clans/initiatives appear in a list
//   2. COLUMN scope— whether the money columns on a visible row are readable
//
// (2) matters because clubs and clans are PUBLIC objects: everyone may see that
// "Robotics Club" exists and read its blog. Only its own head, plus the finance
// roles, may see what it has spent. So the row stays, the budget is redacted.
//
// REDACTION CONTRACT
// ------------------
// A redacted row keeps every budget key with a `null` value and carries
// `budgetVisible: false`. Two deliberate choices:
//
//   * null, not 0        — 0 is a factual claim ("they spent nothing"). null is
//                          "you may not see this". The UI must render an em dash,
//                          never a zero.
//   * key kept, not      — the response shape stays constant, so the frontend
//     deleted             type is `number | null` rather than an optional, and a
//                          forgotten check is a visible "—" instead of undefined.
// ---------------------------------------------------------------------------
import { ROLES, isFinanceViewer } from './lxPermissions.js';

// Budget columns on LxClub / LxClan.
const ENTITY_BUDGET_FIELDS = ['budgetAllocated', 'budgetSpent', 'budgetHistory'];
// Budget columns on LxEvent.
const EVENT_BUDGET_FIELDS = ['budgetAllocated', 'budgetSpent'];

/**
 * What an actor may see budgets for.
 * @returns {{ all: boolean, clubIds: string[], clanIds: string[] }}
 */
export function budgetVisibility(actor) {
  // ADMIN / LX_TEAM / FINANCE see every club and clan.
  if (isFinanceViewer(actor?.role)) return { all: true, clubIds: [], clanIds: [] };
  // A head sees exactly the one entity they lead — nothing else.
  if (actor?.role === ROLES.CLUB_HEAD && actor.clubId) {
    return { all: false, clubIds: [actor.clubId], clanIds: [] };
  }
  if (actor?.role === ROLES.CLAN_HEAD && actor.clanId) {
    return { all: false, clubIds: [], clanIds: [actor.clanId] };
  }
  // Everyone else (GUEST, an unassigned head) sees no budgets at all.
  return { all: false, clubIds: [], clanIds: [] };
}

export const canSeeClubBudget = (actor, clubId) => {
  const v = budgetVisibility(actor);
  return v.all || (!!clubId && v.clubIds.includes(clubId));
};

export const canSeeClanBudget = (actor, clanId) => {
  const v = budgetVisibility(actor);
  return v.all || (!!clanId && v.clanIds.includes(clanId));
};

const applyRedaction = (row, fields, visible) => {
  if (!row) return row;
  if (visible) return { ...row, budgetVisible: true };
  const out = { ...row, budgetVisible: false };
  for (const f of fields) if (f in out) out[f] = null;
  return out;
};

/** Redact budget columns on one club row. */
export const redactClub = (club, actor) =>
  applyRedaction(club, ENTITY_BUDGET_FIELDS, canSeeClubBudget(actor, club?.id));

/** Redact budget columns on one clan row. Points are NOT redacted — the clan
 *  leaderboard is public by design; only money is scoped. */
export const redactClan = (clan, actor) =>
  applyRedaction(clan, ENTITY_BUDGET_FIELDS, canSeeClanBudget(actor, clan?.id));

/**
 * Redact budget columns on one event row. An event's money belongs to the club
 * or clan running it, so it follows that entity's visibility.
 */
export const redactEvent = (event, actor) => {
  if (!event) return event;
  const visible =
    canSeeClubBudget(actor, event.clubId) || canSeeClanBudget(actor, event.clanId);
  return applyRedaction(event, EVENT_BUDGET_FIELDS, visible);
};

export const redactClubs = (rows, actor) => (rows ?? []).map((r) => redactClub(r, actor));
export const redactClans = (rows, actor) => (rows ?? []).map((r) => redactClan(r, actor));
export const redactEvents = (rows, actor) => (rows ?? []).map((r) => redactEvent(r, actor));

// ---- Write scoping --------------------------------------------------------

/**
 * May this actor create/edit/delete something owned by `clanId`?
 * ADMIN and LX_TEAM act on any clan; a CLAN_HEAD only on the clan they lead.
 *
 * Returns a service-shaped result so callers can return it directly.
 * @returns {{ ok: true } | { ok: false, statusCode: number, message: string }}
 */
export function assertClanWrite(actor, clanId) {
  if (actor?.role === ROLES.ADMIN || actor?.role === ROLES.LX_TEAM) return { ok: true };

  if (actor?.role === ROLES.CLAN_HEAD) {
    if (!actor.clanId) {
      return {
        ok: false,
        statusCode: 403,
        message: 'You are not assigned to a clan yet. Ask an admin to assign you.',
      };
    }
    if (clanId && clanId !== actor.clanId) {
      return {
        ok: false,
        statusCode: 403,
        message: 'You can only manage initiatives for your own clan.',
      };
    }
    return { ok: true };
  }

  return {
    ok: false,
    statusCode: 403,
    message: 'Only clan heads and the LX team can manage clan initiatives.',
  };
}

/**
 * The clan a write should be attributed to.
 *
 * A clan head who names a clan gets that request CHECKED, not silently
 * rewritten — quietly retargeting their initiative onto their own clan would
 * report success for something they did not ask for. Only an omitted clanId is
 * defaulted, which is the harmless case ("my clan", implied).
 *
 * Callers must still run assertClanWrite() on the result.
 */
export const resolveWriteClanId = (actor, requestedClanId) => {
  if (requestedClanId) return requestedClanId;
  if (actor?.role === ROLES.CLAN_HEAD && actor.clanId) return actor.clanId;
  return requestedClanId;
};
