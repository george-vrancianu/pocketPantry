import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  pantryLocaleQuery,
  type PantryLocaleQuery,
} from '../pantry/pantry.schemas';
import { PlateScanFlowService } from './plate-scan-flow.service';
import {
  plateDishSchema,
  plateScanSchema,
  type PlateDishes,
  type PlateDishInput,
  type PlateScanInput,
} from './plate-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { ScanImagePipe } from './scan-image.pipe';

@ApiTags('scan')
@Controller('scan/plate')
@UseGuards(AuthGuard)
export class PlateScanController {
  constructor(private readonly plate: PlateScanFlowService) {}

  @Post()
  @ApiOperation({
    summary:
      'Plate Scan: up to five dish guesses with confidence. Counts against the Scan Cap. Images are forwarded, never stored.',
  })
  dishes(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ScanImagePipe(plateScanSchema, ['plateImage']))
    body: PlateScanInput,
  ): Promise<PlateDishes> {
    return this.plate.scanDishes(member.id, body, query.locale);
  }

  @Post('ingredients')
  @ApiOperation({
    summary:
      "The picked dish's Ingredients for one serving as proposed lines for the Review screen",
  })
  ingredients(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ZodValidationPipe(plateDishSchema)) body: PlateDishInput,
  ): Promise<ScanResponse> {
    return this.plate.dishLines(member.id, body.dishTitle, query.locale);
  }
}
