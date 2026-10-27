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
import { ReadingLanguageChoice } from '../../../components/ReadingLanguageChoice';
import { MAX_HELD_LINK_READS, linkReads } from '../../../lib/linkReads';

/** The state "Paste text instead" hands the Recipes page: open the sheet in text mode, the link kept. */
export type FromLinkPrefill = { url: string; replaces: number };
export const FROM_LINK_PREFILL_STATE = 'fromLinkPrefill';
import {
  MAX_LINK_LENGTH,
  MAX_PASTED_TEXT_LENGTH,
  type ReadingLanguage,
} from '../../../lib/linkRecipe';

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
  // Both are kept, so switching modes never loses what the Member typed.
  const [url, setUrl] = useState(prefill?.url ?? '');
  const [pasted, setPasted] = useState('');
  const [language, setLanguage] = useState<ReadingLanguage>('catalog');
  const [full, setFull] = useState(false);
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

  const input = (mode === 'text' ? pasted : url).trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (input === '') return;
    const outcome = linkReads.submit(
      mode === 'text'
        ? { kind: 'text', text: input }
        : { kind: 'link', url: input },
      language,
      // Only the pasted text stands in for the read the Member left; a link typed over it does not.
      mode === 'text' ? prefill?.replaces : undefined,
    );
    if (outcome === 'full') setFull(true);
    else onSubmitted();
  };

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
      <Button type="submit" fullWidth disabled={input === ''}>
        {t('fromLink.submit')}
      </Button>
    </Stack>
  );
}
