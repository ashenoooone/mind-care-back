import { PrismaClient, SupportStatus } from '@prisma/client';

export async function createSupportRequests(prisma: PrismaClient) {
  const existingRequests = await prisma.supportRequest.findMany();
  if (existingRequests.length === 0) {
    console.log('Создаем запросы в поддержку, так как их пока нет...');

    const user = await prisma.user.findFirst();
    if (!user) {
      console.error(
        'Пользователь не найден. Пожалуйста, создайте пользователя перед запуском этого скрипта.',
      );
      return;
    }

    await prisma.supportRequest.createMany({
      data: [
        {
          clientId: user.id,
          description:
            'Проблема с записью на консультацию. Время не совпадает с выбранным.',
          status: SupportStatus.PENDING,
        },
        {
          clientId: user.id,
          description:
            'Не удается войти в систему через Telegram. Требуется помощь.',
          status: SupportStatus.IN_PROGRESS,
        },
        {
          clientId: user.id,
          description: 'Запрос на изменение времени консультации.',
          status: SupportStatus.RESOLVED,
        },
      ],
    });
  }
}
