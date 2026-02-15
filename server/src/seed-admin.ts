import dotenv from 'dotenv';
import { Status } from '@prisma/client';
import { prisma } from './prisma';

dotenv.config();

async function main() {
  console.log('Seeding admin user...');

  const user = await prisma.user.upsert({
    where: { username: 'officer' },
    update: {
      passwordHash: 'admin123',
      role: 'Officer',
      status: Status.Active,
    },
    create: {
      id: 'U-OFFICER',
      username: 'officer',
      passwordHash: 'admin123',
      role: 'Officer',
      status: Status.Active,
    },
  });

  console.log(`Admin seed complete. Username: ${user.username}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
