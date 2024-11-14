import { PrismaClient } from '@prisma/client';
import { createServices } from './create-services';
import { createServerSettings } from './create-server-settings';
import { createUsers } from './create-users';

const prisma = new PrismaClient();

async function main() {
  await createServices(prisma);
  await createServerSettings(prisma);
  await createUsers(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
