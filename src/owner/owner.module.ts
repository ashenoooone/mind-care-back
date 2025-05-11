import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService],
  imports: [DatabaseModule, ConfigModule, AuthModule],
})
export class OwnerModule {}
