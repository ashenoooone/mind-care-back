import { AppointmentStatus, Prisma, PrismaClient } from '@prisma/client';
import {
  addDays,
  setHours,
  setMinutes,
  addMinutes,
  startOfWeek,
} from 'date-fns';

export async function createAppointments(prisma: PrismaClient) {
  const existingAppointments = await prisma.appointment.findMany();

  if (existingAppointments.length === 0) {
    console.log('Создаем записи на консультацию на текущую неделю...');

    const users = await prisma.user.findMany();
    const services = await prisma.service.findMany();

    if (users.length === 0 || services.length === 0) {
      console.error(
        'Пользователи или услуги не найдены. Пожалуйста, создайте их перед запуском этого скрипта.',
      );
      return;
    }

    const appointments: Prisma.AppointmentCreateManyInput[] = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Начало текущей недели (понедельник)
    const daysInPeriod = 5; // Понедельник - Пятница

    // Возможные статусы
    const statuses = [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
    ];

    for (let day = 0; day < daysInPeriod; day++) {
      const dayDate = addDays(startDate, day);

      // Случайное количество записей для этого дня (от 3 до 8)
      const dailyAppointmentsCount = Math.floor(Math.random() * 6) + 3;

      let currentStartTime = setHours(setMinutes(dayDate, 0), 9); // Начало рабочего дня: 09:00

      for (let i = 0; i < dailyAppointmentsCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService =
          services[Math.floor(Math.random() * services.length)];

        const endTime = addMinutes(
          currentStartTime,
          randomService.duration || 30,
        );

        appointments.push({
          clientId: randomUser.id,
          serviceId: randomService.id,
          startTime: currentStartTime,
          endTime: endTime,
          status: statuses[Math.floor(Math.random() * statuses.length)], // Случайный статус
        });

        // Следующая запись начинается через 15 минут после завершения текущей
        currentStartTime = addMinutes(endTime, 15);
      }
    }

    try {
      await prisma.appointment.createMany({
        data: appointments,
      });
      console.log(
        `${appointments.length} записей успешно созданы на текущую рабочую неделю.`,
      );
    } catch (error) {
      console.error('Ошибка при создании записей:', error);
    }
  } else {
    console.log('Записи уже существуют. Скрипт пропущен.');
  }
}
