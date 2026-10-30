import type { TFunction } from 'i18next';
import { translateApiError } from '../i18n/translateApiError';
import { ApiError } from './api';
import { capMessage } from './capMessage';
import type { LinkRecipeRead } from './recipeReads';

/** The reading's AI failures arrive as Scan codes; their own copy talks about photos, so links word them. */
const READING_ERRORS: Record<string, string> = {
  'scan.provider_unavailable': 'errors:link.reading_unavailable',
  'scan.not_configured': 'errors:link.reading_unavailable',
  'scan.provider_refused': 'errors:link.reading_failed',
  'scan.provider_incomplete': 'errors:link.reading_failed',
  'scan.result_invalid': 'errors:link.reading_failed',
};

/** Why a link read failed, worded for a link (or for pasted text, which has no page to blame). */
export function linkFailureReason(
  t: TFunction,
  language: string,
  read: Pick<LinkRecipeRead, 'source' | 'error'>,
): string {
  const { error } = read;
  if (!(error instanceof ApiError)) return t('errors:unknown');
  if (error.code === 'link.cap_reached') {
    return capMessage(t, language, error.params, 'errors:link');
  }
  const text = read.source.kind === 'text';
  const reading = READING_ERRORS[error.code];
  if (reading) return t(text ? `${reading}_text` : reading);
  if (text && error.code === 'link.no_recipe') {
    return t('errors:link.no_recipe_text');
  }
  return translateApiError(t, error);
}

/** The page could not be opened: pasting the recipe's text may still work. */
export const offersPasteText = (
  read: Pick<LinkRecipeRead, 'source' | 'error'>,
) =>
  read.source.kind === 'link' &&
  read.error instanceof ApiError &&
  read.error.code === 'link.unreadable';
