import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsDate, IsEnum } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty({
    example: 101,
  })
  @IsInt()
  @Type(() => Number)
  clientId: number;

  @ApiProperty({
    example: 5,
  })
  @IsInt()
  @Type(() => Number)
  serviceId: number;

  @ApiProperty({
    example: '2024-11-23T09:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    example: '2024-11-23T10:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: 'SCHEDULED',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
