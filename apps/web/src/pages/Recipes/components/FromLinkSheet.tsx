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
import { Trans, useTranslation } from 'react-i18next';
import {
  CreditPrice,
  useCreditPriceText,
} from '../../../components/CreditPrice';
import { ReadingLanguageChoice } from '../../../components/ReadingLanguageChoice';
import { MAX_HELD_LINK_READS, linkReads } from '../../../lib/linkReads';
import {
  MAX_LINK_LENGTH,
  checkRecipeLink,
  type ReadingLanguage,
} from '../../../lib/linkRecipe';
import { AlreadyInRecipes } from '../AlreadyInRecipes';

/** The editor's 44 pt field. */
const fieldSx = {
  '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: radius.control },
  '& .MuiOutlinedInput-root:not(.MuiInputBase-multiline) input': {
    py: '10px',
  },
};

/**
 * "From a link", a sheet over Recipes: the Member gives the address of a recipe page and the read
 * goes to the link-read holder. Submitting closes the sheet; the read carries on in the background
 * strip, whatever page the Member goes to. The sheet reads nothing itself, so closing it never stops
 * a read.
 *
 * Pasted text has its own sheet ("From text"). The holder keeps at most five reads: a sixth is
 * refused here, asking the Member to review first.
 *
 * A link is checked first (a plain request that fetches nothing and costs nothing): if it is already
 * one of the Family's Recipes the sheet answers "Already in your Recipes" in place, with Open or Read
 * again. When the check fails the read goes ahead anyway; a duplicate it
 * missed is read as asked (the holder re-reads it with force).
 */
export function FromLinkSheet({
  open,
  onClose,
  onExited,
}: {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
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
      <FromLinkForm onSubmitted={onClose} />
    </Sheet>
  );
}

/** Mounted afresh each time the sheet opens, so an earlier read's link is never left in the field. */
function FromLinkForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { t } = useTranslation('recipes');
  const linkPrice = useCreditPriceText('link-page');
  const [url, setUrl] = useState('');
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
  const fieldId = useId();

  useEffect(() => () => checkAbort.current?.abort(), []);
  useEffect(() => {
    if (duplicate) duplicateHeading.current?.focus();
  }, [duplicate]);

  const input = url.trim();

  /** Holds the read; closes the sheet unless the holder is full. */
  const start = (force: boolean) => {
    const outcome = linkReads.submit(
      { kind: 'link', url: input },
      language,
      force ? { force } : {},
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
      <Typography color="text.secondary">{t('fromLink.hint')}</Typography>
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
          {t('fromLink.label')}
        </Typography>
        <TextField
          id={fieldId}
          type="url"
          value={url}
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
      </Box>
      <ReadingLanguageChoice value={language} onChange={setLanguage} />
      {linkPrice ? (
        <Typography variant="meta" color="text.secondary">
          <Trans
            t={t}
            i18nKey="fromLink.priceLink"
            components={{ price: <CreditPrice kind="link-page" /> }}
          />
        </Typography>
      ) : null}
      <Button type="submit" fullWidth disabled={input === '' || checking}>
        {checking ? t('fromLink.checking') : t('fromLink.submit')}
      </Button>
    </Stack>
  );
}
