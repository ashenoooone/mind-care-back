import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService],
  imports: [DatabaseModule, ConfigModule],
})
export class OwnerModule {}
