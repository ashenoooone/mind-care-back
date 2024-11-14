import { AppointmentStatus, Prisma, PrismaClient } from '@prisma/client';
import { addDays, addHours } from 'date-fns';

export async function createAppointments(prisma: PrismaClient) {
  const existingAppointments = await prisma.appointment.findMany();
  if (existingAppointments.length === 0) {
    console.log('Создаем 10 записей на консультацию, так как их пока нет...');

    const users = await prisma.user.findMany();
    const services = await prisma.service.findMany();
    if (users.length === 0 || services.length === 0) {
      console.error(
        'Пользователи или услуги не найдены. Пожалуйста, создайте их перед запуском этого скрипта.',
      );
      return;
    }

    const appointments: Prisma.AppointmentCreateManyInput[] = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomService =
        services[Math.floor(Math.random() * services.length)];

      const startTime = addDays(new Date(), Math.floor(Math.random() * 30));
      const endTime = addHours(startTime, randomService.duration || 1);

      appointments.push({
        clientId: randomUser.id,
        serviceId: randomService.id,
        startTime: startTime,
        endTime: endTime,
        status: AppointmentStatus.SCHEDULED,
      });
    }
    await prisma.appointment.createMany({
      data: appointments,
    });
  }
}
