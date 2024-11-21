import { Injectable } from '@nestjs/common';
import { UpdateWorkingSheduleDto } from './dto/update-working-shedule.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WorkingSheduleService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const workingSchedules = await this.db.workingSchedule.findMany();
    return workingSchedules;
  }

  async update(id: number, updateWorkingSheduleDto: UpdateWorkingSheduleDto) {
    const { dayOfWeek, isWorking, startHour, endHour } =
      updateWorkingSheduleDto;

    const updatedWorkingSchedule = await this.db.workingSchedule.update({
      where: { id },
      data: {
        dayOfWeek,
        isWorking,
        startHour,
        endHour,
      },
    });

    return updatedWorkingSchedule;
  }
}
