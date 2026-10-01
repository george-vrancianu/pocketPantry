import Box from '@mui/material/Box';
import type { MouseEventHandler, ReactNode } from 'react';
import { HomeIcon } from '../atoms/icons';
import { IconButton } from '../atoms/IconButton';
import { Typography } from '../atoms/Typography';

export type ScreenHeaderAction = {
  /** Accessible name of the icon-only button. */
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
};

export type ScreenHeaderProps = {
  title: string;
  /** Accessible name of the Home button. */
  homeLabel: string;
  homeHref?: string;
  /** The single action on the right: add, search or share. */
  action?: ScreenHeaderAction;
};

/** Sub-screen header: Home button, H1 title, one action button. */
export function ScreenHeader({
  title,
  homeLabel,
  homeHref = '/',
  action,
}: ScreenHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pt: '24px',
        pb: '14px',
      }}
    >
      <IconButton label={homeLabel} href={homeHref}>
        <HomeIcon size={20} />
      </IconButton>
      <Typography variant="h2" component="h1" sx={{ flexGrow: 1, minWidth: 0 }}>
        {title}
      </Typography>
      {action ? (
        <IconButton
          label={action.label}
          tone="accent"
          href={action.href}
          onClick={action.onClick}
        >
          {action.icon}
        </IconButton>
      ) : null}
    </Box>
  );
}
