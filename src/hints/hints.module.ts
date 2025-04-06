import { Module } from '@nestjs/common';
import { HintsService } from './hints.service';
import { HintsController } from './hints.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PythonApiModule } from 'src/python-api/python-api.module';
@Module({
  controllers: [HintsController],
  providers: [HintsService],
  imports: [DatabaseModule, PythonApiModule],
})
export class HintsModule {}
