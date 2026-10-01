import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { validateEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FamilyModule } from './family/family.module';
import { HealthModule } from './health/health.module';
import { ShoppingModule } from './shopping/shopping.module';
import { PantryModule } from './pantry/pantry.module';
import { ScanModule } from './scan/scan.module';
import { SettingsModule } from './settings/settings.module';

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
    CatalogModule,
    ShoppingModule,
    PantryModule,
    ScanModule,
    DashboardModule,
    SettingsModule,
    AdminModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
