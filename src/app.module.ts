import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { OwnerModule } from './owner/owner.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ServicesModule,
    UsersModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(80),
        DATABASE_URL: Joi.string(),
        ADMIN_CREDENTIALS: Joi.string().default('root:root'),
      }),
    }),
    UsersModule,
    ServicesModule,
    OwnerModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
