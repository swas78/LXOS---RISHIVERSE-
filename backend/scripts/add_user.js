import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.lxMember.upsert({
    where: { email: 'swastikmishra2025@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      referenceId: 'ADMIN-SWASTIK',
      email: 'swastikmishra2025@gmail.com',
      displayName: 'Swastik (Admin)',
      role: 'ADMIN'
    }
  });
  console.log('User added successfully');
}

main().finally(() => prisma.$disconnect());
