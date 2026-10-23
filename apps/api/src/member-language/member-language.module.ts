import { Module } from '@nestjs/common';
import { MemberLanguageService } from './member-language.service';

@Module({
  providers: [MemberLanguageService],
  exports: [MemberLanguageService],
})
export class MemberLanguageModule {}
