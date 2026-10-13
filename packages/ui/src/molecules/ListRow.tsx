import type { ReactNode } from 'react';
import { Box } from '../atoms/Layout';
import { Typography } from '../atoms/Typography';
import { tokens } from '../theme/tokens';

export type ListRowProps = {
  /** Before the text: a tick, an icon tile. */
  leading?: ReactNode;
  /** The row's name; one line, ellipsised. */
  title: ReactNode;
  /** Under the title: quantity, expiry. */
  meta?: ReactNode;
  /** After the text: small tags. */
  tags?: ReactNode;
  /** At the trailing edge, outside the main area: a star, buttons or fields. */
  trailing?: ReactNode;
  /** Full-width content under the main line, e.g. a confirmation or a form. */
  below?: ReactNode;
  /** Strikes the title through and greys it, as on a checked-off row. */
  done?: boolean;
  /** Wraps the leading/text/tags area, e.g. in a button that makes it clickable. */
  wrapMain?: (main: ReactNode) => ReactNode;
};

/**
 * A `<li>` for lists of rows: leading, title, meta, tags and trailing slots, min height 56, 8 vertical padding,
 * a 1 px divider between rows. Layout only; place it in a `<ul>`.
 */
export function ListRow({
  leading,
  title,
  meta,
  tags,
  trailing,
  below,
  done = false,
  wrapMain,
}: ListRowProps) {
  const main = (
    <Box
      sx={{
        flexGrow: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {leading ? <Box sx={{ flexShrink: 0 }}>{leading}</Box> : null}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 15,
            fontWeight: done ? 500 : 600,
            ...(done
              ? {
                  textDecoration: 'line-through',
                  color: tokens.color.checkedText,
                }
              : {}),
          }}
        >
          {title}
        </Typography>
        {meta ? (
          <Typography
            component="span"
            variant="meta"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            {meta}
          </Typography>
        ) : null}
      </Box>
      {tags ? <Box sx={{ flexShrink: 0 }}>{tags}</Box> : null}
    </Box>
  );

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        minHeight: 56,
        boxSizing: 'border-box',
        py: '8px',
        '& + &': { borderTop: `1px solid ${tokens.color.divider}` },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: 40,
        }}
      >
        {wrapMain ? wrapMain(main) : main}
        {trailing ? <Box sx={{ flexShrink: 0 }}>{trailing}</Box> : null}
      </Box>
      {below}
    </Box>
  );
}
