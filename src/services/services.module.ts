import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [DatabaseModule],
})
export class ServicesModule {}
