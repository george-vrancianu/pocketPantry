import {
  Alert,
  Box,
  Button,
  CookbookIcon,
  Sheet,
  Stack,
  TextField,
  Typography,
  radius,
} from '@pocket-pantry/ui';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreditPriceText } from '../../../components/CreditPrice';
import { ReadingLanguageChoice } from '../../../components/ReadingLanguageChoice';
import { MAX_HELD_LINK_READS, linkReads } from '../../../lib/linkReads';
import {
  MAX_LINK_LENGTH,
  MAX_PASTED_TEXT_LENGTH,
  checkRecipeLink,
  type ReadingLanguage,
} from '../../../lib/linkRecipe';
import { AlreadyInRecipes } from '../AlreadyInRecipes';

/** What "Paste text instead" hands the Recipes page (under `FROM_LINK_PREFILL_STATE`): open the sheet in text mode, the link kept. */
export type FromLinkPrefill = { url: string; replaces: number };

/** The editor's 44 pt field. */
const fieldSx = {
  '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: radius.control },
  '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline) input': {
    py: '10px',
  },
};

/**
 * "From a link", a sheet over Recipes: the Member gives the address of a recipe page (or pastes the
 * recipe's text) and the read goes to the link-read holder. Submitting closes the sheet; the read
 * carries on in the background strip, whatever page the Member goes to. The sheet reads nothing itself,
 * so closing it never stops a read.
 *
 * "Paste text instead" swaps the link field for a text field (the link and the text are both kept).
 * The holder keeps at most five reads: a sixth is refused here, asking the Member to review first.
 *
 * A link is checked first (a plain request that fetches nothing and costs nothing): if it is already
 * one of the Family's Recipes the sheet answers "Already in your Recipes" in place, with Open or Read
 * again. Pasted text is never checked. When the check fails the read goes ahead anyway; a duplicate it
 * missed is read as asked (the holder re-reads it with force).
 */
export function FromLinkSheet({
  open,
  onClose,
  onExited,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  /** Opens in text mode with this link kept (from a failed row's "Paste text instead"); that read is replaced by the text's. */
  prefill?: FromLinkPrefill;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      onExited={onExited}
      size="content"
      label={t('fromLink.heading')}
    >
      <FromLinkForm onSubmitted={onClose} prefill={prefill} />
    </Sheet>
  );
}

