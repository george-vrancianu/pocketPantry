import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Alert,
  Box,
  CheckIcon,
  PlusIcon,
  Spinner,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { translateApiError } from '../../i18n/translateApiError';
import {
  useDashboardLayout,
  type WidgetInstance,
  type WidgetSize,
} from '../../lib/dashboard';
import {
  addWidget,
  availableWidgetTypes,
  moveWidget,
  removeWidget,
  resizeWidget,
  useEditDashboardLayout,
} from '../../lib/dashboardLayout';
import { WIDGET_REGISTRY } from '../Dashboard/widgets/registry';
import { WidgetPreview } from './WidgetPreview';

const FOCUS_RING = {
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: 2,
  },
};

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function RoundButton({
  label,
  tone,
  onClick,
  ariaDisabled,
  children,
}: {
  label: string;
  tone: 'urgent' | 'accent' | 'plain';
  onClick: () => void;
  ariaDisabled?: boolean;
  children: ReactNode;
}) {
  const colors = {
    urgent: { bgcolor: tokens.color.urgentBg, color: tokens.color.urgentFg },
    accent: { bgcolor: tokens.color.accent, color: '#FFFFFF' },
    plain: { bgcolor: 'transparent', color: tokens.color.muted },
  }[tone];
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      aria-disabled={ariaDisabled || undefined}
      onClick={ariaDisabled ? undefined : onClick}
      sx={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: '20px',
        border: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...colors,
        ...(ariaDisabled ? { opacity: 0.35, cursor: 'default' } : {}),
        ...FOCUS_RING,
      }}
    >
      {children}
    </Box>
  );
}

type RowProps = {
  widget: WidgetInstance;
  index: number;
  total: number;
  onMove: (to: number) => void;
  onResize: (size: WidgetSize) => void;
  onRemove: () => void;
};

function WidgetRow({
  widget,
  index,
  total,
  onMove,
  onResize,
  onRemove,
}: RowProps) {
  const { t } = useTranslation(['customise', 'dashboard']);
  const definition = WIDGET_REGISTRY[widget.type] as
    (typeof WIDGET_REGISTRY)[typeof widget.type] | undefined;
  const name = definition
    ? t(definition.nameKey, { ns: 'dashboard' })
    : widget.type;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });
  const otherSize: WidgetSize = widget.size === 'wide' ? 'small' : 'wide';
  const canResize = Boolean(definition?.sizes.includes(otherSize));
  const current = t(`size.${widget.size}`);

  return (
    <Box
      component="li"
      ref={setNodeRef}
      aria-label={name}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: prefersReducedMotion() ? undefined : transition,
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        minHeight: 58,
        borderTop: `1px solid ${tokens.color.divider}`,
        bgcolor: isDragging ? tokens.color.accentTint : tokens.color.surface,
        position: 'relative',
        zIndex: isDragging ? 1 : 0,
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Box
        component="button"
        type="button"
        ref={setActivatorNodeRef}
        data-handle={widget.id}
        {...attributes}
        {...listeners}
        aria-label={t('reorder', { name })}
        sx={{
          flexShrink: 0,
          width: 40,
          height: 40,
          border: 0,
          bgcolor: 'transparent',
          color: tokens.color.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          touchAction: 'none',
          borderRadius: '10px',
          ...FOCUS_RING,
        }}
      >
        <Glyph>
          <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
        </Glyph>
      </Box>
      <Typography
        component="span"
        sx={{ flexGrow: 1, minWidth: 0, fontSize: 15, fontWeight: 600 }}
      >
        {name}
      </Typography>
      <RoundButton
        label={t('moveUp', { name })}
        tone="plain"
        ariaDisabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        <Glyph>
          <path d="m6 15 6-6 6 6" />
        </Glyph>
      </RoundButton>
      <RoundButton
        label={t('moveDown', { name })}
        tone="plain"
        ariaDisabled={index === total - 1}
        onClick={() => onMove(index + 1)}
      >
        <Glyph>
          <path d="m6 9 6 6 6-6" />
        </Glyph>
      </RoundButton>
      <Box
        component="button"
        type="button"
        disabled={!canResize}
        aria-label={
          canResize
            ? t('sizeToggle', {
                name,
                current,
                next: t(`size.${otherSize}`),
              })
            : t('sizeLocked', { name, current })
        }
        onClick={() => onResize(otherSize)}
        sx={{
          flexShrink: 0,
          height: 32,
          px: '10px',
          borderRadius: '10px',
          border: `1px solid ${tokens.color.line}`,
          bgcolor: '#F7F9F5',
          color: tokens.color.ink,
          fontFamily: 'inherit',
          fontSize: 12,
          fontWeight: 600,
          cursor: canResize ? 'pointer' : 'default',
          '&:disabled': { color: tokens.color.muted },
          ...FOCUS_RING,
        }}
      >
        {current}
      </Box>
      <RoundButton
        label={t('remove', { name })}
        tone="urgent"
        onClick={onRemove}
      >
        <Glyph>
          <path d="M6 12h12" />
        </Glyph>
      </RoundButton>
    </Box>
  );
}

