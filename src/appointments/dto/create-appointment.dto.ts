import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsInt, IsDate, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    example: 101,
  })
  @IsInt()
  clientId: number;

  @ApiProperty({
    example: 5,
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: '2024-11-23T09:00:00.000Z',
  })
  @IsDate()
  startTime: Date;

  @ApiProperty({
    example: '2024-11-23T10:00:00.000Z',
  })
  @IsDate()
  endTime: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: 'CONFIRMED',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
