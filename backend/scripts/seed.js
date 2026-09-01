// Master LX seed — LOCAL ONLY, not part of handoff.
// Clears all LX tables and inserts a coherent, demoable dataset.
// Usage: node scripts/seed.js
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

const AMENITY_SETS = [
  ['PROJECTOR', 'WHITEBOARD', 'AC'],
  ['PROJECTOR', 'AC', 'WIFI'],
  ['WHITEBOARD', 'AC'],
  ['PROJECTOR', 'SOUND_SYSTEM', 'MIC', 'STAGE', 'AC'],
  ['WHITEBOARD', 'POWER_OUTLETS', 'WIFI'],
  ['PROJECTOR', 'WHITEBOARD', 'AC', 'POWER_OUTLETS'],
];
const pick = (arr, i) => arr[i % arr.length];

function buildRooms() {
  const rooms = [];
  for (let i = 1; i <= 24; i += 1)
    rooms.push({
      name: `Classroom A-${100 + i}`,
      building: 'Academic Block A',
      floor: i <= 12 ? 'Ground' : 'First',
      capacity: 40 + (i % 4) * 10,
      type: 'CLASSROOM',
      amenities: pick(AMENITY_SETS, i),
    });
  for (let i = 1; i <= 8; i += 1)
    rooms.push({
      name: `Classroom B-${200 + i}`,
      building: 'Academic Block B',
      floor: 'Second',
      capacity: 30 + (i % 3) * 15,
      type: 'CLASSROOM',
      amenities: pick(AMENITY_SETS, i + 2),
    });
  for (let i = 1; i <= 4; i += 1)
    rooms.push({
      name: `Computer Lab ${i}`,
      building: 'Academic Block B',
      floor: 'First',
      capacity: 60,
      type: 'LAB',
      amenities: ['PROJECTOR', 'AC', 'POWER_OUTLETS', 'WIFI'],
    });
  for (let i = 1; i <= 8; i += 1)
    rooms.push({
      name: `Seminar Hall ${i}`,
      building: 'Central Building',
      floor: i <= 4 ? 'Ground' : 'First',
      capacity: 80 + (i % 3) * 40,
      type: 'SEMINAR',
      amenities: ['PROJECTOR', 'SOUND_SYSTEM', 'MIC', 'AC', 'WIFI'],
    });
  ['Main Auditorium', 'Mini Auditorium', 'Open Air Theatre'].forEach((name, i) =>
    rooms.push({
      name,
      building: name.includes('Open Air') ? 'Amphitheatre Grounds' : 'Central Building',
      floor: 'Ground',
      capacity: name === 'Main Auditorium' ? 800 : name === 'Mini Auditorium' ? 250 : 500,
      type: name.includes('Open Air') ? 'OUTDOOR' : 'AUDITORIUM',
      amenities:
        i === 2
          ? ['STAGE', 'SOUND_SYSTEM', 'MIC']
          : ['PROJECTOR', 'SOUND_SYSTEM', 'MIC', 'STAGE', 'AC', 'WIFI'],
    }),
  );
  for (let i = 1; i <= 6; i += 1)
    rooms.push({
      name: `Meeting Room ${i}`,
      building: 'Admin Block',
      floor: i <= 3 ? 'First' : 'Second',
      capacity: 10 + (i % 3) * 6,
      type: 'MEETING',
      amenities: ['WHITEBOARD', 'AC', 'WIFI'],
    });
  ['Music Studio', 'Dance Studio', 'Media Studio', 'Design Studio'].forEach((name) =>
    rooms.push({
      name,
      building: 'Arts Block',
      floor: 'Ground',
      capacity: 25,
      type: 'STUDIO',
      amenities: ['SOUND_SYSTEM', 'AC', 'POWER_OUTLETS'],
    }),
  );
  return rooms;
}

