import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DayScheduleService } from './day-schedule.service';
import { CreateDayScheduleDto } from './dto/create-day-schedule.dto';
import { UpdateDayScheduleDto } from './dto/update-day-schedule.dto';
import { GetAvailableDays } from './dto/get-available-days.dto';

@Controller('day-schedule')
export class DayScheduleController {
  constructor(private readonly dayScheduleService: DayScheduleService) {}

  @Post()
  create(@Body() createDayScheduleDto: CreateDayScheduleDto) {
    return this.dayScheduleService.create(createDayScheduleDto);
  }

  @Get()
  findAll() {
    return this.dayScheduleService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDayScheduleDto: UpdateDayScheduleDto,
  ) {
    return this.dayScheduleService.update(+id, updateDayScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dayScheduleService.remove(+id);
  }

  @Get('day/:day')
  getDaySchedule(@Param('day') day: string) {
    return this.dayScheduleService.getDaySchedule(new Date(day));
  }

  @Get('days')
  getAvailableDays(@Query() params: GetAvailableDays) {
    return this.dayScheduleService.getAvailableDays(params);
  }
}