/** The customise screen: reorder, resize and remove Widgets, and add the types not yet on the Dashboard. */
export function CustomisePage() {
  const { t } = useTranslation(['customise', 'dashboard']);
  const layout = useDashboardLayout();
  const editor = useEditDashboardLayout();
  const [status, setStatus] = useState('');
  const [focus, setFocus] = useState<
    { kind: 'row'; id: string } | { kind: 'list' } | null
  >(null);
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Adding or removing unmounts the focused control, so hand focus to a sensible neighbour.
  useEffect(() => {
    if (!focus) return;
    if (focus.kind === 'row') {
      listRef.current
        ?.querySelectorAll<HTMLElement>('[data-handle]')
        .forEach((handle) => {
          if (handle.dataset.handle === focus.id) handle.focus();
        });
    } else {
      headingRef.current?.focus();
    }
    setFocus(null);
  }, [focus, layout.data]);

  if (layout.isPending) {
    return (
      <>
        <AppScreenHeader title={t('title')} />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Spinner label={t('loading', { ns: 'dashboard' })} />
        </Box>
      </>
    );
  }
  if (layout.error) {
    return (
      <>
        <AppScreenHeader title={t('title')} />
        <Alert severity="error">{translateApiError(t, layout.error)}</Alert>
      </>
    );
  }

  const widgets = layout.data.widgets;
  const nameOf = (widget: Pick<WidgetInstance, 'type'>) => {
    const definition = WIDGET_REGISTRY[widget.type] as
      (typeof WIDGET_REGISTRY)[typeof widget.type] | undefined;
    return definition
      ? t(definition.nameKey, { ns: 'dashboard' })
      : widget.type;
  };
  const nameById = (id: UniqueIdentifier) => {
    const widget = widgets.find((w) => w.id === id);
    return widget ? nameOf(widget) : '';
  };
  const position = (id: UniqueIdentifier | undefined) =>
    widgets.findIndex((w) => w.id === id) + 1;

  const move = (id: string, to: number) => {
    editor.edit((current) => moveWidget(current, id, to));
    setStatus(
      t('announce.movedTo', {
        name: nameById(id),
        position: to + 1,
        total: widgets.length,
      }),
    );
  };
  const remove = (id: string, index: number) => {
    const neighbour = widgets[index + 1] ?? widgets[index - 1];
    setStatus(t('announce.removed', { name: nameById(id) }));
    editor.edit((current) => removeWidget(current, id));
    setFocus(neighbour ? { kind: 'row', id: neighbour.id } : { kind: 'list' });
  };
  const add = (type: WidgetInstance['type']) => {
    const id = crypto.randomUUID();
    editor.edit((current) => addWidget(current, type, () => id));
    setStatus(t('announce.added', { name: nameOf({ type }) }));
    setFocus({ kind: 'row', id });
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const to = widgets.findIndex((w) => w.id === over.id);
    editor.edit((current) =>
      arrayMove(
        current,
        current.findIndex((w) => w.id === active.id),
        to,
      ),
    );
  };

  const available = availableWidgetTypes(widgets);

  return (
    <>
      <AppScreenHeader
        title={t('title')}
        action={{ label: t('done'), icon: <CheckIcon size={20} />, href: '/' }}
      />
      <Typography variant="meta" color="text.secondary" sx={{ mb: '16px' }}>
        {t('hint')}
      </Typography>

      {editor.error ? (
        <Box sx={{ mb: 1 }}>
          <Alert severity="error">{translateApiError(t, editor.error)}</Alert>
        </Box>
      ) : null}

      <Typography
        id="customise-on-dashboard"
        component="h2"
        ref={headingRef}
        tabIndex={-1}
        sx={{
          mb: '8px',
          fontSize: 12,
          fontWeight: 700,
          color: tokens.color.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          '&:focus-visible': { outline: `3px solid ${tokens.color.accent}` },
        }}
      >
        {t('onDashboard')}
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{
          screenReaderInstructions: { draggable: t('dragInstructions') },
          announcements: {
            onDragStart: ({ active }) =>
              t('announce.pickedUp', { name: nameById(active.id) }),
            onDragOver: ({ active, over }) =>
              over
                ? t('announce.movedTo', {
                    name: nameById(active.id),
                    position: position(over.id),
                    total: widgets.length,
                  })
                : undefined,
            onDragEnd: ({ active, over }) =>
              over
                ? t('announce.dropped', {
                    name: nameById(active.id),
                    position: position(over.id),
                    total: widgets.length,
                  })
                : undefined,
            onDragCancel: () => t('announce.cancelled'),
          },
        }}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box
            component="ul"
            ref={listRef}
            aria-labelledby="customise-on-dashboard"
            sx={{
              listStyle: 'none',
              m: 0,
              p: '0 10px',
              bgcolor: tokens.color.surface,
              border: `1px solid ${tokens.color.line}`,
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {widgets.map((widget, index) => (
              <WidgetRow
                key={widget.id}
                widget={widget}
                index={index}
                total={widgets.length}
                onMove={(to) => move(widget.id, to)}
                onResize={(size) =>
                  editor.edit((current) =>
                    resizeWidget(current, widget.id, size),
                  )
                }
                onRemove={() => remove(widget.id, index)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
      {widgets.length === 0 ? (
        <Typography variant="meta" color="text.secondary" sx={{ mt: 1 }}>
          {t('emptyList')}
        </Typography>
      ) : null}

      <Box
        component="section"
        aria-labelledby="customise-add"
        sx={{ mt: '22px', pb: 3 }}
      >
        <Typography
          id="customise-add"
          component="h2"
          sx={{
            mb: '8px',
            fontSize: 12,
            fontWeight: 700,
            color: tokens.color.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {t('addWidgets')}
        </Typography>
        {available.length === 0 ? (
          <Typography variant="meta" color="text.secondary">
            {t('allAdded')}
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {available.map((type) => {
              const name = nameOf({ type });
              return (
                <Box
                  key={type}
                  sx={{
                    bgcolor: tokens.color.surface,
                    border: `1px solid ${tokens.color.line}`,
                    borderRadius: '20px',
                    p: '10px',
                  }}
                >
                  <WidgetPreview type={type} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: '8px',
                      gap: '4px',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{ fontSize: 14, fontWeight: 700, pl: '4px' }}
                    >
                      {name}
                    </Typography>
                    <RoundButton
                      label={t('add', { name })}
                      tone="accent"
                      onClick={() => add(type)}
                    >
                      <PlusIcon size={18} />
                    </RoundButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {status}
      </Box>
    </>
  );
}
