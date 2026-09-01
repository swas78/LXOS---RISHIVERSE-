// Shared LX (Learner Experience OS) constants.
//
// NOTE ON AUTH: This kit ships no auth. In RishiVerse these roles map onto the
// core User role/permission system, and routes are wrapped with checkPermission.
// The matrix below is DOCUMENTATION for handoff — locally it powers the dev
// actor shim's default views, but it is not a security boundary.

export const LX_ROLES = ['ADMIN', 'LX_TEAM', 'CLUB_HEAD', 'CLAN_HEAD', 'FINANCE', 'GUEST'];

// Human labels for roles (GUEST shows as "General Access").
export const LX_ROLE_LABELS = {
  ADMIN: 'Admin',
  LX_TEAM: 'LX Team',
  CLUB_HEAD: 'Club Head',
  CLAN_HEAD: 'Clan Head',
  FINANCE: 'Finance',
  GUEST: 'General Access',
};

// Institutional email domains allowed onto the platform (enforced by core auth).
export const LX_ALLOWED_EMAIL_DOMAINS = ['rishihood.edu.in', 'nst.rishihood.edu.in'];

// Permission matrix (from the LXOS Product Manual + original lib/permissions.js).
// Documented for maintainers to wire into checkPermission during integration.
export const LX_PERMISSION_MATRIX = {
  CREATE_EVENT: ['ADMIN', 'LX_TEAM', 'CLUB_HEAD', 'CLAN_HEAD'],
  APPROVE_EVENT: ['ADMIN', 'LX_TEAM'],
  BOOK_ROOM: ['ADMIN', 'LX_TEAM', 'CLUB_HEAD', 'CLAN_HEAD'],
  MANAGE_ROOMS: ['ADMIN'],
  MANAGE_CLUBS: ['ADMIN', 'LX_TEAM'],
  MANAGE_CLANS: ['ADMIN', 'CLAN_HEAD'],
  ALLOCATE_POINTS: ['ADMIN'],
  SUBMIT_EXPENSE: ['ADMIN', 'LX_TEAM', 'CLUB_HEAD'],
  APPROVE_EXPENSE: ['ADMIN', 'FINANCE'],
  VIEW_BUDGET: ['ADMIN', 'LX_TEAM', 'FINANCE'],
  SUBMIT_ACHIEVEMENT: ['ADMIN', 'LX_TEAM', 'CLUB_HEAD', 'CLAN_HEAD', 'GUEST'],
  APPROVE_ACHIEVEMENT: ['ADMIN', 'LX_TEAM'],
  APPROVE_REIMBURSEMENT: ['ADMIN', 'LX_TEAM'],
  PROCESS_REIMBURSEMENT: ['ADMIN', 'FINANCE'],
  VIEW_ANALYTICS: ['ADMIN', 'LX_TEAM', 'FINANCE'],
  MANAGE_USERS: ['ADMIN'],
  FILE_REPOSITORY: ['ADMIN', 'LX_TEAM', 'CLUB_HEAD', 'CLAN_HEAD', 'FINANCE', 'GUEST'],
};

// The four clans (fixed) and their colours — matching the real LXOS seed
// (Maratha bg-orange-500, Vijaya bg-green-500, Chola bg-purple-500,
// Rajputana bg-red-500).
export const LX_CLANS = [
  { name: 'Maratha', color: '#f97316' },
  { name: 'Vijaya', color: '#22c55e' },
  { name: 'Chola', color: '#a855f7' },
  { name: 'Rajputana', color: '#ef4444' },
];

export const LX_SEMESTER_DEFAULT = 'Spring 2026';

// Default page size shared across LX list endpoints.
export const LX_DEFAULT_PAGE_SIZE = 12;
export const LX_MAX_PAGE_SIZE = 100;
