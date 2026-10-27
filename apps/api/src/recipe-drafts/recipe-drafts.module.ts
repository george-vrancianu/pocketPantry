import { Module } from '@nestjs/common';
import { MemberLanguageModule } from '../member-language/member-language.module';
import { RecipeDraftsController } from './recipe-drafts.controller';
import { RecipeDraftsService } from './recipe-drafts.service';

@Module({
  imports: [MemberLanguageModule],
  controllers: [RecipeDraftsController],
  providers: [RecipeDraftsService],
  exports: [RecipeDraftsService],
})
export class RecipeDraftsModule {}