const CLUBS = [
  { name: 'Arthakram', category: 'ACADEMIC', budgetAllocated: 20000, budgetSpent: 9000, description: 'The finance and entrepreneurship club — markets, startups, and money.' },
  { name: 'Codecel', category: 'TECHNICAL', budgetAllocated: 18000, budgetSpent: 6200, description: 'Competitive programming and software engineering club.' },
  { name: 'Rangmanch', category: 'CULTURAL', budgetAllocated: 15000, budgetSpent: 8100, description: 'Theatre and dramatics society.' },
  { name: 'Sur Taal', category: 'CULTURAL', budgetAllocated: 14000, budgetSpent: 4300, description: 'Music club — vocals, instruments, and production.' },
  { name: 'Kalakriti', category: 'CULTURAL', budgetAllocated: 12000, budgetSpent: 3000, description: 'Fine arts and design collective.' },
  { name: 'Vega Sports', category: 'SPORTS', budgetAllocated: 22000, budgetSpent: 12500, description: 'Athletics and team sports.' },
  { name: 'Debsoc', category: 'ACADEMIC', budgetAllocated: 10000, budgetSpent: 2600, description: 'Debating and public speaking society.' },
  { name: 'Lens', category: 'TECHNICAL', budgetAllocated: 9000, budgetSpent: 2100, description: 'Photography and film-making club.' },
  { name: 'Prakriti', category: 'SOCIAL', budgetAllocated: 8000, budgetSpent: 1500, description: 'Environment and sustainability club.' },
  { name: 'Innovate', category: 'TECHNICAL', budgetAllocated: 16000, budgetSpent: 5400, description: 'Robotics, hardware, and maker projects.' },
  { name: 'Prayaas', category: 'SOCIAL', budgetAllocated: 6000, budgetSpent: 1200, description: 'Community service and social outreach.' },
];

