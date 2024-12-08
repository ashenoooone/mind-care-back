import { ApiProperty } from '@nestjs/swagger';
import { SupportStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateReportDto {
  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(SupportStatus, {
    message: 'Статус должен быть одним из: PENDING, IN_PROGRESS, COMPLETED.',
  })
  @IsOptional()
  status?: SupportStatus = SupportStatus.PENDING;
}
