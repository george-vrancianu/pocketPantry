import {
  Alert,
  Button,
  Stack,
  Spinner,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import { useReadRecipeLink } from '../../lib/linkRecipe';
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
 * "From a link": the Member gives the address of a recipe page and it opens the New Recipe
 * page filled in. Leaving the step cancels a read in progress, and a cancelled read never
 * navigates or shows an error.
 *
 * Later steps of Recipe from Link grow this form: a language choice, "Paste text instead"
 * with its field, the duplicate result and the cap message each add to `form` (above the
 * submit button) or to the outcome handling in `submit`.
 */
export function RecipeFromLinkPage() {
  const { t } = useTranslation(['recipes', 'common', 'errors']);
  const navigate = useNavigate();
  const read = useReadRecipeLink();
  const [url, setUrl] = useState('');
  const controller = useRef<AbortController | null>(null);

  // Leaving the step abandons the read in progress.
  useEffect(() => () => controller.current?.abort(), []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (url.trim() === '' || read.isPending) return;
    const attempt = new AbortController();
    controller.current = attempt;
    read.mutate(
      { url: url.trim(), signal: attempt.signal },
      {
        onSuccess: ({ draft, closestBases, sourceLink }) => {
          if (attempt.signal.aborted) return;
          navigate('/recipes/new', {
            state: { draft, closestBases, sourceLink } satisfies NewRecipeState,
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
            {read.error instanceof ApiError && READING_ERRORS[read.error.code]
              ? t(READING_ERRORS[read.error.code])
              : translateApiError(t, read.error)}
          </Alert>
        ) : null}
        <TextField
          type="url"
          label={t('recipes:fromLink.label')}
          value={url}
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
        {read.isPending ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Spinner label={t('recipes:fromLink.reading')} />
            <Typography role="status">
              {t('recipes:fromLink.reading')}
            </Typography>
          </Stack>
        ) : null}
        {read.isPending ? (
          <Button variant="secondary" onClick={cancel}>
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
