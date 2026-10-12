import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useId, useState, type ReactNode, type Ref } from 'react';
import { MoreIcon } from '../atoms/icons';
import { IconButton } from '../atoms/IconButton';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  /** Renders the item as a link. */
  href?: string;
  onClick?: () => void;
  /** `urgent` colours a destructive item. */
  tone?: 'urgent';
};

export type ActionMenuProps = {
  /** Accessible name of the "…" button. */
  label: string;
  items: ActionMenuItem[];
  /** Ref to the "…" button, e.g. to return focus to it after an action is cancelled. */
  buttonRef?: Ref<HTMLButtonElement>;
};

/** A "…" icon button that opens a dropdown of actions. Escape, outside click and focus are handled by the MUI menu. */
export function ActionMenu({ label, items, buttonRef }: ActionMenuProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = useId();
  const close = () => setAnchor(null);
  return (
    <>
      <IconButton
        ref={buttonRef}
        label={label}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? menuId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <MoreIcon size={20} />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={close}
        transitionDuration={reduceMotion ? 0 : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 190,
              mt: '6px',
              borderRadius: '16px',
              border: `1px solid ${tokens.color.line}`,
              boxShadow: tokens.shadow.dock,
            },
          },
          list: { sx: { p: '6px' } },
        }}
      >
        {items.map((item) => {
          const urgent = item.tone === 'urgent';
          return (
            <MenuItem
              key={item.label}
              // `button` + `href` lets ButtonBase use the theme's LinkComponent (the router link).
              {...(item.href ? { component: 'button', href: item.href } : {})}
              onClick={() => {
                close();
                item.onClick?.();
              }}
              sx={{
                gap: '10px',
                height: 44,
                px: '12px',
                borderRadius: '10px',
                fontSize: 15,
                fontWeight: 600,
                color: urgent ? tokens.color.urgentFg : tokens.color.ink,
                '&:hover': { backgroundColor: tokens.color.subtle },
                '& svg': {
                  width: 18,
                  height: 18,
                  color: urgent ? tokens.color.urgentFg : tokens.color.muted,
                },
              }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
