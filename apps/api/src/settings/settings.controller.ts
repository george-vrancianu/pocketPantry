import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  categoryIdParam,
  expiryOverrideBody,
  settingsLocaleQuery,
  updateFamilySettingsBody,
  updatePreferencesBody,
  type CategoryOptionsView,
  type ExpiryOverrideBody,
  type FamilySettingsView,
  type PreferencesView,
  type SettingsLocaleQuery,
  type UpdateFamilySettingsBody,
  type UpdatePreferencesBody,
} from './settings.schemas';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('family')
  @ApiOperation({
    summary: 'Family Settings: Stale Threshold and Default Expiry overrides',
  })
  family(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(settingsLocaleQuery))
    query: SettingsLocaleQuery,
  ): Promise<FamilySettingsView> {
    return this.settings.getFamilySettings(member.id, query.locale);
  }

  @Patch('family')
  @ApiOperation({ summary: 'Any Member: change the Stale Threshold' })
  async updateFamily(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(updateFamilySettingsBody))
    body: UpdateFamilySettingsBody,
  ): Promise<{ staleThresholdDays: number }> {
    await this.settings.setStaleThreshold(member.id, body.staleThresholdDays);
    return { staleThresholdDays: body.staleThresholdDays };
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Parent and Leaf Categories a Default Expiry override can target',
  })
  categories(
    @Query(new ZodValidationPipe(settingsLocaleQuery))
    query: SettingsLocaleQuery,
  ): Promise<CategoryOptionsView> {
    return this.settings.categoryOptions(query.locale);
  }

  @Put('family/expiry-overrides/:categoryId')
  @ApiOperation({
    summary: 'Any Member: set the Family Default Expiry for a Category',
  })
  async setOverride(
    @CurrentUser() member: CurrentUserValue,
    @Param('categoryId', new ZodValidationPipe(categoryIdParam))
    categoryId: string,
    @Body(new ZodValidationPipe(expiryOverrideBody)) body: ExpiryOverrideBody,
  ): Promise<{ categoryId: string; days: number }> {
    await this.settings.setExpiryOverride(member.id, categoryId, body.days);
    return { categoryId, days: body.days };
  }

  @Delete('family/expiry-overrides/:categoryId')
  @ApiOperation({
    summary: 'Any Member: remove the Family override for a Category',
  })
  async removeOverride(
    @CurrentUser() member: CurrentUserValue,
    @Param('categoryId', new ZodValidationPipe(categoryIdParam))
    categoryId: string,
  ): Promise<{ categoryId: string }> {
    await this.settings.removeExpiryOverride(member.id, categoryId);
    return { categoryId };
  }

  @Get('preferences')
  @ApiOperation({ summary: "The signed-in Member's private preferences" })
  preferences(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<PreferencesView> {
    return this.settings.getPreferences(member.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: "Save the Member's locale" })
  async setPreferences(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(updatePreferencesBody))
    body: UpdatePreferencesBody,
  ): Promise<PreferencesView> {
    await this.settings.setLocale(member.id, body.locale);
    return { locale: body.locale };
  }
}
