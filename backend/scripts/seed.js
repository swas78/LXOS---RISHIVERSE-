// Master LX seed — LOCAL ONLY, not part of handoff.
// Uses the REAL LXOS dataset (clubs, clans, rooms, admins) from the original
// LXOS (scripts/seed.js) mapped onto the Prisma schema, plus a modest demo
// layer of events/achievements/reimbursements/products so the no-auth app is
// still demoable. Usage: node scripts/seed.js
import 'dotenv/config';
import prisma from '../services/prismaClient.js';
import { LX_CLANS, LX_SEMESTER_DEFAULT } from '../constants/lxConstant.js';

const SEM = LX_SEMESTER_DEFAULT;

function daysFromNow(d, hour = 10) {
  const base = new Date('2026-09-01T00:00:00.000Z');
  const dt = new Date(base);
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}

// ---- Real rooms (from LXOS seed) -----------------------------------------
const FLOOR = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth' };
function buildRooms() {
  const names = [
    'C-103', 'C-104', 'A-303', 'A-304', 'Mini Audi',
    'A-401', 'A-402', 'A-403', 'A-404', 'A-405', 'A-406', 'A-407', 'A-408', 'A-409', 'A-410',
    'A-501', 'A-502', 'A-503', 'A-504', 'A-505', 'A-506', 'A-507', 'A-508', 'A-509', 'A-510',
  ];
  return names.map((name) => {
    if (name === 'Mini Audi') {
      return {
        name, building: 'Central Block', floor: 'Ground', capacity: 150,
        type: 'AUDITORIUM', amenities: ['PROJECTOR', 'WHITEBOARD', 'AC', 'SOUND_SYSTEM', 'STAGE'],
      };
    }
    const block = name.split('-')[0]; // 'C' | 'A'
    const hundreds = Number(name.split('-')[1][0]);
    return {
      name, building: `${block} Block`, floor: FLOOR[hundreds] ?? 'Ground',
      capacity: 60, type: 'CLASSROOM', amenities: ['PROJECTOR', 'WHITEBOARD', 'AC'],
    };
  });
}

// ---- Real clubs (from LXOS seed) -----------------------------------------
// name, category(enum), email, and a demo budgetSpent (real seed spends 0).
const CLUBS = [
  { name: 'SAST', category: 'TECHNICAL', email: 'sast@rishihood.edu.in', budgetSpent: 32000 },
  { name: 'Content Team', category: 'OTHER', email: 'content@rishihood.edu.in', budgetSpent: 8000 },
  { name: 'Fine Arts Club', category: 'CULTURAL', email: 'finearts.club@rishihood.edu.in', budgetSpent: 15000 },
  { name: 'GDG', category: 'TECHNICAL', email: 'gdg@rishihood.edu.in', budgetSpent: 26000 },
  { name: 'Robotics Club', category: 'TECHNICAL', email: 'robotics.club@rishihood.edu.in', budgetSpent: 41000 },
  { name: 'Dance Club', category: 'CULTURAL', email: 'dance.club@rishihood.edu.in', budgetSpent: 19000 },
  { name: 'Theatre Club', category: 'CULTURAL', email: 'theatre.club@rishihood.edu.in', budgetSpent: 23000 },
  { name: 'Finanza', category: 'ACADEMIC', email: 'finanza@rishihood.edu.in', budgetSpent: 12000 },
  { name: 'GD Club', category: 'OTHER', email: 'gdclub@nst.rishihood.edu.in', budgetSpent: 4000 },
  { name: 'AI Club', category: 'TECHNICAL', email: 'aiclub@nst.rishihood.edu.in', budgetSpent: 21000 },
  { name: 'SAGE', category: 'SOCIAL', email: 'sage.club@rishihood.edu.in', budgetSpent: 9000 },
];

// ---- Real admins (from LXOS seed) ----------------------------------------
const ADMIN_EMAILS = [
  'yashika.b@rishihood.edu.in',
  'mehak.m@rishihood.edu.in',
  'sandeep.s@rishihood.edu.in',
  'neelanshu.2024@nst.rishihood.edu.in',
  'soumya.a@rishihood.edu.in',
];

