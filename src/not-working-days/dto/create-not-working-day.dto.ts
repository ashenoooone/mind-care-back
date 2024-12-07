import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNotWorkingDayDto {
  @ApiProperty()
  @Type(() => Date)
  date: Date;

  @ApiProperty()
  @Type(() => String)
  reason: string;
}
