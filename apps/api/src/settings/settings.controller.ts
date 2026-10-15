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
  replaceAllergiesBody,
  settingsLocaleQuery,
  updateFamilySettingsBody,
  updatePreferencesBody,
  type AllergiesView,
  type CategoryOptionsView,
  type ExpiryOverrideBody,
  type FamilySettingsView,
  type PreferencesView,
  type ReplaceAllergiesBody,
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
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(settingsLocaleQuery))
    query: SettingsLocaleQuery,
  ): Promise<CategoryOptionsView> {
    return this.settings.categoryOptions(member.id, query.locale);
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
  @ApiOperation({ summary: "The signed-in Member's Member Preferences" })
  preferences(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<PreferencesView> {
    return this.settings.getPreferences(member.id);
  }

  @Put('preferences')
  @ApiOperation({
    summary: "Save the Member's locale and/or Theme; omitted ones are kept",
  })
  async setPreferences(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(updatePreferencesBody))
    body: UpdatePreferencesBody,
  ): Promise<PreferencesView> {
    await this.settings.setPreferences(member.id, body);
    return this.settings.getPreferences(member.id);
  }

  @Get('allergies')
  @ApiOperation({
    summary: "The Allergen list and the signed-in Member's own Allergies",
  })
  allergies(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(settingsLocaleQuery))
    query: SettingsLocaleQuery,
  ): Promise<AllergiesView> {
    return this.settings.getAllergies(member.id, query.locale);
  }

  @Put('allergies')
  @ApiOperation({
    summary: "Replace the signed-in Member's own Allergies (only their own)",
  })
  async setAllergies(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(replaceAllergiesBody))
    body: ReplaceAllergiesBody,
    @Query(new ZodValidationPipe(settingsLocaleQuery))
    query: SettingsLocaleQuery,
  ): Promise<AllergiesView> {
    await this.settings.setAllergies(member.id, body.allergenIds);
    return this.settings.getAllergies(member.id, query.locale);
  }
}
