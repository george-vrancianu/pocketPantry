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
 * pass the Member's id and never read the language columns themselves.
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
  catalogLanguageOf(memberId: string): Promise<CatalogLocale> {
    return this.languageOf(memberId, 'catalog');
  }

  /** The language a Scan is read in: the per-Scan `override` if sent, else the Scan Language Preference. */
  scanLanguageOf(
    memberId: string,
    override?: ScanLanguage,
  ): Promise<ScanLanguage> {
    return this.languageOf(memberId, 'scan', { override });
  }

  /**
   * Every role at once, from one read. `overrides` are explicit choices for one job (say, this Voice Note's
   * Spoken Language) and win over the Preference.
   */
  async languagesOf(
    memberId: string,
    overrides: { spoken?: ScanLanguage } = {},
  ): Promise<MemberLanguages> {
    const languages = resolveLanguages(await this.stored(memberId));
    return overrides.spoken
      ? { ...languages, spoken: overrides.spoken }
      : languages;
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
