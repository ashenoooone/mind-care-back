import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function createServerSettings(prisma: PrismaClient) {
  await prisma.serverSettings.create({
    data: {
      adminTimezone: 'Europe/Moscow',
      adminToken: randomUUID(),
    },
  });
}
