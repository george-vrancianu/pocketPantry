import { Module } from '@nestjs/common';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { UnmatchedQueueController } from './unmatched-queue.controller';
import { UnmatchedQueueService } from './unmatched-queue.service';

@Module({
  controllers: [AdminCatalogController, UnmatchedQueueController],
  providers: [AdminCatalogService, UnmatchedQueueService],
})
export class AdminModule {}
