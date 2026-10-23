import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { user } from '../database/schema';
import {
  type LanguageRole,
  type MemberLanguages,
  resolveLanguage,
  resolveLanguages,
} from './member-language';

/**
 * The one place that answers which language a Member has for a role. Callers
 * pass the Member's id (and the request's `locale` while that fallback lives)
 * and never read the language columns themselves.
 */
@Injectable()
export class MemberLanguageService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async languageOf(
    memberId: string,
    role: LanguageRole,
    requestLocale?: CatalogLocale,
  ): Promise<CatalogLocale> {
    return resolveLanguage(role, await this.stored(memberId), requestLocale);
  }

  async languagesOf(
    memberId: string,
    requestLocale?: CatalogLocale,
  ): Promise<MemberLanguages> {
    return resolveLanguages(await this.stored(memberId), requestLocale);
  }

  private async stored(memberId: string) {
    const [row] = await this.database
      .select({ locale: user.locale, catalogLanguage: user.catalogLanguage })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    return row ?? { locale: null, catalogLanguage: null };
  }
}
