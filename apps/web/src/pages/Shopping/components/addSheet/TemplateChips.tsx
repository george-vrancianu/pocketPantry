import {
  Box,
  Chip,
  TemplateIcon,
  tokens,
  insetFocusRing,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useTemplates } from '../../../../lib/shoppingTemplates';

export type TemplateChipsProps = {
  /** Opens a template's apply view. */
  onOpenTemplate: (id: string) => void;
  /** Switches to the Templates tab. */
  onSeeAll: () => void;
};

/** "Or start from a template": one chip per template; hidden without templates. */
export function TemplateChips({
  onOpenTemplate,
  onSeeAll,
}: TemplateChipsProps) {
  const { t, i18n } = useTranslation(['shopping', 'templates']);
  const templates = useTemplates(i18n.language);
  const { color } = tokens;
  if (!templates.data || templates.data.length === 0) return null;

  return (
    <Box component="section" aria-label={t('shopping:templatesFromSearch')}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Box
          component="h3"
          sx={{
            m: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: color.muted,
          }}
        >
          {t('shopping:templatesFromSearch')}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onSeeAll}
          sx={{
            border: 0,
            p: 0,
            background: 'none',
            color: color.accent,
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            ...insetFocusRing,
          }}
        >
          {t('shopping:seeAll')}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {templates.data.map((template) => (
          <Chip
            key={template.id}
            onClick={() => onOpenTemplate(template.id)}
            icon={<TemplateIcon size={16} />}
            label={template.name}
            meta={t('templates:list.items', { count: template.lineCount })}
          />
        ))}
      </Box>
    </Box>
  );
}
