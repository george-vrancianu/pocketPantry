import { Module } from '@nestjs/common';
import { createPageFetcher, PAGE_FETCHER } from './page-fetcher';

/**
 * The page fetcher, in its own small module so any feature that fetches a
 * Member-supplied link (Recipe from Link) imports it without pulling in
 * another feature's module. Always the strict, production guard.
 */
@Module({
  providers: [{ provide: PAGE_FETCHER, useFactory: () => createPageFetcher() }],
  exports: [PAGE_FETCHER],
})
export class PageFetchModule {}
