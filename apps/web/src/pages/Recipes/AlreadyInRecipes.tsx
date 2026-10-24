import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * "Already in your Recipes": the link the Member gave is a Recipe of their Family. They can open
 * it or read the page again anyway. The heading takes focus (the caller focuses it) so a screen
 * reader announces the panel as it appears.
 */
export const AlreadyInRecipes = forwardRef<
  HTMLHeadingElement,
  { onOpen: () => void; onReadAgain: () => void }
>(function AlreadyInRecipes({ onOpen, onReadAgain }, heading) {
  const { t } = useTranslation('recipes');
  return (
    <Stack
      component="section"
      spacing={1.5}
      aria-labelledby="already-in-recipes"
    >
      <Typography
        id="already-in-recipes"
        component="h2"
        variant="h6"
        tabIndex={-1}
        ref={heading}
      >
        {t('fromLink.duplicate.heading')}
      </Typography>
      <Typography color="text.secondary">
        {t('fromLink.duplicate.body')}
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button onClick={onOpen}>{t('fromLink.duplicate.open')}</Button>
        <Button variant="secondary" onClick={onReadAgain}>
          {t('fromLink.duplicate.readAgain')}
        </Button>
      </Stack>
    </Stack>
  );
});
