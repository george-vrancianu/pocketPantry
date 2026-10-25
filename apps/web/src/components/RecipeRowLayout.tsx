import { Box, ChevronRightIcon, tokens, displayType } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type LayoutProps = {
  title: ReactNode;
  /** A line between the title and the meta. */
  above?: ReactNode;
  meta: string[];
  /** Undefined leaves the time column out. */
  minutes?: number | null;
  pills?: ReactNode;
  /** Makes the row a link... */
  to?: string;
  /** ...or a button; with neither, a plain row. */
  onClick?: () => void;
  dimmed?: boolean;
  'aria-label'?: string;
  /** A control beside the row (not inside its link or button), e.g. Explore's add button. */
  trailing?: ReactNode;
};

/** The row's look, for a Recipe in a list and for a Recipe in a Meal plan's slot. */
export function RecipeRowLayout({
  title,
  above,
  meta,
  minutes,
  pills,
  to,
  onClick,
  dimmed,
  'aria-label': ariaLabel,
  trailing,
}: LayoutProps) {
  const { t } = useTranslation('recipes');
  const inner = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: 66,
    boxSizing: 'border-box',
    p: '12px 4px',
    color: tokens.color.ink,
    textDecoration: 'none',
    opacity: dimmed ? 0.55 : 1,
    ...(to === undefined && onClick === undefined ? {} : { cursor: 'pointer' }),
    ...(trailing ? { flex: 1, minWidth: 0 } : {}),
  } as const;
  const content = (
    <>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Box>
        {above}
        {meta.length > 0 ? (
          <Box
            sx={{ fontSize: 13, fontWeight: 500, color: tokens.color.muted }}
          >
            {meta.join(' · ')}
          </Box>
        ) : null}
        {pills}
      </Box>
      {minutes === undefined ? null : (
        <Box
          sx={{
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {minutes === null ? (
            <Box
              sx={{ fontSize: 11, fontWeight: 600, color: tokens.color.muted }}
            >
              —
            </Box>
          ) : (
            <>
              <Box sx={{ ...displayType, fontSize: 17 }}>{minutes}</Box>
              <Box
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.color.muted,
                }}
              >
                {t('minutesShort')}
              </Box>
            </>
          )}
        </Box>
      )}
      {to !== undefined || onClick !== undefined ? (
        <Box aria-hidden sx={{ display: 'flex', color: tokens.color.muted }}>
          <ChevronRightIcon size={16} />
        </Box>
      ) : null}
    </>
  );
  return (
    <Box
      component="li"
      sx={{
        '& + &': { borderTop: `1px solid ${tokens.color.line}` },
        ...(trailing
          ? { display: 'flex', alignItems: 'center', gap: '8px' }
          : {}),
      }}
    >
      {to !== undefined ? (
        <Box component={Link} to={to} sx={inner}>
          {content}
        </Box>
      ) : onClick !== undefined ? (
        <Box
          component="button"
          type="button"
          aria-label={ariaLabel}
          onClick={onClick}
          sx={{
            ...inner,
            width: '100%',
            border: 0,
            bgcolor: 'transparent',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          {content}
        </Box>
      ) : (
        <Box sx={inner}>{content}</Box>
      )}
      {trailing}
    </Box>
  );
}
