import { Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { Difficulty } from '../../../lib/adminRecipes';
import type { NamedRef } from '../../../lib/recipes';
import { Servings } from './Servings';

type Props = {
  cuisine?: NamedRef | null;
  method?: NamedRef | null;
  servings?: number;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  difficulty?: Difficulty | null;
};

/** A dot-separated summary line: Cuisine, Method, Servings, times and difficulty (whichever are known). */
export function RecipeMeta(props: Props) {
  const { t } = useTranslation('recipes');
  const parts = [
    props.cuisine?.name,
    props.method?.name,
    props.servings === undefined ? null : (
      <Servings servings={props.servings} />
    ),
    props.prepMinutes
      ? t('prep', { time: t('minutes', { count: props.prepMinutes }) })
      : null,
    props.cookMinutes
      ? t('cook', { time: t('minutes', { count: props.cookMinutes }) })
      : null,
    props.difficulty ? t(`difficulty.${props.difficulty}`) : null,
  ].filter((part) => part !== null && part !== undefined);
  if (parts.length === 0) return null;
  return (
    <Typography variant="meta" color="text.secondary" component="p">
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 ? ' · ' : null}
          {part}
        </span>
      ))}
    </Typography>
  );
}
