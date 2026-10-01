import { Alert, Box, Spinner, tokens } from '@pocket-pantry/ui';
import type { ElementType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { WidgetSize } from '../../../lib/dashboard';
import { useGridColumns, widgetSpan } from '../../../lib/layoutColumns';

type Props = {
  /** Accessible name of the card, also its visible title in most Widgets. */
  label: string;
  size: WidgetSize;
  tone?: 'surface' | 'butter';
  /** Makes the whole card a link, as the Shopping and Pantry Stock Widgets are. */
  to?: string;
  /** Shown instead of the content while the Widget's data loads. */
  isLoading?: boolean;
  /** Shown instead of the content when the Widget's data failed to load. */
  error?: string | null;
  padding?: string;
  children: ReactNode;
};

/** The shared frame of every Widget: grid span from the size, surface tone, loading and error states. */
export function WidgetCard({
  label,
  size,
  tone = 'surface',
  to,
  isLoading = false,
  error = null,
  padding = '14px 16px',
  children,
}: Props) {
  const { t } = useTranslation('dashboard');
  const span = widgetSpan(size, useGridColumns());
  const butter = tone === 'butter';
  const linked = Boolean(to) && !isLoading && !error;
  const Component: ElementType = linked ? Link : 'section';

  return (
    <Box
      component={Component}
      {...(linked ? { to } : {})}
      aria-label={label}
      sx={{
        gridColumn: `span ${span.columns}`,
        gridRow: `span ${span.rows}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: span.rows === 2 ? 296 : size === 'small' ? 136 : undefined,
        boxSizing: 'border-box',
        p: padding,
        borderRadius: `${tokens.radius.widget}px`,
        bgcolor: butter ? tokens.color.butter : tokens.color.surface,
        border: butter ? 0 : `1px solid ${tokens.color.line}`,
        color: tokens.color.ink,
        textDecoration: 'none',
        minWidth: 0,
      }}
    >
      {isLoading ? (
        <Box sx={{ m: 'auto' }}>
          <Spinner label={t('loading')} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        children
      )}
    </Box>
  );
}

/** Icon and title row at the top of a Widget. */
export function WidgetTitle({
  icon,
  children,
  color = tokens.color.muted,
}: {
  icon: ReactNode;
  children: ReactNode;
  color?: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 13,
        fontWeight: 600,
        color,
      }}
    >
      {icon}
      {children}
    </Box>
  );
}
