// Local-only seed for LX rooms. NOT part of handoff (ad-hoc script).
// Usage: node scripts/seedLxRooms.js
// Generates ~57 rooms across buildings, matching the LXOS manual ("57 rooms").
import 'dotenv/config';
import prisma from '../services/prismaClient.js';

const AMENITY_SETS = [
  ['PROJECTOR', 'WHITEBOARD', 'AC'],
  ['PROJECTOR', 'AC', 'WIFI'],
  ['WHITEBOARD', 'AC'],
  ['PROJECTOR', 'SOUND_SYSTEM', 'MIC', 'STAGE', 'AC'],
  ['WHITEBOARD', 'POWER_OUTLETS', 'WIFI'],
  ['PROJECTOR', 'WHITEBOARD', 'AC', 'POWER_OUTLETS'],
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildRooms() {
  const rooms = [];

  // Academic Block A — 24 classrooms
  for (let i = 1; i <= 24; i += 1) {
    rooms.push({
      name: `Classroom A-${100 + i}`,
      building: 'Academic Block A',
      floor: i <= 12 ? 'Ground' : 'First',
      capacity: 40 + (i % 4) * 10,
      type: 'CLASSROOM',
      amenities: pick(AMENITY_SETS, i),
    });
  }

  // Academic Block B — 12 classrooms + labs
  for (let i = 1; i <= 8; i += 1) {
    rooms.push({
      name: `Classroom B-${200 + i}`,
      building: 'Academic Block B',
      floor: 'Second',
      capacity: 30 + (i % 3) * 15,
      type: 'CLASSROOM',
      amenities: pick(AMENITY_SETS, i + 2),
    });
  }
  for (let i = 1; i <= 4; i += 1) {
    rooms.push({
      name: `Computer Lab ${i}`,
      building: 'Academic Block B',
      floor: 'First',
      capacity: 60,
      type: 'LAB',
      amenities: ['PROJECTOR', 'AC', 'POWER_OUTLETS', 'WIFI'],
    });
  }

  // Seminar halls — 8
  for (let i = 1; i <= 8; i += 1) {
    rooms.push({
      name: `Seminar Hall ${i}`,
      building: 'Central Building',
      floor: i <= 4 ? 'Ground' : 'First',
      capacity: 80 + (i % 3) * 40,
      type: 'SEMINAR',
      amenities: ['PROJECTOR', 'SOUND_SYSTEM', 'MIC', 'AC', 'WIFI'],
    });
  }

  // Auditoriums — 3
  ['Main Auditorium', 'Mini Auditorium', 'Open Air Theatre'].forEach((name, i) => {
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
    });
  });

  // Meeting rooms — 6
  for (let i = 1; i <= 6; i += 1) {
    rooms.push({
      name: `Meeting Room ${i}`,
      building: 'Admin Block',
      floor: i <= 3 ? 'First' : 'Second',
      capacity: 10 + (i % 3) * 6,
      type: 'MEETING',
      amenities: ['WHITEBOARD', 'AC', 'WIFI'],
    });
  }

  // Studios — 4
  ['Music Studio', 'Dance Studio', 'Media Studio', 'Design Studio'].forEach((name) => {
    rooms.push({
      name,
      building: 'Arts Block',
      floor: 'Ground',
      capacity: 25,
      type: 'STUDIO',
      amenities: ['SOUND_SYSTEM', 'AC', 'POWER_OUTLETS'],
    });
  });

  return rooms; // 24 + 8 + 4 + 8 + 3 + 6 + 4 = 57
}

async function main() {
  const rooms = buildRooms();
  const existing = await prisma.lxRoom.count();
  if (existing > 0) {
    console.info(`[seed] lx_rooms already has ${existing} rows — skipping. `);
    console.info('[seed] To reseed, clear the table first.');
    return;
  }
  const result = await prisma.lxRoom.createMany({ data: rooms });
  console.info(`[seed] inserted ${result.count} rooms.`);
}

main()
  .catch((e) => {
    console.error('[seed] failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
