import { useTranslation } from 'react-i18next';

/** How many servings a Recipe makes. The single place the Servings stepper (#157) replaces. */
export function Servings({ servings }: { servings: number }) {
  const { t } = useTranslation('recipes');
  return <span>{t('servings', { count: servings })}</span>;
}
