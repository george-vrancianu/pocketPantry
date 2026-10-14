import {
  Box,
  SegmentedTabs,
  segmentedTabId,
  segmentedTabPanelId,
} from '@pocket-pantry/ui';
import { useId, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { FamilyTab } from './components/FamilyTab';
import { YouTab } from './components/YouTab';

type TabId = 'you' | 'family';

/** `?tab=family` opens Family; anything else, including no tab, opens You. */
const tabFrom = (value: string | null): TabId =>
  value === 'family' ? 'family' : 'you';

export function SettingsPage() {
  const { t } = useTranslation('settings');
  const [params, setParams] = useSearchParams();
  const id = useId();
  const tab = tabFrom(params.get('tab'));

  // Each tab keeps its own scroll offset for as long as the page is mounted.
  const offsets = useRef<Partial<Record<TabId, number>>>({});
  const shown = useRef(tab);
  useLayoutEffect(() => {
    if (shown.current === tab) return;
    shown.current = tab;
    window.scrollTo({ top: offsets.current[tab] ?? 0 });
  }, [tab]);

  const selectTab = (next: TabId) => {
    if (next === tab) return;
    offsets.current[tab] = window.scrollY;
    const updated = new URLSearchParams(params);
    updated.set('tab', next);
    // Replace, not push: Back still leaves Settings rather than stepping between tabs.
    setParams(updated, { replace: true });
  };

  return (
    <>
      <AppScreenHeader title={t('title')} />
      <Box sx={{ mb: 2 }}>
        <SegmentedTabs<TabId>
          label={t('tabs.label')}
          id={id}
          tabs={[
            { value: 'you', label: t('tabs.you') },
            { value: 'family', label: t('tabs.family') },
          ]}
          value={tab}
          onChange={selectTab}
        />
      </Box>
      <Box
        role="tabpanel"
        id={segmentedTabPanelId(id, tab)}
        aria-labelledby={segmentedTabId(id, tab)}
      >
        {tab === 'you' ? <YouTab /> : <FamilyTab />}
      </Box>
    </>
  );
}