async function clearAll() {
  // Order respects FK (point history → clan). Others are FK-free.
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
  console.info(`[seed] rooms: ${rooms.length}`);

  // ---- Clans ----
  for (const c of LX_CLANS) {
    await prisma.lxClan.create({
      data: {
        name: c.name,
        color: c.color,
        points: 0,
        budgetAllocated: 15000,
        budgetSpent: 0,
        semester: SEM,
        description: `${c.name} clan — friendly campus-wide competition.`,
      },
    });
  }
  const clans = await prisma.lxClan.findMany();
  const clanByName = Object.fromEntries(clans.map((c) => [c.name, c]));

  // ---- Clubs ----
  for (const club of CLUBS) {
    await prisma.lxClub.create({
      data: { ...club, semester: SEM, isActive: true },
    });
  }
  const clubs = await prisma.lxClub.findMany();
  const clubByName = Object.fromEntries(clubs.map((c) => [c.name, c]));

  // ---- Dev users (one per role; heads linked to a club/clan) ----
  const users = [
    { name: 'Aarav Admin', email: 'admin@rishihood.edu.in', role: 'ADMIN' },
    { name: 'Lakshmi (LX Team)', email: 'lx@rishihood.edu.in', role: 'LX_TEAM' },
    { name: 'Kabir (Arthakram Head)', email: 'kabir@rishihood.edu.in', role: 'CLUB_HEAD', clubId: clubByName['Arthakram'].id },
    { name: 'Meera (Maratha Head)', email: 'meera@rishihood.edu.in', role: 'CLAN_HEAD', clanId: clanByName['Maratha'].id },
    { name: 'Farah (Finance)', email: 'finance@rishihood.edu.in', role: 'FINANCE' },
    { name: 'Riya (Student)', email: 'riya@nst.rishihood.edu.in', role: 'GUEST' },
  ];
  for (const u of users) await prisma.lxUser.create({ data: u });
  const seededUsers = await prisma.lxUser.findMany();
  const admin = seededUsers.find((u) => u.role === 'ADMIN');
  const clubHead = seededUsers.find((u) => u.role === 'CLUB_HEAD');
  const clanHead = seededUsers.find((u) => u.role === 'CLAN_HEAD');
  const student = seededUsers.find((u) => u.role === 'GUEST');
  console.info(`[seed] users: ${seededUsers.length}, clubs: ${clubs.length}, clans: ${clans.length}`);

  const roomByName = Object.fromEntries(rooms.map((r) => [r.name, r]));
  const audi = roomByName['Main Auditorium'];
  const seminar1 = roomByName['Seminar Hall 1'];
  const openair = roomByName['Open Air Theatre'];

  // ---- Events ----
  const arthakram = clubByName['Arthakram'];
  const codecel = clubByName['Codecel'];
  const rangmanch = clubByName['Rangmanch'];
  const eventsData = [
    {
      title: 'Arthakram Finance Summit', description: 'A day of talks on markets and startups.', type: 'CLUB',
      clubId: arthakram.id, clubName: arthakram.name, startDate: daysFromNow(5, 10), endDate: daysFromNow(5, 17),
      roomIds: [audi.id], roomNames: [audi.name], budgetAllocated: 8000, budgetSpent: 3500, status: 'APPROVED',
      createdById: clubHead.id, createdByName: clubHead.name, createdByRole: 'CLUB_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2), attendees: 220,
    },
    {
      title: 'CodeSprint Hackathon', description: '24-hour coding competition.', type: 'CLUB',
      clubId: codecel.id, clubName: codecel.name, startDate: daysFromNow(9, 9), endDate: daysFromNow(10, 9),
      roomIds: [roomByName['Computer Lab 1'].id, roomByName['Computer Lab 2'].id],
      roomNames: ['Computer Lab 1', 'Computer Lab 2'], budgetAllocated: 12000, budgetSpent: 0, status: 'PENDING',
      createdById: clubHead.id, createdByName: clubHead.name, createdByRole: 'CLUB_HEAD', attendees: 150,
    },
    {
      title: 'Rangmanch Annual Play', description: 'The flagship theatre production.', type: 'CLUB',
      clubId: rangmanch.id, clubName: rangmanch.name, startDate: daysFromNow(14, 18), endDate: daysFromNow(14, 21),
      roomIds: [audi.id], roomNames: [audi.name], budgetAllocated: 15000, budgetSpent: 8100, status: 'APPROVED',
      createdById: clubHead.id, createdByName: clubHead.name, createdByRole: 'CLUB_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), attendees: 400,
    },
    {
      title: 'Clan Sports Meet', description: 'Inter-clan athletics championship.', type: 'CLAN',
      clanId: clanByName['Maratha'].id, clanName: 'Maratha', startDate: daysFromNow(3, 8), endDate: daysFromNow(3, 16),
      roomIds: [openair.id], roomNames: [openair.name], location: 'Sports Ground', budgetAllocated: 10000, budgetSpent: 4200,
      status: 'APPROVED', createdById: clanHead.id, createdByName: clanHead.name, createdByRole: 'CLAN_HEAD',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-3), attendees: 300,
    },
    {
      title: 'Freshers Fest 2026', description: 'Campus-wide welcome fest.', type: 'FEST',
      startDate: daysFromNow(20, 16), endDate: daysFromNow(20, 22), roomIds: [audi.id, openair.id],
      roomNames: [audi.name, openair.name], budgetAllocated: 40000, budgetSpent: 12000, status: 'APPROVED',
      createdById: admin.id, createdByName: admin.name, createdByRole: 'ADMIN',
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), attendees: 900,
    },
    {
      title: 'LX Orientation', description: 'Onboarding for new club and clan heads.', type: 'LX',
      startDate: daysFromNow(1, 11), endDate: daysFromNow(1, 13), roomIds: [seminar1.id], roomNames: [seminar1.name],
      budgetAllocated: 3000, budgetSpent: 900, status: 'APPROVED', createdById: admin.id, createdByName: admin.name,
      createdByRole: 'ADMIN', approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-4), attendees: 60,
    },
  ];
  for (const e of eventsData) await prisma.lxEvent.create({ data: e });
  const events = await prisma.lxEvent.findMany();
  console.info(`[seed] events: ${events.length}`);

  // ---- Achievements (approved + pending) & club updates ----
  const achData = [
    {
      title: 'National Finance Case Win', description: 'Arthakram team won the national B-school case competition.',
      clubId: arthakram.id, clubName: arthakram.name, points: 50, category: 'ACADEMIC', kind: 'ACHIEVEMENT',
      participants: ['Kabir', 'Ananya', 'Dev'], status: 'APPROVED', createdById: clubHead.id, createdByName: clubHead.name,
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2), achievedDate: daysFromNow(-5),
    },
    {
      title: 'Inter-College Hackathon Runners-up', description: 'Codecel placed 2nd at the regional hackathon.',
      clubId: codecel.id, clubName: codecel.name, points: 30, category: 'TECHNICAL', kind: 'ACHIEVEMENT',
      participants: ['Ishan', 'Priya'], status: 'APPROVED', createdById: clubHead.id, createdByName: clubHead.name,
      approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1), achievedDate: daysFromNow(-3),
    },
    {
      title: 'State Athletics Gold', description: 'Maratha clan member won gold in 400m.', clanId: clanByName['Maratha'].id,
      clanName: 'Maratha', points: 20, category: 'SPORTS', kind: 'ACHIEVEMENT', participants: ['Meera'], status: 'APPROVED',
      createdById: clanHead.id, createdByName: clanHead.name, approvedById: admin.id, approvedByName: admin.name,
      approvedAt: daysFromNow(-1), achievedDate: daysFromNow(-2),
    },
    {
      title: 'My Debate Certification', description: 'Completed the advanced parliamentary debate course.', points: 0,
      category: 'ACADEMIC', kind: 'ACHIEVEMENT', participants: ['Riya'], status: 'PENDING', createdById: student.id,
      createdByName: student.name, achievedDate: daysFromNow(-1),
    },
    {
      title: 'Arthakram: New mentorship drive', description: 'We are launching a 1:1 mentorship program this semester.',
      clubId: arthakram.id, clubName: arthakram.name, category: 'SOCIAL', kind: 'UPDATE', status: 'APPROVED',
      createdById: clubHead.id, createdByName: clubHead.name, approvedById: admin.id, approvedByName: admin.name,
      approvedAt: daysFromNow(0), achievedDate: daysFromNow(0),
    },
  ];
  for (const a of achData) await prisma.lxAchievement.create({ data: a });
  console.info('[seed] achievements seeded');

  // ---- Clan points to match approved achievements ----
  const marathaAch = 20;
  await prisma.lxClan.update({ where: { id: clanByName['Maratha'].id }, data: { points: marathaAch, budgetSpent: 4200 } });
  await prisma.lxClanPointTxn.create({
    data: {
      clanId: clanByName['Maratha'].id, delta: marathaAch, points: marathaAch, previousPoints: 0,
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
      { title: 'Maratha Green Campus', description: 'Tree plantation drive.', clanId: clanByName['Maratha'].id, clanName: 'Maratha', status: 'ACTIVE', progress: 60, priority: 'HIGH', team: ['Meera', 'Arjun'], semester: SEM, createdById: clanHead.id, createdByName: clanHead.name },
      { title: 'Vijaya Blood Donation', description: 'Campus blood donation camp.', clanId: clanByName['Vijaya'].id, clanName: 'Vijaya', status: 'PLANNING', progress: 20, priority: 'MEDIUM', team: ['Sana'], semester: SEM },
    ],
  });

  // ---- Expenses (event spend) ----
  const summit = events.find((e) => e.title.includes('Finance Summit'));
  await prisma.lxExpense.createMany({
    data: [
      { eventId: summit.id, eventTitle: summit.title, title: 'Catering for summit', amount: 3500, category: 'FOOD', status: 'APPROVED', submittedById: clubHead.id, submittedByName: clubHead.name, verifiedById: admin.id, verifiedByName: admin.name, verifiedAt: daysFromNow(-1), budgetApplied: true },
      { eventId: summit.id, eventTitle: summit.title, title: 'Banner printing', amount: 1200, category: 'MARKETING', status: 'PENDING', submittedById: clubHead.id, submittedByName: clubHead.name },
    ],
  });

  // ---- Reimbursements (workflow states) ----
  await prisma.lxReimbursement.createMany({
    data: [
      { title: 'Auto fare for vendor pickup', amount: 450, expenseDate: daysFromNow(-4), category: 'TRAVEL', purpose: 'Finance Summit logistics', eventId: summit.id, eventTitle: summit.title, clubId: arthakram.id, clubName: arthakram.name, status: 'PENDING', submittedById: clubHead.id, submittedByName: clubHead.name },
      { title: 'Printing handouts', amount: 800, expenseDate: daysFromNow(-6), category: 'PRINTING', purpose: 'Orientation', clubId: arthakram.id, clubName: arthakram.name, status: 'APPROVED', submittedById: clubHead.id, submittedByName: clubHead.name, reviewedById: admin.id, reviewedByName: admin.name, reviewedAt: daysFromNow(-2) },
      { title: 'Props for play', amount: 2200, expenseDate: daysFromNow(-8), category: 'MATERIALS', purpose: 'Annual Play', clubId: rangmanch.id, clubName: rangmanch.name, status: 'PROCESSED', submittedById: clubHead.id, submittedByName: clubHead.name, reviewedById: admin.id, reviewedByName: admin.name, reviewedAt: daysFromNow(-5), processedById: seededUsers.find((u) => u.role === 'FINANCE').id, processedByName: 'Farah (Finance)', processedAt: daysFromNow(-3), budgetDeducted: true, payoutRef: 'PAYOUT-2026-0001' },
    ],
  });

  // ---- Files ----
  await prisma.lxFile.createMany({
    data: [
      { filename: 'club-constitution.pdf', originalName: 'Arthakram Constitution.pdf', path: '/uploads/arthakram-constitution.pdf', mimeType: 'application/pdf', size: 240000, type: 'DOCUMENT', clubId: arthakram.id, semester: SEM, tags: ['constitution', 'arthakram'], uploadedById: clubHead.id, uploadedByName: clubHead.name },
      { filename: 'summit-report.pdf', originalName: 'Finance Summit Report.pdf', path: '/uploads/summit-report.pdf', mimeType: 'application/pdf', size: 512000, type: 'REPORT', eventId: summit.id, semester: SEM, tags: ['report', 'summit'], uploadedById: admin.id, uploadedByName: admin.name },
    ],
  });

  // ---- Learner Products (mix of approved + pending) ----
  await prisma.lxProduct.createMany({
    data: [
      {
        title: 'CampusEats', tagline: 'Order from campus canteens in taps', description: 'A web app to pre-order food from campus canteens and skip the queue.',
        url: 'https://campuseats.example.com', repoUrl: 'https://github.com/example/campuseats', category: 'WEB_APP',
        techStack: ['Next.js', 'Node', 'MongoDB'], tags: ['food', 'campus'], teamMembers: ['Riya', 'Aditya'],
        createdById: student.id, createdByName: student.name, status: 'APPROVED', featured: true,
        approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-2),
      },
      {
        title: 'NoteNest', tagline: 'Shared notes for every course', description: 'A collaborative notes platform where learners share and rate course notes.',
        url: 'https://notenest.example.com', category: 'WEBSITE', techStack: ['React', 'Firebase'], tags: ['notes', 'study'],
        teamMembers: ['Kabir'], createdById: clubHead.id, createdByName: clubHead.name, status: 'APPROVED',
        approvedById: admin.id, approvedByName: admin.name, approvedAt: daysFromNow(-1),
      },
      {
        title: 'ClanClash', tagline: 'A game to boost clan spirit', description: 'A browser mini-game where clans compete in weekly challenges for points.',
        repoUrl: 'https://github.com/example/clanclash', category: 'GAME', techStack: ['Phaser', 'TypeScript'],
        tags: ['game', 'clans'], teamMembers: ['Meera'], createdById: clanHead.id, createdByName: clanHead.name, status: 'PENDING',
      },
      {
        title: 'GreenTrack', tagline: 'Track campus sustainability', description: 'A dashboard visualising campus energy and waste metrics for the sustainability club.',
        category: 'RESEARCH', techStack: ['Python', 'Streamlit'], tags: ['sustainability'], teamMembers: ['Sana', 'Riya'],
        createdById: student.id, createdByName: student.name, status: 'PENDING',
      },
    ],
  });

  console.info('[seed] ✅ done — full LXOS dataset seeded (incl. learner products).');
}

main()
  .catch((e) => {
    console.error('[seed] failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
