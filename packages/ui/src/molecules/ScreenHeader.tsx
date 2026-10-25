import Box from '@mui/material/Box';
import type { MouseEventHandler, ReactNode, Ref } from 'react';
import { BackIcon, HomeIcon } from '../atoms/icons';
import { IconButton } from '../atoms/IconButton';
import { ActionMenu, type ActionMenuItem } from './ActionMenu';
import { Typography } from '../atoms/Typography';
import { tokens } from '../theme/tokens';
import { radius } from '../theme/themeVars';

export type ScreenHeaderAction = {
  /** Accessible name of the icon-only button. */
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Turns the button into a menu of these items (e.g. two ways to add a Recipe); `href` and `onClick` are then ignored. */
  items?: ActionMenuItem[];
  /** Ref to the button, e.g. to return focus to it when a sheet it opened closes. */
  buttonRef?: Ref<HTMLButtonElement>;
};

export type ScreenHeaderProps = {
  /** Omit to leave the header without a title (the screen then carries its own H1). */
  title?: string;
  /** A muted line under the title. Needs `title`; ignored without it. */
  subtitle?: string;
  /** The Home button, only where the Dock is hidden (the Dock carries Home elsewhere). Omit to leave it out. */
  home?: { label: string; href?: string };
  /** The single action on the right, the only button there: add, search or share. */
  action?: ScreenHeaderAction;
  /** Content right-aligned in the header, e.g. counter chips on wide screens. */
  trailing?: ReactNode;
  /** A Back link to `href`, in place of the Home button. */
  back?: {
    label: string;
    href: string;
    /** A "+n" count on Back's corner, hidden at 0; the label should name it too. It bumps when it grows. */
    badge?: number;
  };
  /** Makes the title programmatically focusable, so a screen can move focus to it. Needs `title`. */
  titleRef?: Ref<HTMLHeadingElement>;
};

/** Sub-screen header: optional Back or Home button, H1 title, optional trailing content (e.g. counter chips), one action button. */
export function ScreenHeader({
  title,
  subtitle,
  home,
  action,
  trailing,
  titleRef,
  back,
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
      {back ? (
        <Box sx={{ position: 'relative', display: 'flex' }}>
          <IconButton label={back.label} href={back.href}>
            <BackIcon size={20} />
          </IconButton>
          {back.badge ? (
            <Box
              key={back.badge}
              aria-hidden
              data-testid="back-badge"
              sx={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                minWidth: 20,
                height: 20,
                px: '5px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.pill,
                bgcolor: tokens.color.accent,
                color: 'pp.accentInk',
                boxShadow: `0 0 0 2px ${tokens.color.bg}`,
                fontSize: 11,
                fontWeight: 700,
                pointerEvents: 'none',
                '@keyframes ppBadgeBump': {
                  '0%': { transform: 'scale(1)' },
                  '40%': { transform: 'scale(1.3)' },
                  '100%': { transform: 'scale(1)' },
                },
                '@media (prefers-reduced-motion: no-preference)': {
                  animation: 'ppBadgeBump 400ms ease-out',
                },
              }}
            >
              +{back.badge}
            </Box>
          ) : null}
        </Box>
      ) : home ? (
        <IconButton label={home.label} href={home.href ?? '/'}>
          <HomeIcon size={20} />
        </IconButton>
      ) : null}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {title ? (
          <Typography
            variant="h2"
            component="h1"
            ref={titleRef}
            tabIndex={titleRef ? -1 : undefined}
            sx={{ outline: 'none', overflowWrap: 'break-word' }}
          >
            {title}
          </Typography>
        ) : null}
        {subtitle ? (
          <Typography
            sx={{ fontSize: 13, color: tokens.color.muted, mt: '2px' }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {trailing}
      {action ? <HeaderAction {...action} /> : null}
    </Box>
  );
}

/** The header's one action: an accent button, or a menu when it has `items`. */
function HeaderAction({
  label,
  icon,
  href,
  onClick,
  items,
  buttonRef,
}: ScreenHeaderAction) {
  return items ? (
    <ActionMenu
      label={label}
      tone="accent"
      icon={icon}
      items={items}
      buttonRef={buttonRef}
    />
  ) : (
    <IconButton
      ref={buttonRef}
      label={label}
      tone="accent"
      href={href}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  );
}
