import { Alert, Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCategoryOptions,
  useFamilySettings,
  useRemoveExpiryOverride,
  useSetExpiryOverride,
  useSetStaleThreshold,
} from '../../../lib/settings';

const isWholeDays = (value: string, max: number) => {
  const n = Number(value);
  return value.trim() !== '' && Number.isInteger(n) && n >= 1 && n <= max;
};

/** Family Settings: shared by every Member, so any Member may edit them. */
export function FamilySettingsSection() {
  const { t, i18n } = useTranslation('settings');
  const id = useId();
  const settings = useFamilySettings(i18n.language);
  const categories = useCategoryOptions(i18n.language);
  const setThreshold = useSetStaleThreshold();
  const setOverride = useSetExpiryOverride();
  const removeOverride = useRemoveExpiryOverride();

  const [threshold, setThresholdText] = useState('');
  const saved = settings.data?.staleThresholdDays;
  useEffect(() => {
    if (saved !== undefined) setThresholdText(String(saved));
  }, [saved]);

  const [categoryId, setCategoryId] = useState('');
  const [days, setDays] = useState('');

  const error = [
    settings.error,
    setThreshold.error,
    setOverride.error,
    removeOverride.error,
  ].find(Boolean);

  const submitThreshold = (event: FormEvent) => {
    event.preventDefault();
    if (isWholeDays(threshold, 365)) setThreshold.mutate(Number(threshold));
  };
  const submitOverride = (event: FormEvent) => {
    event.preventDefault();
    if (!categoryId || !isWholeDays(days, 3650)) return;
    setOverride.mutate(
      { categoryId, days: Number(days) },
      {
        onSuccess: () => {
          setCategoryId('');
          setDays('');
        },
      },
    );
  };

  return (
    <Stack component="section" spacing={2} aria-labelledby={`${id}-heading`}>
      <Typography
        id={`${id}-heading`}
        variant="sectionLabel"
        component="h2"
        color="text.secondary"
      >
        {t('family.title')}
      </Typography>
      <Typography variant="meta" color="text.secondary">
        {t('family.shared')}
      </Typography>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}

      <Stack component="form" spacing={1} onSubmit={submitThreshold}>
        <TextField
          id={`${id}-threshold`}
          type="number"
          label={t('family.staleThreshold')}
          helperText={t('family.staleThresholdHelp')}
          value={threshold}
          error={threshold !== '' && !isWholeDays(threshold, 365)}
          onChange={(event) => setThresholdText(event.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
        />
        <div>
          <Button
            type="submit"
            disabled={!isWholeDays(threshold, 365) || setThreshold.isPending}
          >
            {t('family.saveThreshold')}
          </Button>
        </div>
      </Stack>

      <Typography variant="body1" component="h3" sx={{ fontWeight: 700 }}>
        {t('family.overrides')}
      </Typography>
      <Typography variant="meta" color="text.secondary">
        {t('family.overridesHelp')}
      </Typography>
      {settings.data && settings.data.expiryOverrides.length === 0 ? (
        <Typography color="text.secondary">
          {t('family.noOverrides')}
        </Typography>
      ) : null}
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {settings.data?.expiryOverrides.map((override) => (
          <Stack
            component="li"
            key={override.categoryId}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>
              {t('family.overrideRow', {
                name: override.name,
                count: override.days,
              })}
            </span>
            <Button
              variant="text"
              disabled={removeOverride.isPending}
              aria-label={t('family.removeOverride', { name: override.name })}
              onClick={() => removeOverride.mutate(override.categoryId)}
            >
              {t('family.remove')}
            </Button>
          </Stack>
        ))}
      </Stack>

      <Stack component="form" spacing={1} onSubmit={submitOverride}>
        <TextField
          id={`${id}-category`}
          select
          label={t('family.category')}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          slotProps={{
            select: { native: true },
            inputLabel: { shrink: true },
          }}
        >
          <option value="">{t('family.chooseCategory')}</option>
          {categories.data?.parents.map((parent) => (
            <optgroup key={parent.id} label={parent.name}>
              <option value={parent.id}>
                {t('family.wholeParent', { name: parent.name })}
              </option>
              {parent.leaves.map((leaf) => (
                <option key={leaf.id} value={leaf.id}>
                  {leaf.name}
                </option>
              ))}
            </optgroup>
          ))}
        </TextField>
        <TextField
          id={`${id}-days`}
          type="number"
          label={t('family.days')}
          value={days}
          error={days !== '' && !isWholeDays(days, 3650)}
          onChange={(event) => setDays(event.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 3650, step: 1 } }}
        />
        <div>
          <Button
            type="submit"
            disabled={
              !categoryId || !isWholeDays(days, 3650) || setOverride.isPending
            }
          >
            {t('family.saveOverride')}
          </Button>
        </div>
      </Stack>
    </Stack>
  );
}
