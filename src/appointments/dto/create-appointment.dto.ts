import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
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

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;
}
