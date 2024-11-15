import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupportStatus } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty()
  @IsInt({ message: 'tgId должен быть целым числом.' })
  telegramId: number;

  @ApiProperty()
  @IsString({ message: 'Описание обязательно и должно быть строкой.' })
  description: string;

  @ApiProperty()
  @IsEnum(SupportStatus, {
    message: 'Статус должен быть одним из: PENDING, IN_PROGRESS, COMPLETED.',
  })
  @IsOptional()
  status?: SupportStatus = SupportStatus.PENDING;
}
