import {
  Alert,
  Box,
  Button,
  Stack,
  Spinner,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import { ReadingLanguageChoice } from '../../components/ReadingLanguageChoice';
import { useReadRecipeLink, type ReadingLanguage } from '../../lib/linkRecipe';
import { dateLocale } from '../../lib/pantry';
import type { NewRecipeState } from './FamilyRecipePages';

/** The reading's AI failures arrive as Scan codes; their own copy talks about photos, so this step words them for links. */
const READING_ERRORS: Record<string, string> = {
  'scan.provider_unavailable': 'errors:link.reading_unavailable',
  'scan.not_configured': 'errors:link.reading_unavailable',
  'scan.provider_refused': 'errors:link.reading_failed',
  'scan.provider_incomplete': 'errors:link.reading_failed',
  'scan.result_invalid': 'errors:link.reading_failed',
};

/**
 * The Link Cap message names when the reads start again: the API sends the next UTC midnight
 * as `resetsAt`, shown here in the Member's own time. A missing or unreadable one says "tomorrow", and a missing count leaves the number out.
 */
function capMessage(
  t: TFunction,
  language: string,
  params: Record<string, unknown>,
): string {
  const cap = Number(params.cap);
  const count = Number.isInteger(cap) && cap > 0 ? cap : undefined;
  const resetsAt = Date.parse(
    typeof params.resetsAt === 'string' ? params.resetsAt : '',
  );
  if (count === undefined) return t('errors:link.cap_reached_unknown');
  if (Number.isNaN(resetsAt)) {
    return t('errors:link.cap_reached_no_time', { count });
  }
  const when = new Intl.DateTimeFormat(dateLocale(language), {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(resetsAt);
  return t('errors:link.cap_reached', { count, when });
}

/**
 * "From a link": the Member gives the address of a recipe page and it opens the New Recipe
 * page filled in. Leaving the step cancels a read in progress, and a cancelled read never
 * navigates or shows an error.
 *
 * Later steps of Recipe from Link grow this form: "Paste text instead" with its field (it reuses
 * `ReadingLanguageChoice` with its own copy of the state) and the duplicate result each add to `form` (above the
 * submit button) or to the outcome handling in `submit`.
 */
export function RecipeFromLinkPage() {
  const { t, i18n } = useTranslation(['recipes', 'common', 'errors']);
  const navigate = useNavigate();
  const read = useReadRecipeLink();
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<ReadingLanguage>('catalog');
  const controller = useRef<AbortController | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const wasPending = useRef(false);

  // The field is disabled while reading; when the read ends (Cancel or an error), focus returns to it.
  useEffect(() => {
    if (wasPending.current && !read.isPending) field.current?.focus();
    // Pressing "Read the recipe" swaps it for Cancel, so focus moves there once, not on every render.
    if (!wasPending.current && read.isPending) cancelButton.current?.focus();
    wasPending.current = read.isPending;
  }, [read.isPending]);
  // A fast failure may never render the pending state, so an error also hands focus back.
  useEffect(() => {
    if (read.isError) field.current?.focus();
  }, [read.isError]);

  // Leaving the step abandons the read in progress.
  useEffect(() => () => controller.current?.abort(), []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (url.trim() === '' || read.isPending) return;
    const attempt = new AbortController();
    controller.current = attempt;
    read.mutate(
      { url: url.trim(), language, signal: attempt.signal },
      {
        onSuccess: ({
          draft,
          closestBases,
          hiddenByAllergiesCount,
          sourceLink,
          sourceLanguage,
        }) => {
          // Defensive: Cancel resets the mutation and leaving unmounts it, so this callback should not run for an aborted read.
          if (attempt.signal.aborted) return;
          navigate('/recipes/new', {
            state: {
              draft,
              closestBases,
              hiddenByAllergiesCount,
              sourceLink,
              sourceLanguage,
            } satisfies NewRecipeState,
          });
        },
      },
    );
  };

  const cancel = () => {
    controller.current?.abort();
    read.reset();
  };

  return (
    <>
      <AppScreenHeader
        back={{ label: t('recipes:back'), href: '/recipes' }}
        title={t('recipes:fromLink.heading')}
      />
      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={submit}
        aria-label={t('recipes:fromLink.heading')}
      >
        <Typography color="text.secondary">
          {t('recipes:fromLink.hint')}
        </Typography>
        {read.isError ? (
          <Alert>
            {read.error instanceof ApiError &&
            read.error.code === 'link.cap_reached'
              ? capMessage(t, i18n.language, read.error.params)
              : read.error instanceof ApiError &&
                  READING_ERRORS[read.error.code]
                ? t(READING_ERRORS[read.error.code])
                : translateApiError(t, read.error)}
          </Alert>
        ) : null}
        <TextField
          type="url"
          label={t('recipes:fromLink.label')}
          value={url}
          inputRef={field}
          disabled={read.isPending}
          onChange={(event) => setUrl(event.target.value)}
          slotProps={{
            htmlInput: {
              maxLength: 2048,
              inputMode: 'url',
              autoCapitalize: 'none',
              autoCorrect: 'off',
              spellCheck: false,
            },
          }}
        />
        <ReadingLanguageChoice value={language} onChange={setLanguage} />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {read.isPending ? (
            <Box aria-hidden>
              <Spinner label={t('recipes:fromLink.reading')} />
            </Box>
          ) : null}
          <Typography role="status">
            {read.isPending ? t('recipes:fromLink.reading') : ''}
          </Typography>
        </Stack>
        {read.isPending ? (
          <Button variant="secondary" onClick={cancel} ref={cancelButton}>
            {t('common:cancel')}
          </Button>
        ) : (
          <Button type="submit" disabled={url.trim() === ''}>
            {t('recipes:fromLink.submit')}
          </Button>
        )}
      </Stack>
    </>
  );
}
