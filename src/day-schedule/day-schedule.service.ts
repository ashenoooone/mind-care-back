import { Injectable } from '@nestjs/common';
import { CreateDayScheduleDto } from './dto/create-day-schedule.dto';
import { UpdateDayScheduleDto } from './dto/update-day-schedule.dto';
import { DatabaseService } from 'src/database/database.service';
import { GetAvailableDays } from './dto/get-available-days.dto';
import {
  addHours,
  addMinutes,
  eachDayOfInterval,
  isEqual,
  startOfDay,
} from 'date-fns';

@Injectable()
export class DayScheduleService {
  constructor(private readonly db: DatabaseService) {}

  async create(createDayScheduleDto: CreateDayScheduleDto) {
    const { date, startHour, endHour } = createDayScheduleDto;

    const newDaySchedule = await this.db.daySchedule.create({
      data: {
        date,
        startHour,
        endHour,
      },
    });

    return newDaySchedule;
  }

  async findAll() {
    const daySchedules = await this.db.daySchedule.findMany();
    return daySchedules;
  }

  async update(id: number, updateDayScheduleDto: UpdateDayScheduleDto) {
    const { date, startHour, endHour } = updateDayScheduleDto;

    const updatedDaySchedule = await this.db.daySchedule.update({
      where: { id },
      data: {
        date,
        startHour,
        endHour,
      },
    });

    return updatedDaySchedule;
  }

  async remove(id: number) {
    const deletedDaySchedule = await this.db.daySchedule.delete({
      where: { id: Number(id) },
    });

    return deletedDaySchedule;
  }

  async getAvailableDays(params: GetAvailableDays) {
    const fromDate = new Date(params.fromDate);
    const toDate = new Date(params.toDate);

    const days = eachDayOfInterval({
      start: fromDate,
      end: toDate,
    });

    const [service, workingDays, appointments, holidays] = await Promise.all([
      this.db.service.findFirst({
        orderBy: {
          duration: 'asc',
        },
      }),
      this.db.workingSchedule.findMany(),
      this.db.appointment.findMany({
        where: {
          startTime: {
            gte: fromDate,
            lte: toDate,
          },
        },
      }),
      this.db.nonWorkingDay.findMany({
        where: {
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
      }),
    ]);

    const holidayDates = holidays.map((holiday) => startOfDay(holiday.date));

    const daysWithoutHolidays = days.filter(
      (day) =>
        !holidayDates.some((holiday) => isEqual(startOfDay(day), holiday)),
    );

    const workingDaysMap = new Map(
      workingDays.map((wd) => [wd.dayOfWeek + 1, wd]),
    );

    const availableDays = daysWithoutHolidays.filter((day) => {
      const workingDay = workingDaysMap.get(day.getDay());

      if (!workingDay) return false;

      const latestAppointment = appointments.reduce((latest, current) => {
        if (!isEqual(startOfDay(current.endTime), startOfDay(day)))
          return latest;
        if (!latest) return current;
        return current.startTime > latest.startTime ? current : latest;
      }, null);

      if (!latestAppointment) return true;

      const endOfDay = addHours(startOfDay(day), workingDay.endHour);
      const serviceDuration = service?.duration || 0;
      console.log(
        day,
        endOfDay,
        serviceDuration,
        latestAppointment.endTime,
        endOfDay > addMinutes(latestAppointment.endTime, serviceDuration),
      );

      return endOfDay > addMinutes(latestAppointment.endTime, serviceDuration);
    });

    return availableDays;
  }
}
