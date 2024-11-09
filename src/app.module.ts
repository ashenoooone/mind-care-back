import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(80),
        DATABASE_URL: Joi.string(),
        ADMIN_CREDENTIALS: Joi.string().default('root:root'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
