import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class CreateDayScheduleDto {
  @ApiProperty({ description: 'Дата рабочего дня' })
  date: Date;

  @ApiProperty({ description: 'Час начала работы (например, 9)', default: 9 })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour: number;

  @ApiProperty({
    description: 'Час окончания работы (например, 18)',
    default: 18,
  })
  @IsInt()
  @Min(0)
  @Max(23)
  endHour: number;
}
