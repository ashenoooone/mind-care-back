import { PrismaClient } from '@prisma/client';

export async function createUsers(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ id: 1 }, { id: 2 }],
    },
  });

  if (users.length === 0)
    await prisma.user.createMany({
      data: [
        {
          name: 'Roman',
          telegramId: 1,
          timezone: 1,
          tgNickname: 'ashenoooone',
          phoneNumber: '79018072197',
          id: 1,
        },
        {
          name: 'Denis',
          telegramId: 2,
          timezone: 2,
          tgNickname: 'denisey',
          phoneNumber: '78005553535',
          id: 2,
        },
      ],
    });
}
