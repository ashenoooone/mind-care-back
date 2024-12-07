import { PrismaClient } from '@prisma/client';
import { createServices } from './create-services';
import { createServerSettings } from './create-server-settings';
import { createUsers } from './create-users';
import { createSupportRequests } from './create-support-request';
import { createAppointments } from './create-appointments';
import { createWorkingSchedule } from './create-working-schedule';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.workingSchedule.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.serverSettings.deleteMany();
  await prisma.service.deleteMany();
}

async function main() {
  await clearDatabase();
  await createServices(prisma);
  await createServerSettings(prisma);
  await createUsers(prisma);
  await createSupportRequests(prisma);
  await createAppointments(prisma);
  await createWorkingSchedule(prisma);
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
