import { AppointmentStatus, Prisma, PrismaClient } from '@prisma/client';
import { addDays, addMinutes } from 'date-fns';

export async function createAppointments(prisma: PrismaClient) {
  const existingAppointments = await prisma.appointment.findMany();
  if (existingAppointments.length === 0) {
    console.log('Создаем 1000 записей на консультацию, так как их пока нет...');

    const users = await prisma.user.findMany();
    const services = await prisma.service.findMany();

    if (users.length === 0 || services.length === 0) {
      console.error(
        'Пользователи или услуги не найдены. Пожалуйста, создайте их перед запуском этого скрипта.',
      );
      return;
    }

    const appointments: Prisma.AppointmentCreateManyInput[] = [];

    for (let i = 0; i < 1000; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomService =
        services[Math.floor(Math.random() * services.length)];

      const startTime = addDays(new Date(), Math.floor(Math.random() * 30));
      const endTime = addMinutes(startTime, randomService.duration || 1);

      appointments.push({
        clientId: randomUser.id,
        serviceId: randomService.id,
        startTime: startTime,
        endTime: endTime,
        status: AppointmentStatus.SCHEDULED,
      });
    }

    try {
      await prisma.appointment.createMany({
        data: appointments,
      });
      console.log('1000 записей успешно созданы.');
    } catch (error) {
      console.error('Ошибка при создании записей:', error);
    }
  } else {
    console.log('Записи уже существуют. Скрипт пропущен.');
  }
}
