import {
  Box,
  Sheet,
  SegmentedTabs,
  Typography,
  segmentedTabId,
  segmentedTabPanelId,
  tokens,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NewShoppingItem } from '../../../../lib/shopping';
import { IngredientsTab } from './IngredientsTab';

type SheetTab = 'ingredients' | 'templates';

export type AddSheetProps = {
  open: boolean;
  onClose: () => void;
  adding: boolean;
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
  /** Why the last add failed, or null. */
  addError: string | null;
};

/**
 * The Add sheet: a header with Done, the Ingredients and Templates tabs, and
 * the selected tab's panel. What belongs to one opening (tab, adds so far)
 * resets whenever it opens; the lists polled behind it never reset it.
 */
export function AddSheet({
  open,
  onClose,
  adding,
  onAdd,
  addError,
}: AddSheetProps) {
  const { t } = useTranslation('shopping');
  const tabsId = useId();
  const [tab, setTab] = useState<SheetTab>('ingredients');
  const [addedCount, setAddedCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTab('ingredients');
      setAddedCount(0);
    }
  }
  const { color } = tokens;

  const header = (
    <Box sx={{ p: '10px 16px 10px 20px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {t('sheet.title')}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={onClose}
          aria-label={
            addedCount > 0
              ? t('sheet.doneCount', { count: addedCount })
              : t('sheet.done')
          }
          sx={{
            height: 36,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: 0,
            borderRadius: 999,
            cursor: 'pointer',
            backgroundColor: color.ink,
            color: '#FFFFFF',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {addedCount > 0 ? (
            <Box
              component="span"
              aria-hidden
              sx={{
                minWidth: 20,
                height: 20,
                px: '5px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 999,
                backgroundColor: color.accent,
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {addedCount}
            </Box>
          ) : null}
          <span aria-hidden>{t('sheet.done')}</span>
        </Box>
      </Box>
      <SegmentedTabs
        label={t('sheet.tabsLabel')}
        id={tabsId}
        tabs={[
          { value: 'ingredients', label: t('sheet.tabs.ingredients') },
          { value: 'templates', label: t('sheet.tabs.templates') },
        ]}
        value={tab}
        onChange={setTab}
      />
    </Box>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('sheet.title')}
      header={header}
    >
      <Box
        role="tabpanel"
        id={segmentedTabPanelId(tabsId, tab)}
        aria-labelledby={segmentedTabId(tabsId, tab)}
        sx={{ p: '4px 20px 24px' }}
      >
        {tab === 'ingredients' ? (
          <IngredientsTab
            adding={adding}
            onAdd={onAdd}
            error={addError}
            onAdded={() => setAddedCount((count) => count + 1)}
          />
        ) : null}
      </Box>
    </Sheet>
  );
}
