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

    // Возможные заметки
    const possibleNotes = [
      '# **Важно!** Клиент просил перезвонить за час до приема. *Подготовить всю документацию заранее*. Требуется уточнить актуальный номер телефона. `Предварительно согласовать план консультации`.',
      '# **Повторный прием** с подробным обсуждением результатов предыдущего визита. *Необходимо подготовить сравнительный анализ*. Пациент отмечает улучшение состояния. `Запланировать следующий этап лечения`.',
      '# **Особый случай**: пациент с ограниченными возможностями. *Требуется помощь при передвижении*. Подготовить специальное оборудование. `Выделить дополнительное время на прием`.',
      '# **Внимание!** У пациента множественные аллергические реакции. *См. подробный список в медкарте*. Требуется консультация аллерголога. `Исключить применение препаратов из группы риска`.',
      '# **Первичная консультация** с полным обследованием. *Подготовить все диагностическое оборудование*. Запланировать расширенный анамнез. `Предусмотреть время для подробных объяснений`.',
      '# **Срочная подготовка документов**. *Направления на анализы подготовить заранее*. Проверить наличие всех необходимых бланков. `Согласовать график сдачи анализов`.',
      '# **Информация по опозданию**: задержка 10 минут. *Клиент предупредил по телефону*. Скорректировать график приема. `Подготовить кабинет к ускоренной консультации`.',
      '# **Техническая подготовка**: требуется особая настройка оборудования. *Проверить калибровку всех приборов*. Подготовить дополнительные инструменты. `Провести тестовый запуск до приема`.',
      '# **Рекомендация** от доктора Иванова И.И. *Ознакомиться с предварительным заключением коллеги*. Подготовить план совместного ведения. `Согласовать протокол лечения`.',
      '# **Сложный случай**: множественные хронические заболевания. *Требуется консилиум специалистов*. Подготовить выписки из всех клиник. `Составить комплексный план лечения`.',
      '# **Контрольный осмотр** после курса лечения. *Подготовить результаты всех анализов*. Оценить динамику состояния. `Скорректировать план дальнейшего лечения`.',
      '# **Особые требования**: пациент просит детальные разъяснения. *Подготовить наглядные материалы*. Выделить время на вопросы. `Составить письменные рекомендации`.',
      '# **Международный пациент**: требуется перевод. *Подготовить документы на двух языках*. Пригласить переводчика на прием. `Учесть культурные особенности`.',
      '# **Подготовка к приему**: собрать историю исследований. *Систематизировать результаты по датам*. Подготовить сравнительный анализ. `Отметить ключевые изменения`.',
      '# **Специальные условия** по времени приема. *Учесть график работы пациента*. Предусмотреть возможность переноса. `Согласовать удобное время`.',
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
        const randomNote =
          possibleNotes[Math.floor(Math.random() * possibleNotes.length)];

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
          note: randomNote,
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
