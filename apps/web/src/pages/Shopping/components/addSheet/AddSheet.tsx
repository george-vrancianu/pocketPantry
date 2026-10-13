import {
  Box,
  Sheet,
  SegmentedTabs,
  Typography,
  segmentedTabId,
  segmentedTabPanelId,
  tokens,
} from '@pocket-pantry/ui';
import { useCallback, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NewShoppingItem } from '../../../../lib/shopping';
import { ApplyTemplateView } from './ApplyTemplateView';
import { SaveTemplateView } from './SaveTemplateView';
import { TemplatesTab } from './TemplatesTab';
import type { Suggestion } from '../../../../lib/suggestions';
import {
  emptyIngredients,
  IngredientsTab,
  type IngredientsState,
} from './IngredientsTab';

/** The Templates tab's sub-views: the list, the save view, or applying one template. */
export type TemplatesView = 'list' | 'save' | { apply: string };

/** Where the sheet opens. */
export type SheetView =
  { tab: 'ingredients' } | { tab: 'templates'; view: TemplatesView };

type SheetTab = SheetView['tab'];

export type AddSheetProps = {
  open: boolean;
  /** The view each opening starts on; Ingredients by default. */
  initialView?: SheetView;
  onClose: () => void;
  adding: boolean;
  onAdd: (item: NewShoppingItem) => Promise<boolean>;
  /** Why the last add failed, or null. */
  addError: string | null;
  /** Missing Staples, suggested while the search is empty. */
  staples: Suggestion[];
  /** Ingredients recently used up, suggested while the search is empty. */
  usedUp: Suggestion[];
};

/**
 * The Add sheet: a header with Done, the Ingredients and Templates tabs, and
 * the selected tab's panel. It owns everything that belongs to one opening
 * (tab, Templates sub-view, query, open row, typed amount and unit, adds so
 * far) so it survives switching tabs. All of it resets whenever the sheet
 * opens; the lists polled behind it never reset it.
 */
export function AddSheet({
  open,
  initialView = { tab: 'ingredients' },
  onClose,
  adding,
  onAdd,
  addError,
  staples,
  usedUp,
}: AddSheetProps) {
  const { t } = useTranslation('shopping');
  const tabsId = useId();
  const [tab, setTab] = useState<SheetTab>(initialView.tab);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);
  // Whether the current view has a footer; none while it loads or fails.
  const [footerWanted, setFooterWanted] = useState(false);
  const wantFooter = useCallback(
    (wanted: boolean) => setFooterWanted(wanted),
    [],
  );
  const [templatesView, setTemplatesView] = useState<TemplatesView>(
    initialView.tab === 'templates' ? initialView.view : 'list',
  );
  const [ingredients, setIngredients] =
    useState<IngredientsState>(emptyIngredients);
  const [addedCount, setAddedCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTab(initialView.tab);
      setTemplatesView(
        initialView.tab === 'templates' ? initialView.view : 'list',
      );
      setIngredients(emptyIngredients);
      setAddedCount(0);
    }
  }
  const selectTab = (next: SheetTab) => {
    // Changing tabs returns Templates to its list view.
    if (next !== tab) setTemplatesView('list');
    setTab(next);
  };
  const openTemplate = (templateId: string) => {
    setTab('templates');
    setTemplatesView({ apply: templateId });
  };
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
        onChange={selectTab}
      />
    </Box>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('sheet.title')}
      header={header}
      footer={
        tab === 'templates' && templatesView !== 'list' && footerWanted ? (
          <Box ref={setFooterHost} />
        ) : undefined
      }
      onEntered={() => {
        // Do not steal focus from a field the Member has already reached.
        const focused = document.activeElement;
        if (
          !focused ||
          focused === document.body ||
          focused.getAttribute('role') === 'dialog'
        ) {
          searchRef.current?.focus();
        }
      }}
    >
      <Box
        role="tabpanel"
        id={segmentedTabPanelId(tabsId, tab)}
        aria-labelledby={segmentedTabId(tabsId, tab)}
        sx={{ p: '4px 20px 24px' }}
      >
        {tab === 'ingredients' ? (
          <IngredientsTab
            state={ingredients}
            onStateChange={setIngredients}
            searchRef={searchRef}
            adding={adding}
            onAdd={onAdd}
            error={addError}
            staples={staples}
            usedUp={usedUp}
            onAdded={() => setAddedCount((count) => count + 1)}
            onOpenTemplate={openTemplate}
            onSeeAllTemplates={() => selectTab('templates')}
          />
        ) : typeof templatesView === 'object' ? (
          <ApplyTemplateView
            templateId={templatesView.apply}
            onBack={() => setTemplatesView('list')}
            onApplied={onClose}
            footerHost={footerHost}
            onFooterWanted={wantFooter}
          />
        ) : templatesView === 'save' ? (
          <SaveTemplateView
            onBack={() => setTemplatesView('list')}
            footerHost={footerHost}
            onFooterWanted={wantFooter}
          />
        ) : (
          <TemplatesTab
            onOpenTemplate={openTemplate}
            onSave={() => setTemplatesView('save')}
          />
        )}
      </Box>
    </Sheet>
  );
}
