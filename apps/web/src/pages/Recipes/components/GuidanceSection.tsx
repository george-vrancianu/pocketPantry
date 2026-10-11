import { Box, Link, Stack, Typography, tokens } from '@pocket-pantry/ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  DetailEatingMoment,
  DetailPairing,
  PairingKind,
} from '../../../lib/recipes';
import { Section } from './Section';
import type { SectionProps } from './sections';

const KINDS: PairingKind[] = ['food', 'drink'];
const POLARITIES: DetailEatingMoment['polarity'][] = ['good_for', 'avoid'];

function PairingItem({ pairing }: { pairing: DetailPairing }) {
  const { t } = useTranslation('recipes');
  const { link } = pairing;
  return (
    <Box component="li">
      {link?.type === 'recipe' ? (
        <Link
          href={`/recipes/${link.id}`}
          title={link.title}
          sx={{ fontWeight: 600 }}
        >
          {pairing.label}
        </Link>
      ) : (
        <Typography component="span" sx={{ fontWeight: 600 }}>
          {pairing.label}
        </Typography>
      )}
      {link?.type === 'ingredient' &&
      !pairing.label.toLowerCase().includes(link.name.toLowerCase()) ? (
        <Typography variant="meta" color="text.secondary" component="span">
          {' · '}
          {link.name}
        </Typography>
      ) : null}
      {pairing.principle ? (
        <Typography variant="meta" color="text.secondary" component="p">
          {t(`principles.${pairing.principle}`)}
        </Typography>
      ) : null}
      <Typography color="text.secondary" component="p">
        {pairing.reason}
      </Typography>
    </Box>
  );
}

function PairingsSection({ pairings }: { pairings: DetailPairing[] }) {
  const { t } = useTranslation('recipes');
  if (pairings.length === 0) return null;
  return (
    <Section title={t('sections.pairings')}>
      <Stack spacing={1.5}>
        {KINDS.map((kind) => {
          const items = pairings.filter((p) => p.kind === kind);
          if (items.length === 0) return null;
          const label = t(`pairingKind.${kind}`);
          return (
            <div key={kind}>
              <Typography variant="meta" color="text.secondary" component="p">
                {label}
              </Typography>
              <Stack
                component="ul"
                aria-label={label}
                spacing={1}
                sx={{ listStyle: 'none', m: 0, p: 0 }}
              >
                {items.map((pairing) => (
                  <PairingItem key={pairing.id} pairing={pairing} />
                ))}
              </Stack>
            </div>
          );
        })}
      </Stack>
    </Section>
  );
}

function WhenToEatSection({ moments }: { moments: DetailEatingMoment[] }) {
  const { t } = useTranslation('recipes');
  if (moments.length === 0) return null;
  return (
    <Section title={t('sections.whenToEat')}>
      <Stack spacing={1.5}>
        {POLARITIES.map((polarity) => {
          const items = moments.filter((m) => m.polarity === polarity);
          if (items.length === 0) return null;
          const label = t(`eatingPolarity.${polarity}`);
          return (
            <div key={polarity}>
              <Typography variant="meta" color="text.secondary" component="p">
                {label}
              </Typography>
              <Stack
                component="ul"
                aria-label={label}
                spacing={1}
                sx={{ listStyle: 'none', m: 0, p: 0 }}
              >
                {items.map((moment) => (
                  <Box component="li" key={moment.eatingMomentId}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        fontSize: 12,
                        fontWeight: 700,
                        px: '10px',
                        py: '4px',
                        borderRadius: `${tokens.radius.chip}px`,
                        bgcolor:
                          polarity === 'avoid'
                            ? tokens.color.soonBg
                            : tokens.color.okBg,
                        color:
                          polarity === 'avoid'
                            ? tokens.color.soonFg
                            : tokens.color.okFg,
                      }}
                    >
                      {moment.name}
                    </Box>
                    {moment.reason ? (
                      <Typography color="text.secondary" component="p">
                        {moment.reason}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </div>
          );
        })}
      </Stack>
    </Section>
  );
}

/**
 * Pairings, When to Eat and Nutrition, then the fixed guidance disclaimer.
 * Empty parts are left out; with no guidance at all nothing renders.
 */
export function GuidanceSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  const { pairings, eatingMoments, nutritionNote } = recipe.guidance;
  if (pairings.length + eatingMoments.length === 0 && !nutritionNote) {
    return null;
  }
  return (
    <Fragment>
      <PairingsSection pairings={pairings} />
      <WhenToEatSection moments={eatingMoments} />
      {nutritionNote ? (
        <Section title={t('sections.nutrition')}>
          <Typography>{nutritionNote}</Typography>
        </Section>
      ) : null}
      <Typography variant="meta" color="text.secondary" component="p">
        {t('disclaimer')}
      </Typography>
    </Fragment>
  );
}
