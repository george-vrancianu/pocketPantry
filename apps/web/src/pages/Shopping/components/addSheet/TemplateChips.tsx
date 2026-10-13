import { Box, TemplateIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useTemplates } from '../../../../lib/shoppingTemplates';
import { focusRing } from './focusRing';

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
            ...focusRing,
          }}
        >
          {t('shopping:seeAll')}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {templates.data.map((template) => (
          <Box
            key={template.id}
            component="button"
            type="button"
            onClick={() => onOpenTemplate(template.id)}
            sx={{
              minHeight: 40,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              border: `1px solid ${color.line}`,
              borderRadius: 999,
              backgroundColor: color.surface,
              color: color.ink,
              font: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              ...focusRing,
            }}
          >
            <Box aria-hidden sx={{ display: 'flex', color: color.butterInk }}>
              <TemplateIcon size={16} />
            </Box>
            {template.name}
            <Box
              component="span"
              sx={{ fontSize: 12.5, fontWeight: 500, color: color.muted }}
            >
              {t('templates:list.items', { count: template.lineCount })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
