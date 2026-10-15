import { Alert, Box, Stack, Typography } from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { AllergyWarning, AllergyWarningEntry } from '../../../lib/recipes';

/** Whose Allergy it is, as it reads in "Optional ingredient contains Milk: Mia". */
function whose(entry: AllergyWarningEntry, t: TFunction): string {
  const { owner } = entry;
  if (owner.kind === 'own') return t('allergyWarning.whoOwn');
  if (owner.kind === 'family') {
    return owner.label ?? t('allergyWarning.whoFamily');
  }
  return owner.name;
}

/** "Contains Peanuts: your Allergy", "Mia: Tree nuts". */
function phrase(entry: AllergyWarningEntry, t: TFunction): string {
  const name = entry.allergen.name;
  return entry.owner.kind === 'own'
    ? t('allergyWarning.strongOwn', { name })
    : t('allergyWarning.strongOther', { name, who: whose(entry, t) });
}

/**
 * The Allergy Warning above a Recipe's tabs (ADR 0014): strong when a required line contains one
 * of the Family's Allergies, softer when only optional or Unchecked lines might. The viewer's own
 * and Family Allergies come first; other Members' follow on a quieter second line. Never claims a
 * Recipe is free of anything; no warning means no banner.
 */
export function AllergyWarningBanner({ warning }: { warning: AllergyWarning }) {
  const { t } = useTranslation('recipes');
  const yours = warning.entries.filter((e) => e.owner.kind !== 'member');
  const members = warning.entries.filter((e) => e.owner.kind === 'member');
  const yoursStrong = yours.filter((e) => e.severity === 'strong');
  const yoursSoft = yours.filter((e) => e.severity === 'soft');
  const yoursStrongHeadline = yoursStrong.length > 0;
  const memberPhrase = (e: AllergyWarningEntry) =>
    t(
      e.severity === 'soft'
        ? 'allergyWarning.memberOptional'
        : 'allergyWarning.strongOther',
      { name: e.allergen.name, who: whose(e, t) },
    );
  return (
    <div
      role="group"
      aria-label={t('allergyWarning.title')}
      data-severity={warning.severity}
    >
      <Alert severity={warning.severity === 'strong' ? 'error' : 'warning'}>
        <Stack spacing={0.5}>
          {yoursStrongHeadline ? (
            <Box
              data-tier="yours"
              sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.5 }}
            >
              {yoursStrong.map((e, index) => (
                <Typography
                  key={`${e.allergen.id}-${index}`}
                  component="span"
                  sx={{ fontWeight: 700 }}
                >
                  {phrase(e, t)}
                </Typography>
              ))}
            </Box>
          ) : null}
          {yoursSoft.map((e, index) => (
            <Typography key={`optional-${e.allergen.id}-${index}`}>
              {t('allergyWarning.optionalLine', {
                name: e.allergen.name,
                who: whose(e, t),
              })}
            </Typography>
          ))}
          {members.length > 0 ? (
            <Box
              data-tier="members"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 1.5,
                opacity: 0.85,
              }}
            >
              {members.map((e, index) => (
                <Typography
                  key={`${e.allergen.id}-${index}`}
                  component="span"
                  variant="meta"
                >
                  {memberPhrase(e)}
                </Typography>
              ))}
            </Box>
          ) : null}
          {warning.uncheckedCount > 0 ? (
            <Typography>
              {t('allergyWarning.unchecked', { count: warning.uncheckedCount })}
            </Typography>
          ) : null}
        </Stack>
      </Alert>
    </div>
  );
}
