import { Module } from '@nestjs/common';
import { AssistantTokenService } from './assistant-token.service';
import { AssistantTokensController } from './assistant-tokens.controller';

@Module({
  controllers: [AssistantTokensController],
  providers: [AssistantTokenService],
  exports: [AssistantTokenService],
})
export class AssistantTokensModule {}
