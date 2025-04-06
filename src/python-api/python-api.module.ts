import { Module } from '@nestjs/common';
import { PythonApiService } from './python-api.service';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [PythonApiService],
  exports: [PythonApiService],
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('PYTHON_BACKEND_URL'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    ConfigModule,
  ],
})
export class PythonApiModule {}
