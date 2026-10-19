import {
  Alert,
  Box,
  Sheet,
  Typography,
  tokens,
  ShoppingIcon,
  PantryIcon,
  SearchIcon,
  AlertIcon,
  CloseIcon,
  IconButton,
  radius,
  shadow,
} from '@pocket-pantry/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@pocket-pantry/ui';
import { HeardCard } from './HeardCard';
import { ReviewFooter } from './ReviewFooter';
import { VoiceActionRow } from './VoiceActionRow';
import {
  blockOf,
  displayName,
  groupsOf,
  hasAmount,
  isActionable,
  isChange,
} from './reviewModel';
import { translateApiError } from '../../i18n/translateApiError';
import { useScanLanguage } from '../../pages/Scan/hooks/useScanLanguage';
import { parseAmountText } from '../../lib/pantry';
import {
  catalogChangeQueryKeys,
  shoppingListChangeQueryKeys,
} from '../../lib/queryKeys';
import {
  applyVoiceActions,
  type VoiceApplyResult,
  type VoiceReviewAction,
} from '../../lib/voice';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNoteStore';

const quantityText = (action: VoiceReviewAction) =>
  action.quantity === null ? '' : String(action.quantity);

/**
 * Review for a Voice Note, over the current page: the Voice Actions grouped by list, each edited in place, and
 * Discard and Apply. Mounted while there is a Voice Note to review, so each one starts with a clean sheet.
 */
export function VoiceReview() {
  const { phase } = useVoiceNoteState();
  return phase === 'review' || phase === 'applying' ? <ReviewSheet /> : null;
}

