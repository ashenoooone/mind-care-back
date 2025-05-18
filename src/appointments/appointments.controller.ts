import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { GetCalendarDto } from './dto/get-calendar';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll(@Query() params: GetAppointmentsDto) {
    return this.appointmentsService.findAll(params);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  createAdmin(@Body() createAppointmentDto: CreateAdminAppointmentDto) {
    return this.appointmentsService.createAdminAppointment(
      createAppointmentDto,
    );
  }

  @Get('calendar')
  getCalendar(@Query() params: GetCalendarDto) {
    return this.appointmentsService.getCalendar(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
