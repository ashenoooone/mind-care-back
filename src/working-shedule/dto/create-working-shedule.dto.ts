import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateWorkingScheduleDto {
  @ApiProperty({
    description:
      'День недели, где 0 - Понедельник, 1 - Вторник, ..., 6 - Воскресенье',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Указывает, является ли день рабочим',
    default: true,
  })
  @IsBoolean()
  isWorking: boolean;

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