function ReviewSheet() {
  const { t } = useTranslation(['voice', 'common']);
  const { proposal, page, phase, recording } = useVoiceNoteState();
  const { locale, scanLanguage } = useScanLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const body = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  const actions = proposal?.actions ?? [];
  const transcript = proposal?.transcript ?? '';
  // What the server heard of each expiry, to tell it from one picked here.
  const [spoken] = useState(
    () => new Map(actions.map((a) => [a.id, a.expiresOn])),
  );
  const language = recording?.scanLanguage ?? scanLanguage;

  const groups = groupsOf(actions, page);
  const changes = actions.filter(isChange);
  const applicable = actions.filter(isActionable);
  const unclear = actions.filter((a) => !isChange(a));
  const blocking = groups.flatMap((g) => g.actions).find((a) => blockOf(a));

  const [openId, setOpenId] = useState<string | null>(blocking?.id ?? null);
  const [confirming, setConfirming] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  // What the Member typed in each amount field; the store only takes valid amounts.
  const [typed, setTyped] = useState<Record<string, string>>({});
  const textOf = (a: VoiceReviewAction) => typed[a.id] ?? quantityText(a);
  const invalid = new Set(
    applicable
      .filter((a) => hasAmount(a) && !parseAmountText(textOf(a)).valid)
      .map((a) => a.id),
  );

  const applying = phase === 'applying';
  const apply = useMutation({
    mutationFn: () => {
      voiceNote.applying();
      return applyVoiceActions(applicable, locale);
    },
    onError: () => voiceNote.applyFailed(),
    onSuccess: (result: VoiceApplyResult) => {
      const skipped = result.skipped.flatMap(({ id, reason }) => {
        const action = actions.find((a) => a.id === id);
        return action
          ? [
              `${displayName(action)} (${t(`voice:skipReason.${reason}`, {
                defaultValue: t('voice:skipReason.other'),
              })})`,
            ]
          : [];
      });
      voiceNote.discard();
      toast.show(
        [
          t('voice:toast.applied', { count: result.applied.length }),
          skipped.length > 0
            ? t('voice:toast.skipped', { names: skipped.join(', ') })
            : null,
        ]
          .filter(Boolean)
          .join(' '),
      );
      void Promise.all(
        [
          ['shopping-list'],
          ['pantry'],
          ...shoppingListChangeQueryKeys,
          ...catalogChangeQueryKeys.filter(
            (key) => key[0] === 'pantry' || key[0] === 'recipes',
          ),
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
  });

  const discard = () => {
    voiceNote.discard();
    toast.show(
      `${t('voice:review.footer.discarded')} · ${t('voice:review.footer.discardedHint')}`,
    );
  };

  // Focus: the row that holds Apply back, else the title.
  const focusPicker = (id: string) => {
    const picker = body.current?.querySelector<HTMLElement>(
      `[data-voice-picker="${id}"]`,
    );
    if (!picker) return false;
    picker.scrollIntoView?.({ block: 'center' });
    picker.focus();
    return true;
  };
  useEffect(() => {
    if (focusId === null) return;
    if (focusPicker(focusId)) setFocusId(null);
  }, [focusId, openId]);

  const count = changes.length;
  const both = new Set(changes.map((a) => a.target)).size > 1;
  const subline =
    count === 0
      ? t('voice:review.sublineNothing')
      : t(both ? 'voice:review.sublineBoth' : 'voice:review.subline', {
          count,
        });

  const renderRow = (action: VoiceReviewAction) => (
    <VoiceActionRow
      key={action.id}
      action={action}
      open={openId === action.id}
      typed={textOf(action)}
      invalid={invalid.has(action.id)}
      spokenExpiry={spoken.get(action.id) ?? null}
      onToggle={() => setOpenId((id) => (id === action.id ? null : action.id))}
      onTyped={(text) => {
        setTyped((current) => ({ ...current, [action.id]: text }));
        const parsed = parseAmountText(text);
        if (parsed.valid) voiceNote.edit(action.id, { quantity: parsed.value });
      }}
    />
  );

  return (
    <Sheet
      open
      onClose={() => undefined}
      dismissable={false}
      onEscape={() => setConfirming(true)}
      onEntered={() => {
        if (!blocking || !focusPicker(blocking.id)) title.current?.focus();
      }}
      label={t('voice:review.title')}
      header={
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1.5 }}>
          <Typography
            component="h2"
            variant="h2"
            tabIndex={-1}
            ref={title}
            sx={{ outline: 'none' }}
          >
            {t('voice:review.title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.color.muted }}>
            {subline}
          </Typography>
        </Box>
      }
      footer={
        <ReviewFooter
          count={applicable.length}
          blocked={blocking ? blockOf(blocking) : null}
          invalid={invalid.size > 0}
          applying={applying}
          confirming={confirming}
          onAsk={() => setConfirming(true)}
          onKeep={() => setConfirming(false)}
          onDiscard={discard}
          onApply={() => apply.mutate()}
          onBlockedApply={() => {
            if (!blocking) return;
            setOpenId(blocking.id);
            setFocusId(blocking.id);
          }}
        />
      }
    >
      <Box
        ref={body}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          px: 2,
          pb: 2,
        }}
      >
        {apply.isError ? (
          <Alert>{translateApiError(t, apply.error)}</Alert>
        ) : null}

        <HeardCard
          transcript={transcript}
          language={language}
          seconds={recording?.seconds}
          defaultOpen={changes.length === 0}
        />

        {groups.map((group) => (
          <Group
            key={group.list}
            label={t(`voice:review.lists.${group.list}`)}
            icon={
              group.list === 'shopping' ? (
                <ShoppingIcon size={15} />
              ) : (
                <PantryIcon size={15} />
              )
            }
            count={group.actions.length}
            tag={group.named ? t('voice:review.namedIt') : null}
          >
            {group.actions.map(renderRow)}
          </Group>
        ))}

        {unclear.length > 0 ? (
          <Group
            label={t('voice:review.couldnt')}
            count={unclear.length}
            tag={null}
          >
            {unclear.map((action) => (
              <CouldntRow key={action.id} action={action} />
            ))}
          </Group>
        ) : null}
      </Box>
    </Sheet>
  );
}

function Group({
  label,
  icon,
  count,
  tag,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  count: number;
  tag: string | null;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" aria-label={label}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          px: '4px',
          pb: '6px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '.07em',
          textTransform: 'uppercase',
          color: tokens.color.muted,
        }}
      >
        {icon}
        <span>{label}</span>
        {tag ? (
          <Box
            component="span"
            sx={{
              ml: '4px',
              px: '8px',
              py: '1px',
              borderRadius: '999px',
              backgroundColor: tokens.color.chipNeutral,
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {tag}
          </Box>
        ) : null}
        <Box component="span" sx={{ ml: 'auto' }}>
          {count}
        </Box>
      </Box>
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          backgroundColor: tokens.color.surface,
          border: `1px solid ${tokens.color.line}`,
          borderRadius: radius.card,
          boxShadow: shadow.card,
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** A Voice Action the server could not act on: what was said and why, with no editor. */
function CouldntRow({ action }: { action: VoiceReviewAction }) {
  const { t } = useTranslation('voice');
  const notFound = action.status === 'notFound';
  const name = displayName(action);
  const reason = notFound
    ? t(
        action.target === 'pantry'
          ? 'review.reason.notFoundPantry'
          : 'review.reason.notFoundShopping',
        { name },
      )
    : t('review.reason.notUnderstood');
  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        display: 'flex',
        gap: '11px',
        py: '10px',
        pl: '12px',
        pr: '52px',
        '& + &': { borderTop: `1px solid ${tokens.color.divider}` },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '10px',
          display: 'grid',
          placeItems: 'center',
          border: `1.5px dashed ${tokens.color.line}`,
          color: tokens.color.muted,
        }}
      >
        {notFound ? <SearchIcon size={18} /> : <AlertIcon size={18} />}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: 15 }}>
          <Box component="span" sx={{ color: tokens.color.muted }}>
            {t(notFound ? 'review.notFound' : 'review.notUnderstood')}{' '}
          </Box>
          <Box component="span" sx={{ fontWeight: 600 }}>
            “{action.text}”
          </Box>
        </Box>
        <Box sx={{ fontSize: 12.5, color: tokens.color.muted }}>{reason}</Box>
      </Box>
      <Box sx={{ position: 'absolute', right: 8, top: 12 }}>
        <IconButton
          label={t('review.hide', { text: action.text })}
          tone="plain"
          size={34}
          onClick={() => voiceNote.remove(action.id)}
        >
          <CloseIcon size={17} />
        </IconButton>
      </Box>
    </Box>
  );
}
