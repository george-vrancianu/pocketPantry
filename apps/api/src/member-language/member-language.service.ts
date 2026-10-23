import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { user } from '../database/schema';
import {
  type LanguageOptions,
  type LanguageRole,
  type MemberLanguages,
  type RoleLanguage,
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

  async languageOf<Role extends LanguageRole>(
    memberId: string,
    role: Role,
    options: LanguageOptions = {},
  ): Promise<RoleLanguage[Role]> {
    return resolveLanguage(role, await this.stored(memberId), options);
  }

  /** The Catalog Language, for the routes that return Ingredient, Category and Aisle names. */
  catalogLanguageOf(
    memberId: string,
    requestLocale?: CatalogLocale,
  ): Promise<CatalogLocale> {
    return this.languageOf(memberId, 'catalog', { requestLocale });
  }

  /** The language a Scan is read in: the per-Scan `override` if sent, else the Scan Language Preference. */
  scanLanguageOf(
    memberId: string,
    requestLocale?: CatalogLocale,
    override?: ScanLanguage,
  ): Promise<ScanLanguage> {
    return this.languageOf(memberId, 'scan', { requestLocale, override });
  }

  /** The language a Voice Note is spoken in: the per-Voice Note `override` if sent, else the Spoken Language Preference. */
  spokenLanguageOf(
    memberId: string,
    requestLocale?: CatalogLocale,
    override?: ScanLanguage,
  ): Promise<ScanLanguage> {
    return this.languageOf(memberId, 'spoken', { requestLocale, override });
  }

  async languagesOf(
    memberId: string,
    options: Pick<LanguageOptions, 'requestLocale'> = {},
  ): Promise<MemberLanguages> {
    return resolveLanguages(await this.stored(memberId), options);
  }

  private async stored(memberId: string) {
    const [row] = await this.database
      .select({
        locale: user.locale,
        catalogLanguage: user.catalogLanguage,
        scanLanguage: user.scanLanguage,
        spokenLanguage: user.spokenLanguage,
      })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    return (
      row ?? {
        locale: null,
        catalogLanguage: null,
        scanLanguage: null,
        spokenLanguage: null,
      }
    );
  }
}
