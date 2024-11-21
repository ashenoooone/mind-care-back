import { Injectable } from '@nestjs/common';
import { CreateDayScheduleDto } from './dto/create-day-schedule.dto';
import { UpdateDayScheduleDto } from './dto/update-day-schedule.dto';
import { DatabaseService } from 'src/database/database.service';

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

  async findOne(id: number) {
    const daySchedule = await this.db.daySchedule.findUnique({
      where: { id },
    });

    if (!daySchedule) {
      throw new Error(`Day Schedule with ID #${id} not found`);
    }

    return daySchedule;
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
      where: { id },
    });

    return deletedDaySchedule;
  }
}
