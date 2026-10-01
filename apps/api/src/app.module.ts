import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { validateEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { FamilyModule } from './family/family.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    FamilyModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
