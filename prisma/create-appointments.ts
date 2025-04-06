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
      'Важно! Клиент просит перезвонить заранее. *Документы подготовлены*. **Постоянно испытывает тревогу при нарушении распорядка. Избегает спонтанных задач и чувствует себя дезориентированным.**',
      'Повторная консультация. *Сравнение результатов*. **Пациент боится, что улучшение временное. Высокая тревожность, фиксируется на симптомах, ищет контроль.**',
      'Клиент с физическими ограничениями. *Помощь при передвижении*. **Испытывает чувство неполноценности, избегает взаимодействия. Выраженная тревожность и сниженная самооценка.**',
      'Уточнение по аллергии. *Список реакций в карте*. **Клиент избегает общественных мест, ощущает постоянную угрозу, развивается генерализованная тревога.**',
      'Первичное обращение. *Анамнез и осмотр*. **Жалуется на хроническую усталость, проблемы со сном, потерю энергии и интереса к жизни. Признаки депрессии.**',
      'Подготовка документов. *Согласование сроков*. **Откладывает все задачи до последнего момента. Часто срывает сроки. Явная прокрастинация.**',
      'Клиент опаздывает. *Уточнение графика*. **Ощущает вину, боится негативной оценки, тревожится из-за опозданий, просит прощения.**',
      'Техническая подготовка. *Проверка оборудования*. **Беспокойство по поводу возможной ошибки. Чрезмерная самокритика. Страх провала.**',
      'Рекомендация от коллеги. *Согласование протокола*. **Сомневается в себе, боится не соответствовать ожиданиям других специалистов. Низкая самооценка.**',
      'Хронические заболевания. *Комплексный подход*. **Жалуется на ощущение безнадежности, нет веры в улучшение. Поведение пассивное. Признаки выученной беспомощности.**',
      'Контроль лечения. *Анализы готовы*. **Клиент одержим оценкой результата. Страх, что эффекта нет. Часто говорит о «провале лечения».**',
      'Просьба о пояснениях. *Подготовка материалов*. **Сильно тревожится при недостатке информации. Нуждается в контроле. Проявляет перфекционизм.**',
      'Пациент-иностранец. *Двухъязычные документы*. **Ощущает изоляцию, говорит о трудностях понимания и одиночестве. Адаптация идёт тяжело.**',
      'Сбор истории. *Хронология симптомов*. **Постоянно пересматривает анализы, ищет подтверждение болезни. Ипохондрические черты. Высокий уровень тревожности.**',
      'Нестандартное время приёма. *Коррекция под клиента*. **Говорит о тотальной усталости, не успевает восстанавливаться, эмоциональное выгорание.**',
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
