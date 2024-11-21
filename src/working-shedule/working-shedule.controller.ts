import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { WorkingSheduleService } from './working-shedule.service';
import { UpdateWorkingSheduleDto } from './dto/update-working-shedule.dto';

@Controller('working-shedule')
export class WorkingSheduleController {
  constructor(private readonly workingSheduleService: WorkingSheduleService) {}

  @Get()
  findAll() {
    return this.workingSheduleService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkingSheduleDto: UpdateWorkingSheduleDto,
  ) {
    return this.workingSheduleService.update(+id, updateWorkingSheduleDto);
  }
}
