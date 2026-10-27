import {
  Alert,
  Box,
  Button,
  Stack,
  Spinner,
  TextField,
  Typography,
  radius,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlreadyInRecipes } from './AlreadyInRecipes';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import { ReadingLanguageChoice } from '../../components/ReadingLanguageChoice';
import {
  MAX_LINK_LENGTH,
  MAX_PASTED_TEXT_LENGTH,
  useReadRecipeLink,
  type ReadingLanguage,
} from '../../lib/linkRecipe';
import { capMessage } from '../../lib/capMessage';
import { DRAFT_PARAM } from './useRecipeDraftRoute';

/** The reading's AI failures arrive as Scan codes; their own copy talks about photos, so this step words them for links. */
const READING_ERRORS: Record<string, string> = {
  'scan.provider_unavailable': 'errors:link.reading_unavailable',
  'scan.not_configured': 'errors:link.reading_unavailable',
  'scan.provider_refused': 'errors:link.reading_failed',
  'scan.provider_incomplete': 'errors:link.reading_failed',
  'scan.result_invalid': 'errors:link.reading_failed',
};

/** The editor's 44 pt field. */
const fieldSx = {
  '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: radius.control },
  '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline) input': {
    py: '10px',
  },
};

/**
 * "From a link": the Member gives the address of a recipe page and it opens the New Recipe
 * page filled in. Leaving the step cancels a read in progress, and a cancelled read never
 * navigates or shows an error.
 *
 * "Paste text instead" swaps the link field for a text field (the link and the text are both kept);
 * a link the page of which cannot be read offers the same switch from its error. A link that is
 * already one of the Family's Recipes answers "Already in your Recipes" (Open, or Read again with
 * `force`) instead of a draft; it shows only for a link.
 */
export function RecipeFromLinkPage() {
  const { t, i18n } = useTranslation(['recipes', 'common', 'errors']);
  const navigate = useNavigate();
  const read = useReadRecipeLink();
  const [mode, setMode] = useState<'link' | 'text'>('link');
  // Both are kept, so switching modes never loses what the Member typed.
  const [url, setUrl] = useState('');
  const [pasted, setPasted] = useState('');
  const [language, setLanguageValue] = useState<ReadingLanguage>('catalog');
  // The Recipe the link already is; shown instead of reading until the Member picks Open or Read again.
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const duplicateHeading = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const field = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const modeChanged = useRef(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const wasPending = useRef(false);
  const fieldId = useId();

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

  // After the effects above (an ended read hands focus to the field), the panel's heading takes it.
  useEffect(() => {
    if (duplicate !== null) duplicateHeading.current?.focus();
  }, [duplicate]);

  // Switching modes swaps the field, so focus follows to the one now shown.
  useEffect(() => {
    if (modeChanged.current) field.current?.focus();
  }, [mode]);

  const switchTo = (next: 'link' | 'text') => {
    modeChanged.current = true;
    read.reset();
    setDuplicate(null);
    setMode(next);
  };

  // Leaving the step abandons the read in progress.
  useEffect(() => () => controller.current?.abort(), []);

  // A different link or language is a different question: the old answer no longer applies.
  const editUrl = (value: string) => {
    setUrl(value);
    setDuplicate(null);
  };
  const setLanguage = (value: ReadingLanguage) => {
    setLanguageValue(value);
    setDuplicate(null);
  };

  const start = (force: boolean) => {
    const input = mode === 'text' ? pasted.trim() : url.trim();
    if (input === '' || read.isPending) return;
    setDuplicate(null);
    const attempt = new AbortController();
    controller.current = attempt;
    read.mutate(
      mode === 'text'
        ? { text: input, language, signal: attempt.signal }
        : { url: input, language, force, signal: attempt.signal },
      {
        onSuccess: (result) => {
          // Defensive: Cancel resets the mutation and leaving unmounts it, so this callback should not run for an aborted read.
          if (attempt.signal.aborted) return;
          if (result.kind === 'duplicate') {
            setDuplicate(result.recipeId);
            return;
          }
          // The server stored the read as a Recipe Draft: the editor resumes it (a reload keeps it).
          navigate(`/recipes/new?${DRAFT_PARAM}=${result.recipeDraftId}`);
        },
      },
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    start(false);
  };

  const cancel = () => {
    controller.current?.abort();
    read.reset();
  };

  const code = read.error instanceof ApiError ? read.error.code : null;
  const offersPaste =
    mode === 'link' &&
    (code === 'link.unreadable' || code === 'link.no_recipe');
  const errorMessage = () => {
    if (read.error instanceof ApiError) {
      if (read.error.code === 'link.cap_reached') {
        return capMessage(t, i18n.language, read.error.params, 'errors:link');
      }
      const reading = READING_ERRORS[read.error.code];
      // Pasted text has no page or link to blame.
      if (reading) return t(mode === 'text' ? `${reading}_text` : reading);
      if (mode === 'text' && read.error.code === 'link.no_recipe') {
        return t('errors:link.no_recipe_text');
      }
    }
    return translateApiError(t, read.error);
  };
  const empty = (mode === 'text' ? pasted : url).trim() === '';

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
          {t(
            mode === 'text'
              ? 'recipes:fromLink.textHint'
              : 'recipes:fromLink.hint',
          )}
        </Typography>
        {read.isError ? <Alert>{errorMessage()}</Alert> : null}
        {offersPaste ? (
          <Button
            variant="ghost"
            onClick={() => switchTo('text')}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('recipes:fromLink.pasteInstead')}
          </Button>
        ) : null}
        <Box>
          <Typography
            component="label"
            htmlFor={fieldId}
            variant="sectionLabel"
            color="text.secondary"
            sx={{ display: 'block', mb: '6px' }}
          >
            {t(
              mode === 'text'
                ? 'recipes:fromLink.textLabel'
                : 'recipes:fromLink.label',
            )}
          </Typography>
          {mode === 'text' ? (
            <TextField
              id={fieldId}
              multiline
              minRows={6}
              value={pasted}
              inputRef={field}
              disabled={read.isPending}
              onChange={(event) => setPasted(event.target.value)}
              sx={fieldSx}
              slotProps={{ htmlInput: { maxLength: MAX_PASTED_TEXT_LENGTH } }}
            />
          ) : (
            <TextField
              id={fieldId}
              type="url"
              value={url}
              inputRef={field}
              disabled={read.isPending}
              onChange={(event) => editUrl(event.target.value)}
              sx={fieldSx}
              slotProps={{
                htmlInput: {
                  maxLength: MAX_LINK_LENGTH,
                  inputMode: 'url',
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: false,
                },
              }}
            />
          )}
        </Box>
        <Button
          variant="ghost"
          disabled={read.isPending}
          onClick={() => switchTo(mode === 'text' ? 'link' : 'text')}
          sx={{ alignSelf: 'flex-start' }}
        >
          {mode === 'text'
            ? t('recipes:fromLink.useLink')
            : t('recipes:fromLink.pasteSwitch')}
        </Button>
        <ReadingLanguageChoice
          value={language}
          onChange={setLanguage}
          input={mode}
        />
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
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
          <Button
            variant="secondary"
            fullWidth
            onClick={cancel}
            ref={cancelButton}
          >
            {t('common:cancel')}
          </Button>
        ) : mode === 'link' && duplicate !== null ? (
          <AlreadyInRecipes
            ref={duplicateHeading}
            recipeId={duplicate}
            onReadAgain={() => start(true)}
          />
        ) : (
          <Button type="submit" fullWidth disabled={empty}>
            {t('recipes:fromLink.submit')}
          </Button>
        )}
      </Stack>
    </>
  );
}
