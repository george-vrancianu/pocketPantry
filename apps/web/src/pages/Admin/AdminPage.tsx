import { Alert, SegmentedControl, Spinner, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { ScopeCaption, SectionHeading } from '../../components/SectionHeading';
import { CatalogIndex } from './components/CatalogIndex';
import { PromoCodes } from './components/PromoCodes';
import { UnmatchedQueue } from './components/UnmatchedQueue';
import { useAdminScreen } from './hooks/useAdminScreen';

/** The Admin shell: To review, Catalog (an index of sections) and Codes, with the tab kept in `?tab=`. */
export function AdminPage() {
  const { t } = useTranslation(['admin', 'common', 'settings']);
  const screen = useAdminScreen();
  const { catalog } = screen;

  return (
    <>
      <AppScreenHeader title={t('admin:title')} />
      <Stack spacing={3}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
        {catalog ? (
          <>
            <SegmentedControl
              label={t('admin:sections')}
              value={screen.tab}
              onChange={screen.setTab}
              fullWidth
              options={[
                { value: 'review', label: t('admin:tabs.review') },
                { value: 'catalog', label: t('admin:tabs.catalog') },
                { value: 'codes', label: t('admin:tabs.codes') },
              ]}
            />
            {screen.tab === 'review' ? (
              <Stack spacing={1.5}>
                <SectionHeading
                  id="admin-review-heading"
                  title={t('admin:review.title')}
                  scope={
                    <ScopeCaption
                      scope="admins"
                      label={t('settings:scope.admins')}
                    />
                  }
                />
                <UnmatchedQueue catalog={catalog} />
              </Stack>
            ) : screen.tab === 'catalog' ? (
              <CatalogIndex catalog={catalog} />
            ) : (
              <PromoCodes />
            )}
          </>
        ) : null}
      </Stack>
    </>
  );
}
