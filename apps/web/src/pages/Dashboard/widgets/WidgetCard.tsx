import { Alert, Box, Card, Spinner, tokens } from '@pocket-pantry/ui';
import type { ElementType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { WidgetSize } from '../../../lib/dashboard';
import { widgetSpan, type GridColumns } from '../../../lib/layoutColumns';

type Props = {
  /** Accessible name of the card, also its visible title in most Widgets. */
  label: string;
  size: WidgetSize;
  /** The Dashboard grid's column count, passed down by the page. */
  columns: GridColumns;
  tone?: 'surface' | 'butter';
  /** Makes the whole card a link, as the Shopping and Pantry Stock Widgets are. */
  to?: string;
  /** Makes the whole card one button that opens a dialog, as the Pantry health Widget is. */
  onPress?: () => void;
  /** The button's accessible name when it is more than the label, e.g. the score and verdict. */
  pressLabel?: string;
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
  columns,
  tone = 'surface',
  to,
  onPress,
  pressLabel,
  isLoading = false,
  error = null,
  padding = '14px 16px',
  children,
}: Props) {
  const { t } = useTranslation('dashboard');
  const span = widgetSpan(size, columns);
  const butter = tone === 'butter';
  const linked = Boolean(to) && !isLoading && !error;
  const pressed = Boolean(onPress) && !isLoading && !error;
  const Component: ElementType = linked ? Link : pressed ? 'button' : 'section';

  return (
    <Card
      component={Component}
      {...(linked ? { to } : {})}
      {...(pressed
        ? { type: 'button', onClick: onPress, 'aria-haspopup': 'dialog' }
        : {})}
      aria-label={pressed ? (pressLabel ?? label) : label}
      sx={{
        gridColumn: `span ${span.columns}`,
        gridRow: `span ${span.rows}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: size === 'small' ? 136 : undefined,
        boxSizing: 'border-box',
        p: padding,
        // The butter Widget is a filled card with no edge line.
        ...(butter
          ? { bgcolor: tokens.color.butter, borderColor: 'transparent' }
          : {}),
        color: tokens.color.ink,
        textDecoration: 'none',
        ...(pressed
          ? {
              width: '100%',
              font: 'inherit',
              textAlign: 'left',
              cursor: 'pointer',
              '&:active': { transform: 'scale(.985)' },
            }
          : {}),
      }}
    >
      {isLoading ? (
        <Box sx={{ m: 'auto' }}>
          <Spinner label={t('common:loading')} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        children
      )}
    </Card>
  );
}

/** Icon and title row at the top of a Widget. */
export function WidgetTitle({
  icon,
  children,
  color = tokens.color.muted,
  component = 'div',
}: {
  icon: ReactNode;
  children: ReactNode;
  color?: string;
  /** `span` inside a button card, which may hold only phrasing content. */
  component?: 'div' | 'span';
}) {
  return (
    <Box
      component={component}
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
