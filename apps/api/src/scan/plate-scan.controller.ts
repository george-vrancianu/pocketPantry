import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MemberLanguageService } from '../member-language/member-language.service';
import { PlateScanFlowService } from './plate-scan-flow.service';
import {
  plateRecipeSchema,
  plateScanSchema,
  type PlateDishesResponse,
  type PlateRecipeInput,
  type PlateRecipeResponse,
  type PlateScanInput,
} from './plate-scan.schemas';
import { ScanImagePipe } from './scan-image.pipe';

@ApiTags('scan')
@Controller('scan/plate')
@UseGuards(AuthGuard)
export class PlateScanController {
  constructor(
    private readonly plate: PlateScanFlowService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Plate Scan: up to five dish guesses with confidence. Counts against the Scan Cap. Images are forwarded, never stored.',
  })
  async dishes(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ScanImagePipe(plateScanSchema, ['plateImage']))
    body: PlateScanInput,
  ): Promise<PlateDishesResponse> {
    // Dish titles and fallback names are made up in the Catalog Language; Plate Scan has no reading hint.
    return this.plate.scanDishes(
      member.id,
      body,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Post('recipe')
  @ApiOperation({
    summary:
      "Writes the picked dish as a whole Recipe and stores it as the Member's Recipe Draft (a New Recipe marked as from a Plate Scan); returns its id. Needs the token from Plate Scan; not counted against the Scan Cap again.",
  })
  async recipe(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(plateRecipeSchema)) body: PlateRecipeInput,
  ): Promise<PlateRecipeResponse> {
    return this.plate.writeRecipe(
      member.id,
      body,
      await this.languages.catalogLanguageOf(member.id),
    );
  }
}
