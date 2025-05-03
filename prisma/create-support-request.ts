import { PrismaClient, SupportStatus } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ru';

export async function createSupportRequests(prisma: PrismaClient) {
  const existingRequests = await prisma.supportRequest.findMany();

  if (existingRequests.length === 0) {
    console.log('Создаем запросы в поддержку, так как их пока нет...');

    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.error(
        'Пользователи не найдены. Пожалуйста, создайте пользователей перед запуском этого скрипта.',
      );
      return;
    }

    const supportRequests = Array.from({ length: 100 }, () => {
      const randomUser = faker.helpers.arrayElement(users);

      return {
        clientId: randomUser.id,
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement([
          SupportStatus.PENDING,
          SupportStatus.IN_PROGRESS,
          SupportStatus.RESOLVED,
        ]),
      };
    });

    await prisma.supportRequest.createMany({
      data: supportRequests,
    });

    console.log('100 support requests created successfully');
  } else {
    console.log('Support requests already exist');
  }
}
