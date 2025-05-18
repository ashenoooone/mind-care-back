import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class CreateAdminAppointmentDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  serviceId: number;

  @Type(() => Date)
  startTime: Date;

  @Type(() => Date)
  endTime: Date;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}
