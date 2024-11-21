import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DayScheduleService } from './day-schedule.service';
import { CreateDayScheduleDto } from './dto/create-day-schedule.dto';
import { UpdateDayScheduleDto } from './dto/update-day-schedule.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dayScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDayScheduleDto: UpdateDayScheduleDto) {
    return this.dayScheduleService.update(+id, updateDayScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dayScheduleService.remove(+id);
  }
}
