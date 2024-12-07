import { Injectable } from '@nestjs/common';
import { CreateNotWorkingDayDto } from './dto/create-not-working-day.dto';
import { UpdateNotWorkingDayDto } from './dto/update-not-working-day.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class NotWorkingDaysService {
  constructor(private readonly db: DatabaseService) {}

  findByDate(date: Date) {
    return this.db.nonWorkingDay.findFirst({
      where: {
        date: {
          equals: date,
        },
      },
    });
  }

  create(createNotWorkingDayDto: CreateNotWorkingDayDto) {
    return this.db.nonWorkingDay.create({
      data: createNotWorkingDayDto,
    });
  }

  findAll() {
    return this.db.nonWorkingDay.findMany();
  }

  findOne(id: number) {
    return this.db.nonWorkingDay.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateNotWorkingDayDto: UpdateNotWorkingDayDto) {
    return this.db.nonWorkingDay.update({
      data: { ...updateNotWorkingDayDto },
      where: { id },
    });
  }

  remove(id: number) {
    return this.db.nonWorkingDay.delete({
      where: { id },
    });
  }
}