/** Mounted afresh each time the sheet opens, so an earlier read's link is never left in the field. */
function FromLinkForm({
  onSubmitted,
  prefill,
}: {
  onSubmitted: () => void;
  prefill?: FromLinkPrefill;
}) {
  const { t } = useTranslation('recipes');
  const [mode, setMode] = useState<'link' | 'text'>(prefill ? 'text' : 'link');
  // A web page costs more than pasted text, so the price follows the mode.
  const pagePrice = useCreditPriceText('link-page');
  const textPrice = useCreditPriceText('link-text');
  const linkPrice = mode === 'text' ? textPrice : pagePrice;
  // Both are kept, so switching modes never loses what the Member typed.
  const [url, setUrl] = useState(prefill?.url ?? '');
  const [pasted, setPasted] = useState('');
  const [language, setLanguage] = useState<ReadingLanguage>('catalog');
  const [full, setFull] = useState(false);
  const [checking, setChecking] = useState(false);
  /** The Family Recipe the submitted link already is; answered in place of the form. */
  const [duplicate, setDuplicate] = useState<{
    recipeId: string;
    read: () => void;
  } | null>(null);
  /** Aborts a check in flight when the sheet goes away. */
  const checkAbort = useRef<AbortController | null>(null);
  const duplicateHeading = useRef<HTMLHeadingElement>(null);
  const field = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const modeChanged = useRef(false);
  const fieldId = useId();

  // Switching modes swaps the field, so focus follows to the one now shown.
  useEffect(() => {
    if (modeChanged.current) field.current?.focus();
  }, [mode]);
  // Opened in text mode from a failed row: the text field is the one to fill.
  useEffect(() => {
    if (prefill) field.current?.focus();
  }, [prefill]);

  const switchTo = (next: 'link' | 'text') => {
    modeChanged.current = true;
    setFull(false);
    setMode(next);
  };

  useEffect(() => () => checkAbort.current?.abort(), []);
  useEffect(() => {
    if (duplicate) duplicateHeading.current?.focus();
  }, [duplicate]);

  const input = (mode === 'text' ? pasted : url).trim();

  /** Holds the read; closes the sheet unless the holder is full. */
  const start = (force: boolean) => {
    const outcome = linkReads.submit(
      mode === 'text'
        ? { kind: 'text', text: input }
        : { kind: 'link', url: input },
      language,
      {
        ...(force ? { force } : {}),
        // Only the pasted text stands in for the read the Member left; a link typed over it does not.
        ...(mode === 'text' && prefill ? { replaces: prefill.replaces } : {}),
      },
    );
    if (outcome === 'full') {
      // Back to the form, where the alert lives (the duplicate panel has none).
      setDuplicate(null);
      setFull(true);
    } else onSubmitted();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (input === '' || checking) return;
    if (mode === 'text') return start(false);
    // A full holder refuses the read anyway: say so before asking the server anything.
    if (linkReads.getState().reads.length >= MAX_HELD_LINK_READS) {
      return setFull(true);
    }
    const attempt = new AbortController();
    checkAbort.current = attempt;
    setChecking(true);
    let recipeId: string | null = null;
    try {
      recipeId = (await checkRecipeLink(input, attempt.signal)).recipeId;
    } catch {
      // The check is a courtesy: when it fails, read anyway (a duplicate it missed is forced through by the holder).
    }
    if (attempt.signal.aborted) return;
    setChecking(false);
    if (recipeId === null) return start(false);
    setDuplicate({ recipeId, read: () => start(true) });
  };

  if (duplicate) {
    return (
      <Box sx={{ px: 2.5, pt: 1, pb: 2.5 }}>
        <AlreadyInRecipes
          ref={duplicateHeading}
          recipeId={duplicate.recipeId}
          onOpen={onSubmitted}
          onReadAgain={duplicate.read}
        />
      </Box>
    );
  }

  return (
    <Stack
      component="form"
      spacing={2}
      noValidate
      onSubmit={submit}
      aria-label={t('fromLink.heading')}
      sx={{ px: 2.5, pt: 1, pb: 2.5 }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <CookbookIcon size={24} aria-hidden="true" />
        <Typography component="h2" variant="h2">
          {t('fromLink.heading')}
        </Typography>
      </Stack>
      <Typography color="text.secondary">
        {t(mode === 'text' ? 'fromLink.textHint' : 'fromLink.hint')}
      </Typography>
      {full ? (
        <Alert>{t('fromLink.full', { count: MAX_HELD_LINK_READS })}</Alert>
      ) : null}
      <Box>
        <Typography
          component="label"
          htmlFor={fieldId}
          variant="sectionLabel"
          color="text.secondary"
          sx={{ display: 'block', mb: '6px' }}
        >
          {t(mode === 'text' ? 'fromLink.textLabel' : 'fromLink.label')}
        </Typography>
        {mode === 'text' ? (
          <TextField
            id={fieldId}
            multiline
            minRows={6}
            value={pasted}
            inputRef={field}
            onChange={(event) => {
              setFull(false);
              setPasted(event.target.value);
            }}
            sx={fieldSx}
            slotProps={{ htmlInput: { maxLength: MAX_PASTED_TEXT_LENGTH } }}
          />
        ) : (
          <TextField
            id={fieldId}
            type="url"
            value={url}
            inputRef={field}
            onChange={(event) => {
              setFull(false);
              setUrl(event.target.value);
            }}
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
        onClick={() => switchTo(mode === 'text' ? 'link' : 'text')}
        sx={{ alignSelf: 'flex-start' }}
      >
        {mode === 'text' ? t('fromLink.useLink') : t('fromLink.pasteSwitch')}
      </Button>
      <ReadingLanguageChoice
        value={language}
        onChange={setLanguage}
        input={mode}
      />
      {linkPrice ? (
        <Typography variant="meta" color="text.secondary">
          {t(mode === 'text' ? 'fromLink.priceText' : 'fromLink.priceLink', {
            price: linkPrice,
          })}
        </Typography>
      ) : null}
      <Button type="submit" fullWidth disabled={input === '' || checking}>
        {checking ? t('fromLink.checking') : t('fromLink.submit')}
      </Button>
    </Stack>
  );
}