async function clearAll() {
  await prisma.lxClanPointTxn.deleteMany();
  await prisma.lxRoomBooking.deleteMany();
  await Promise.all([
    prisma.lxEvent.deleteMany(),
    prisma.lxAchievement.deleteMany(),
    prisma.lxExpense.deleteMany(),
    prisma.lxReimbursement.deleteMany(),
    prisma.lxInitiative.deleteMany(),
    prisma.lxFile.deleteMany(),
    prisma.lxProduct.deleteMany(),
  ]);
  await Promise.all([
    prisma.lxClub.deleteMany(),
    prisma.lxClan.deleteMany(),
    prisma.lxRoom.deleteMany(),
    prisma.lxUser.deleteMany(),
  ]);
}

async function main() {
  console.info('[seed] clearing LX tables…');
  await clearAll();

  // ---- Rooms ----
  await prisma.lxRoom.createMany({ data: buildRooms() });
  const rooms = await prisma.lxRoom.findMany({ orderBy: { name: 'asc' } });
  const roomByName = Object.fromEntries(rooms.map((r) => [r.name, r]));
  console.info(`[seed] rooms: ${rooms.length}`);

  // ---- Clans (real colours, 50000 allocated) ----
  for (const c of LX_CLANS) {
    await prisma.lxClan.create({
      data: {
        name: c.name, color: c.color, points: 0, budgetAllocated: 50000, budgetSpent: 0,
        semester: SEM, description: `${c.name} clan — inter-clan competition at Rishihood.`,
      },
    });
  }
  const clans = await prisma.lxClan.findMany();
  const clanByName = Object.fromEntries(clans.map((c) => [c.name, c]));

  // ---- Clubs (100000 allocated) ----
  for (const club of CLUBS) {
    await prisma.lxClub.create({
      data: {
        name: club.name,
        description: `Official ${club.name} of Rishihood University`,
        category: club.category,
        budgetAllocated: 100000,
        budgetSpent: club.budgetSpent,
        semester: SEM,
        headName: `${club.name} Head`,
        headEmail: club.email,
        isActive: true,
      },
    });
  }
  const clubs = await prisma.lxClub.findMany();
  const clubByName = Object.fromEntries(clubs.map((c) => [c.name, c]));

  // ---- Users: real admins + club/clan heads + dev-only LX/Finance/Guest ----
  for (const email of ADMIN_EMAILS) {
    await prisma.lxUser.create({
      data: { name: email.split('@')[0], email, role: 'ADMIN' },
    });
  }
  // Extra roles so the dev switcher can demo every permission tier. In the real
  // LXOS these come from the RU directory (userType → role); here they are stubs.
  await prisma.lxUser.create({ data: { name: 'LX Team', email: 'lx.team@rishihood.edu.in', role: 'LX_TEAM' } });
  await prisma.lxUser.create({ data: { name: 'Finance', email: 'finance@rishihood.edu.in', role: 'FINANCE' } });
  await prisma.lxUser.create({ data: { name: 'Student (General)', email: 'student@nst.rishihood.edu.in', role: 'GUEST' } });
  for (const club of CLUBS) {
    await prisma.lxUser.create({
      data: { name: `${club.name} Head`, email: club.email, role: 'CLUB_HEAD', clubId: clubByName[club.name].id },
    });
  }
  for (const c of LX_CLANS) {
    await prisma.lxUser.create({
      data: {
        name: `${c.name} Clan Head`,
        email: `${c.name.toLowerCase()}.clan@rishihood.edu.in`,
        role: 'CLAN_HEAD',
        clanId: clanByName[c.name].id,
      },
    });
  }
  const users = await prisma.lxUser.findMany();
  const admin = users.find((u) => u.email === 'yashika.b@rishihood.edu.in');
  const finance = users.find((u) => u.role === 'FINANCE');
  const student = users.find((u) => u.role === 'GUEST');
  const headOf = (clubName) => users.find((u) => u.role === 'CLUB_HEAD' && u.clubId === clubByName[clubName].id);
  const clanHeadOf = (clanName) => users.find((u) => u.role === 'CLAN_HEAD' && u.clanId === clanByName[clanName].id);
  console.info(`[seed] users: ${users.length}, clubs: ${clubs.length}, clans: ${clans.length}`);

  const audi = roomByName['Mini Audi'];
  const c103 = roomByName['C-103'];
  const a401 = roomByName['A-401'];
  const a402 = roomByName['A-402'];

  // ---- Events (real clubs/clans) ----
  const gdg = clubByName['GDG'];
  const robotics = clubByName['Robotics Club'];
  const theatre = clubByName['Theatre Club'];
  const sast = clubByName['SAST'];
  const gdgHead = headOf('GDG');
  const roboHead = headOf('Robotics Club');
  const theatreHead = headOf('Theatre Club');
  const marathaHead = clanHeadOf('Maratha');

  const eventsData = [
    {
      title: 'GDG DevFest 2026', description: 'A day of talks and workshops on modern web and AI.', type: 'CLUB',
      clubId: gdg.id, clubName: gdg.name, startDate: daysFromNow(5, 10), endDate: daysFromNow(5, 17),
      roomIds: [audi.id], roomNames: [audi.name], budgetAllocated: 20000, budgetSpent: 9000, status: 'APPROVED',
      createdById: gdgHead.id, createdByName: gdgHead.name, createdByRole: 'CLUB_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2), attendees: 180,
    },
    {
      title: 'Robotics Build Night', description: 'Overnight robotics build and demo session.', type: 'CLUB',
      clubId: robotics.id, clubName: robotics.name, startDate: daysFromNow(9, 18), endDate: daysFromNow(10, 6),
      roomIds: [a401.id, a402.id], roomNames: [a401.name, a402.name], budgetAllocated: 15000, budgetSpent: 0,
      status: 'PENDING', createdById: roboHead.id, createdByName: roboHead.name, createdByRole: 'CLUB_HEAD', attendees: 60,
    },
    {
      title: 'Theatre Annual Play', description: "Theatre Club's flagship production.", type: 'CLUB',
      clubId: theatre.id, clubName: theatre.name, startDate: daysFromNow(14, 18), endDate: daysFromNow(14, 21),
      roomIds: [audi.id], roomNames: [audi.name], budgetAllocated: 18000, budgetSpent: 8100, status: 'APPROVED',
      createdById: theatreHead.id, createdByName: theatreHead.name, createdByRole: 'CLUB_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), attendees: 150,
    },
    {
      title: 'Inter-Clan Sports Meet', description: 'Inter-clan athletics championship.', type: 'CLAN',
      clanId: clanByName['Maratha'].id, clanName: 'Maratha', startDate: daysFromNow(3, 8), endDate: daysFromNow(3, 16),
      location: 'Sports Ground', budgetAllocated: 10000, budgetSpent: 4200, status: 'APPROVED',
      createdById: marathaHead.id, createdByName: marathaHead.name, createdByRole: 'CLAN_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-3), attendees: 300,
    },
    {
      title: 'Freshers Fest 2026', description: 'Campus-wide welcome fest.', type: 'FEST',
      startDate: daysFromNow(20, 16), endDate: daysFromNow(20, 22), roomIds: [audi.id], roomNames: [audi.name],
      budgetAllocated: 40000, budgetSpent: 12000, status: 'APPROVED', createdById: admin.id, createdByName: admin.name,
      createdByRole: 'ADMIN', approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), attendees: 600,
    },
    {
      title: 'LX Orientation', description: 'Onboarding for new club and clan heads.', type: 'LX',
      startDate: daysFromNow(1, 11), endDate: daysFromNow(1, 13), roomIds: [c103.id], roomNames: [c103.name],
      budgetAllocated: 3000, budgetSpent: 900, status: 'APPROVED', createdById: admin.id, createdByName: admin.name,
      createdByRole: 'ADMIN', approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-4), attendees: 45,
    },
  ];
  for (const e of eventsData) await prisma.lxEvent.create({ data: e });
  const events = await prisma.lxEvent.findMany();
  console.info(`[seed] events: ${events.length}`);

  // ---- Achievements ----
  await prisma.lxAchievement.createMany({
    data: [
      {
        title: 'Smart India Hackathon — Finalists', description: 'SAST team reached the SIH grand finale.',
        clubId: sast.id, clubName: sast.name, points: 50, category: 'TECHNICAL', kind: 'ACHIEVEMENT',
        participants: ['Aarav', 'Ishita', 'Dev'], status: 'APPROVED', createdById: headOf('SAST').id, createdByName: headOf('SAST').name,
        approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2), achievedDate: daysFromNow(-5),
      },
      {
        title: 'Inter-College Robotics Gold', description: 'Robotics Club won first place at the regional meet.',
        clubId: robotics.id, clubName: robotics.name, points: 30, category: 'TECHNICAL', kind: 'ACHIEVEMENT',
        participants: ['Kabir', 'Sana'], status: 'APPROVED', createdById: roboHead.id, createdByName: roboHead.name,
        approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), achievedDate: daysFromNow(-3),
      },
      {
        title: 'State Athletics Gold', description: 'Maratha clan member won gold in 400m.',
        clanId: clanByName['Maratha'].id, clanName: 'Maratha', points: 20, category: 'SPORTS', kind: 'ACHIEVEMENT',
        participants: ['Meera'], status: 'APPROVED', createdById: marathaHead.id, createdByName: marathaHead.name,
        approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), achievedDate: daysFromNow(-2),
      },
      {
        title: 'My Design Certification', description: 'Completed an advanced UI/UX design course.', points: 0,
        category: 'ACADEMIC', kind: 'ACHIEVEMENT', participants: ['Student'], status: 'PENDING',
        createdById: student.id, createdByName: student.name, achievedDate: daysFromNow(-1),
      },
      {
        title: 'GDG: Study Jams launching', description: 'GDG is starting weekly Google Study Jams this month.',
        clubId: gdg.id, clubName: gdg.name, category: 'SOCIAL', kind: 'UPDATE', status: 'APPROVED',
        createdById: gdgHead.id, createdByName: gdgHead.name, approvedById: admin.id, approvedByName: admin.name,
        approvedAt: daysFromNow(0), achievedDate: daysFromNow(0),
      },
    ],
  });

  // ---- Clan points ledger (matching approved achievements) ----
  await prisma.lxClan.update({ where: { id: clanByName['Maratha'].id }, data: { points: 20, budgetSpent: 4200 } });
  await prisma.lxClanPointTxn.create({
    data: {
      clanId: clanByName['Maratha'].id, delta: 20, points: 20, previousPoints: 0,
      reason: 'State Athletics Gold — achievement approved', createdById: admin.id, createdByName: admin.name,
    },
  });
  await prisma.lxClan.update({ where: { id: clanByName['Vijaya'].id }, data: { points: 10 } });
  await prisma.lxClanPointTxn.create({
    data: { clanId: clanByName['Vijaya'].id, delta: 10, points: 10, previousPoints: 0, reason: 'Cultural night participation', createdById: admin.id, createdByName: admin.name },
  });

  // ---- Initiatives ----
  await prisma.lxInitiative.createMany({
    data: [
      { title: 'Maratha Green Campus', description: 'Tree plantation drive.', clanId: clanByName['Maratha'].id, clanName: 'Maratha', status: 'ACTIVE', progress: 60, priority: 'HIGH', team: ['Meera', 'Arjun'], semester: SEM, createdById: marathaHead.id, createdByName: marathaHead.name },
      { title: 'Vijaya Blood Donation', description: 'Campus blood donation camp.', clanId: clanByName['Vijaya'].id, clanName: 'Vijaya', status: 'PLANNING', progress: 20, priority: 'MEDIUM', team: ['Sana'], semester: SEM },
    ],
  });

  // ---- Expenses (event spend) ----
  const devfest = events.find((e) => e.title.includes('DevFest'));
  await prisma.lxExpense.createMany({
    data: [
      { eventId: devfest.id, eventTitle: devfest.title, title: 'Catering for DevFest', amount: 9000, category: 'FOOD', status: 'APPROVED', submittedById: gdgHead.id, submittedByName: gdgHead.name, verifiedById: admin.id, verifiedByName: admin.name, verifiedAt: daysFromNow(-1), budgetApplied: true },
      { eventId: devfest.id, eventTitle: devfest.title, title: 'Speaker travel', amount: 3500, category: 'OTHER', status: 'PENDING', submittedById: gdgHead.id, submittedByName: gdgHead.name },
    ],
  });

  // ---- Reimbursements (workflow states; no bank details, payout ref on processed) ----
  await prisma.lxReimbursement.createMany({
    data: [
      { title: 'Auto fare for vendor pickup', amount: 450, expenseDate: daysFromNow(-4), category: 'TRAVEL', purpose: 'DevFest logistics', eventId: devfest.id, eventTitle: devfest.title, clubId: gdg.id, clubName: gdg.name, status: 'PENDING', submittedById: gdgHead.id, submittedByName: gdgHead.name },
      { title: 'Printing handouts', amount: 800, expenseDate: daysFromNow(-6), category: 'PRINTING', purpose: 'Orientation', clubId: sast.id, clubName: sast.name, status: 'APPROVED', submittedById: headOf('SAST').id, submittedByName: headOf('SAST').name, reviewedById: admin.id, reviewedByName: admin.name, reviewedAt: daysFromNow(-2) },
      { title: 'Props for play', amount: 2200, expenseDate: daysFromNow(-8), category: 'MATERIALS', purpose: 'Annual Play', clubId: theatre.id, clubName: theatre.name, status: 'PROCESSED', submittedById: theatreHead.id, submittedByName: theatreHead.name, reviewedById: admin.id, reviewedByName: admin.name, reviewedAt: daysFromNow(-5), processedById: finance.id, processedByName: finance.name, processedAt: daysFromNow(-3), budgetDeducted: true, payoutRef: 'PAYOUT-2026-0001' },
    ],
  });

  // ---- Files ----
  await prisma.lxFile.createMany({
    data: [
      { filename: 'sast-constitution.pdf', originalName: 'SAST Constitution.pdf', path: '/uploads/sast-constitution.pdf', mimeType: 'application/pdf', size: 240000, type: 'DOCUMENT', clubId: sast.id, semester: SEM, tags: ['constitution', 'sast'], uploadedById: headOf('SAST').id, uploadedByName: headOf('SAST').name },
      { filename: 'devfest-report.pdf', originalName: 'GDG DevFest Report.pdf', path: '/uploads/devfest-report.pdf', mimeType: 'application/pdf', size: 512000, type: 'REPORT', eventId: devfest.id, semester: SEM, tags: ['report', 'devfest'], uploadedById: admin.id, uploadedByName: admin.name },
    ],
  });

  // ---- Learner Products (2 approved incl. featured, 2 pending) ----
  await prisma.lxProduct.createMany({
    data: [
      { title: 'CampusEats', tagline: 'Order from campus canteens in taps', description: 'A web app to pre-order food from campus canteens and skip the queue.', url: 'https://campuseats.example.com', repoUrl: 'https://github.com/example/campuseats', category: 'WEB_APP', techStack: ['Next.js', 'Node', 'MongoDB'], tags: ['food', 'campus'], teamMembers: ['Riya', 'Aditya'], clubId: gdg.id, clubName: gdg.name, createdById: student.id, createdByName: student.name, status: 'APPROVED', featured: true, approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2) },
      { title: 'NoteNest', tagline: 'Shared notes for every course', description: 'A collaborative notes platform where learners share and rate course notes.', url: 'https://notenest.example.com', category: 'WEBSITE', techStack: ['React', 'Firebase'], tags: ['notes', 'study'], teamMembers: ['Kabir'], clubId: sast.id, clubName: sast.name, createdById: headOf('SAST').id, createdByName: headOf('SAST').name, status: 'APPROVED', approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1) },
      { title: 'ClanClash', tagline: 'A game to boost clan spirit', description: 'A browser mini-game where clans compete in weekly challenges for points.', repoUrl: 'https://github.com/example/clanclash', category: 'GAME', techStack: ['Phaser', 'TypeScript'], tags: ['game', 'clans'], teamMembers: ['Meera'], createdById: marathaHead.id, createdByName: marathaHead.name, status: 'PENDING' },
      { title: 'GreenTrack', tagline: 'Track campus sustainability', description: 'A dashboard visualising campus energy and waste metrics for SAGE.', category: 'RESEARCH', techStack: ['Python', 'Streamlit'], tags: ['sustainability'], teamMembers: ['Sana', 'Riya'], clubId: clubByName['SAGE'].id, clubName: 'SAGE', createdById: student.id, createdByName: student.name, status: 'PENDING' },
    ],
  });

  console.info('[seed] ✅ done — real LXOS dataset (clubs/clans/rooms/admins) + demo layer seeded.');
}

main()
  .catch((e) => {
    console.error('[seed] failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
