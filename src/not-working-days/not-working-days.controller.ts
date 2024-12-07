import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { NotWorkingDaysService } from './not-working-days.service';
import { CreateNotWorkingDayDto } from './dto/create-not-working-day.dto';

@Controller('not-working-days')
export class NotWorkingDaysController {
  constructor(private readonly notWorkingDaysService: NotWorkingDaysService) {}

  @Post()
  create(@Body() createNotWorkingDayDto: CreateNotWorkingDayDto) {
    return this.notWorkingDaysService.create(createNotWorkingDayDto);
  }

  @Get()
  findAll() {
    return this.notWorkingDaysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notWorkingDaysService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notWorkingDaysService.remove(+id);
  }
}
