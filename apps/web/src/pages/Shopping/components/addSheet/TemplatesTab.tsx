import {
  Alert,
  Box,
  ChevronRightIcon,
  Link,
  Spinner,
  TemplateIcon,
  Typography,
  tokens,
  Card,
  radius,
  insetFocusRing,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../../i18n/translateApiError';
import { useTemplates } from '../../../../lib/shoppingTemplates';

export type TemplatesTabProps = {
  /** Opens the apply view of a template. */
  onOpenTemplate: (id: string) => void;
};

/** The Templates tab's list view: one row per template. */
export function TemplatesTab({ onOpenTemplate }: TemplatesTabProps) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const templates = useTemplates(i18n.language);
  const { color } = tokens;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            component="h3"
            variant="sectionLabel"
            sx={{ color: color.muted }}
          >
            {t('templates:apply.section')}
          </Typography>
          <Link href="/shopping/templates">{t('templates:manage')}</Link>
        </Box>
        {templates.isPending ? <Spinner label={t('common:loading')} /> : null}
        {templates.error ? (
          <Alert>{translateApiError(t, templates.error)}</Alert>
        ) : null}
        {templates.data && templates.data.length === 0 ? (
          <Typography color="text.secondary">
            {t('templates:apply.none')}
          </Typography>
        ) : null}
        {templates.data && templates.data.length > 0 ? (
          <Card variant="list" sx={{ p: 0 }}>
            {templates.data.map((template) => (
              <Box
                key={template.id}
                component="button"
                type="button"
                onClick={() => onOpenTemplate(template.id)}
                sx={{
                  width: '100%',
                  minHeight: 58,
                  p: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  border: 0,
                  borderTop: `1px solid ${color.divider}`,
                  '&:first-of-type': { borderTop: 0 },
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  ...insetFocusRing,
                }}
              >
                <Tile icon={<TemplateIcon size={20} />} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </Box>
                  <Box
                    sx={{
                      fontSize: 12.5,
                      color: color.muted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {[
                      t('templates:list.items', { count: template.lineCount }),
                      ...(template.previewNames.length > 0
                        ? [template.previewNames.join(', ')]
                        : []),
                    ].join(' · ')}
                  </Box>
                </Box>
                <Box aria-hidden sx={{ display: 'flex', color: color.muted }}>
                  <ChevronRightIcon size={18} />
                </Box>
              </Box>
            ))}
          </Card>
        ) : null}
      </Box>
    </Box>
  );
}

function Tile({
  icon,
  accent = false,
}: {
  icon: React.ReactNode;
  accent?: boolean;
}) {
  const { color } = tokens;
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 40,
        height: 40,
        display: 'grid',
        placeItems: 'center',
        borderRadius: radius.control,
        backgroundColor: accent ? color.accentTint : color.butter,
        color: accent ? color.accentOnTint : color.butterInk,
      }}
    >
      {icon}
    </Box>
  );
}
