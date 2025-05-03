import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ru';
export async function createUsers(prisma: PrismaClient) {
  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [{ id: 1 }, { id: 2 }],
    },
  });

  if (existingUsers.length === 0) {
    const fixedUsers = [
      {
        name: 'Roman',
        telegramId: 943091362,
        timezone: 943091362,
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
    ];

    const randomUsers = Array.from({ length: 38 }, (_, i) => ({
      name: faker.person.fullName(),
      telegramId: i + 3, // Начинаем с ID = 3
      timezone: faker.number.int({ min: 0, max: 7 }),
      tgNickname: faker.helpers.arrayElement(['ashenoooone', 'denisey']), // Никнеймы повторяются
      phoneNumber: faker.helpers.fromRegExp(/79[0-9]{9}/),
      id: i + 3, // ID синхронизирован с telegramId
    }));

    await prisma.user.createMany({
      data: [...fixedUsers, ...randomUsers],
    });

    console.log('40 users created successfully');
  } else {
    console.log('Users already exist');
  }
}
