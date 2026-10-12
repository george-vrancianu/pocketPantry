import { Box, Link, Stack, Typography, tokens } from '@pocket-pantry/ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { PairingKind } from '../../../lib/recipeVocabulary';
import type { DetailEatingMoment, DetailPairing } from '../../../lib/recipes';
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
  // Good-for moments first, then the ones to avoid.
  const ordered = POLARITIES.flatMap((polarity) =>
    moments.filter((m) => m.polarity === polarity),
  );
  return (
    <Section title={t('sections.whenToEat')}>
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {ordered.map((moment) => {
          const avoid = moment.polarity === 'avoid';
          return (
            <Box
              component="li"
              key={moment.eatingMomentId}
              sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
            >
              <Box
                component="span"
                sx={{
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  px: '10px',
                  py: '4px',
                  borderRadius: `${tokens.radius.chip}px`,
                  bgcolor: avoid ? tokens.color.soonBg : tokens.color.okBg,
                  color: avoid ? tokens.color.soonFg : tokens.color.okFg,
                }}
              >
                {t(`eatingPolarity.${moment.polarity}`)} · {moment.name}
              </Box>
              {moment.reason ? (
                <Typography
                  component="span"
                  sx={{
                    fontSize: 13.5,
                    lineHeight: 1.4,
                    color: tokens.color.muted,
                  }}
                >
                  {moment.reason}
                </Typography>
              ) : null}
            </Box>
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
export function GuidanceSection({ recipe }: Pick<SectionProps, 'recipe'>) {
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
