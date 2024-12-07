import { PrismaClient, WorkingSchedule } from '@prisma/client';

export async function createWorkingSchedule(prisma: PrismaClient) {
  const items: Omit<WorkingSchedule, 'id'>[] = [
    {
      startHour: 9,
      endHour: 18,
      dayOfWeek: 0,
      isWorking: true,
    },
    {
      startHour: 9,
      endHour: 18,
      dayOfWeek: 1,
      isWorking: true,
    },
    {
      startHour: 9,
      endHour: 18,
      dayOfWeek: 2,
      isWorking: true,
    },
    {
      startHour: 9,
      endHour: 18,
      dayOfWeek: 3,
      isWorking: true,
    },
    {
      startHour: 9,
      endHour: 18,
      dayOfWeek: 4,
      isWorking: true,
    },
    {
      startHour: 9,
      endHour: 16,
      dayOfWeek: 5,
      isWorking: true,
    },
  ];

  await prisma.workingSchedule.createMany({
    data: items,
  });
}
