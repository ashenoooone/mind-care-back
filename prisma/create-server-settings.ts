import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function createServerSettings(prisma: PrismaClient) {
  const existingSettings = await prisma.serverSettings.findFirst();
  if (!existingSettings)
    await prisma.serverSettings.create({
      data: {
        adminTimezone: 0,
        adminToken: randomUUID(),
      },
    });
}
