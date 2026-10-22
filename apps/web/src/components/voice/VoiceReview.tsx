import {
  Alert,
  Box,
  Sheet,
  Typography,
  ShoppingIcon,
  PantryIcon,
  SearchIcon,
  AlertIcon,
  CloseIcon,
  IconButton,
  radius,
  useToast,
  shadow,
  palette,
} from '@pocket-pantry/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applyToast } from './applyResult';
import { focusVoiceButton } from '../../lib/voiceFocus';
import { voiceToast } from '../../lib/voicePlacement';
import { HeardCard } from './HeardCard';
import { ListPicker } from './ListPicker';
import { ReviewFooter } from './ReviewFooter';
import { VoiceActionRow } from './VoiceActionRow';
import {
  blockOf,
  displayName,
  groupsOf,
  hasAmount,
  isActionable,
  isChange,
  needsList,
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
  type VoiceList,
  type VoiceReviewAction,
} from '../../lib/voice';
import { flashRows } from '../../lib/rowFlash';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNote';

/** How long the Apply result stays: long enough to read, no Undo (ADR 0017). */
const APPLY_TOAST_MS = 5200;

/** The list every action with a pick is on, or '' when they are split or undecided. */
const allOn = (actions: VoiceReviewAction[]): VoiceList | '' => {
  const lists = new Set(actions.filter((a) => a.byList).map((a) => a.target));
  const [only] = lists;
  return lists.size === 1 && only ? only : '';
};

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
  const { t, i18n } = useTranslation(['voice', 'common']);
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
  const undecided = actions.filter(needsList);
  const unclear = actions.filter((a) => !isChange(a) && !needsList(a));
  const blocking = [...undecided, ...groups.flatMap((g) => g.actions)].find(
    (a) => blockOf(a),
  );
  const withPicker = actions.filter((a) => a.byList).length;

  const [openId, setOpenId] = useState<string | null>(
    blocking && blockOf(blocking) !== 'list' ? blocking.id : null,
  );
  const [confirming, setConfirming] = useState(false);
  const [keptReviewing, setKeptReviewing] = useState(false);
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
    onMutate: () => voiceNote.applying(),
    mutationFn: () => applyVoiceActions(applicable, locale),
    onError: () => voiceNote.applyFailed(),
    onSuccess: (result: VoiceApplyResult) => {
      const { message, detail } = applyToast(
        result,
        actions,
        page,
        t,
        i18n.language,
      );
      voiceNote.applied();
      // Only this page's rows: the other list's rows are not on screen to flash.
      flashRows(
        result.applied.flatMap((entry) =>
          entry.list !== page
            ? []
            : (entry.rowIds ?? (entry.rowId ? [entry.rowId] : [])),
        ),
      );
      toast.show(message, {
        ...voiceToast(),
        detail,
        duration: APPLY_TOAST_MS,
      });
      focusVoiceButton();
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
      voiceToast(),
    );
    focusVoiceButton();
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
  // Declining the Discard question hands focus back to the Discard button.
  useEffect(() => {
    if (!keptReviewing || confirming) return;
    document.querySelector<HTMLElement>('[data-voice-discard]')?.focus();
    // oxlint-disable-next-line react/set-state-in-effect -- one-shot focus request: focus is moved, then the request is cleared
    setKeptReviewing(false);
  }, [keptReviewing, confirming]);
  // A failed Apply puts its Alert at the top of the body; bring it into view.
  useEffect(() => {
    if (!apply.isError) return;
    body.current
      ?.querySelector('[role="alert"]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [apply.isError, apply.failureCount]);
  useEffect(() => {
    if (focusId === null) return;
    // oxlint-disable-next-line react/set-state-in-effect -- one-shot focus request: cleared once the picker is focused
    if (focusPicker(focusId)) setFocusId(null);
  }, [focusId, openId]);

  const count = changes.length + undecided.length;
  const both = new Set(changes.map((a) => a.target)).size > 1;
  const subline =
    count === 0
      ? t('voice:review.sublineNothing')
      : t(both ? 'voice:review.sublineBoth' : 'voice:review.subline', {
          count,
        });

  const pick = (action: VoiceReviewAction, list: VoiceList) => {
    voiceNote.pickList(action.id, list);
    // What was typed belonged to the other list's resolution.
    setTyped(({ [action.id]: _dropped, ...rest }) => rest);
    // A Pantry removal that needs a Batch opens on its picker.
    if (action.byList?.[list].status === 'needsBatch') {
      setOpenId(action.id);
      setFocusId(action.id);
    }
  };

  const renderRow = (action: VoiceReviewAction) => (
    <VoiceActionRow
      key={action.id}
      action={action}
      open={openId === action.id}
      typed={textOf(action)}
      invalid={invalid.has(action.id)}
      spokenExpiry={spoken.get(action.id) ?? null}
      onPick={(list) => pick(action, list)}
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
      onEscape={() => {
        if (!applying) setConfirming(true);
      }}
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
          <Typography sx={{ fontSize: 13, color: palette('text-secondary') }}>
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
          onKeep={() => {
            setConfirming(false);
            setKeptReviewing(true);
          }}
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
        inert={applying}
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
          durationMs={recording?.durationMs}
          defaultOpen={actions.every((a) => a.status === 'notUnderstood')}
        />

        {withPicker > 1 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              px: '4px',
              fontSize: 13,
              fontWeight: 600,
              color: palette('text-secondary'),
            }}
          >
            <span aria-hidden>{t('voice:review.putAll.label')}</span>
            <Box sx={{ flex: 1 }}>
              <ListPicker
                label={t('voice:review.putAll.name')}
                value={allOn(actions)}
                onChange={(list) => {
                  voiceNote.pickAllLists(list);
                  setTyped({});
                }}
              />
            </Box>
          </Box>
        ) : null}

        {undecided.length > 0 ? (
          <Group
            label={t('voice:review.pickList.group')}
            count={undecided.length}
            tag={null}
          >
            {undecided.map(renderRow)}
          </Group>
        ) : null}

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
              <CouldntRow
                key={action.id}
                action={action}
                onPick={(list) => pick(action, list)}
              />
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
          color: palette('text-secondary'),
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
              backgroundColor: palette('pp-chip'),
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
          backgroundColor: palette('background-paper'),
          border: `1px solid ${palette('pp-line')}`,
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
function CouldntRow({
  action,
  onPick,
}: {
  action: VoiceReviewAction;
  onPick: (list: VoiceList) => void;
}) {
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
        '& + &': { borderTop: `1px solid ${palette('divider')}` },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: radius.control,
          display: 'grid',
          placeItems: 'center',
          border: `1.5px dashed ${palette('pp-line')}`,
          color: palette('text-secondary'),
        }}
      >
        {notFound ? <SearchIcon size={18} /> : <AlertIcon size={18} />}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: 15 }}>
          <Box component="span" sx={{ color: palette('text-secondary') }}>
            {t(notFound ? 'review.notFound' : 'review.notUnderstood')}{' '}
          </Box>
          <Box component="span" sx={{ fontWeight: 600 }}>
            “{action.text}”
          </Box>
        </Box>
        <Box sx={{ fontSize: 12.5, color: palette('text-secondary') }}>
          {reason}
        </Box>
        {action.byList ? (
          <Box sx={{ pt: '8px' }}>
            <ListPicker
              label={t('review.pickList.label', { name })}
              value={action.target ?? ''}
              onChange={onPick}
            />
          </Box>
        ) : null}
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
