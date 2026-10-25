import {
  Box,
  Button,
  ChevronDownIcon,
  IconButton,
  Stack,
  TextField,
  Toggle,
  Typography,
  useToast,
  type ToastHandle,
} from '@pocket-pantry/ui';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type CatalogSearchResult, type Unit } from '../../lib/catalog';
import {
  AddToCatalog,
  ADD_TO_CATALOG_TRIGGER,
} from '../catalogSearch/AddToCatalog';
import {
  moved,
  type DraftProblems,
  type LineDraft,
} from '../../lib/recipeDraft';
import { UNDO_WINDOW_MS } from '../../lib/useDeferredRemoval';
import { FamilyTag } from '../catalogSearch/FamilyTag';
import { RowControls } from '../RowControls';
import { GripGlyph, reordered, SortableItem, SortableList } from './sortable';

type Props = {
  lines: LineDraft[];
  problems: DraftProblems;
  onChange: (lines: LineDraft[]) => void;
  /** Whether a line is a Family Ingredient (shows the Family pill). */
  isFamily?: (line: LineDraft) => boolean;
  /** Family editor: an Unmatched line's strip offers "Add to your catalog"; called with the Ingredient it became. */
  onMatched?: (line: LineDraft, ingredient: CatalogSearchResult) => void;
  /** Key of a line the host just appended: its quantity takes focus. */
  focusKey?: number | null;
  /** The search that adds a line, shown under the list. */
  children: ReactNode;
};

/** The ordered Ingredient Lines of a Recipe draft: one row each, rare controls behind a ⌄ strip. */
export function RecipeLinesSection({
  lines,
  problems,
  onChange,
  isFamily,
  onMatched,
  focusKey,
  children,
}: Props) {
  const { t } = useTranslation(['admin', 'common', 'recipes', 'catalog']);
  const toast = useToast();
  const [openKey, setOpenKey] = useState<number | null>(null);
  const [addingKey, setAddingKey] = useState<number | null>(null);
  const addTriggers = useRef(new Map<number, HTMLButtonElement>());
  // Pointer, touch and key events in the add-to-catalog UI must not reach the row's drag sensors.
  const keepOutOfRow = (event: { stopPropagation: () => void }) =>
    event.stopPropagation();

  // Undo builds on the newest lines, not on what rendered when the toast appeared.
  const latest = useRef({ lines, onChange });
  useLayoutEffect(() => {
    latest.current = { lines, onChange };
  });
  // The toast outlives this page: take it down when we go.
  const undoToast = useRef<ToastHandle | null>(null);
  useEffect(() => () => undoToast.current?.close(), []);

  // The host names the line it just appended; that line's quantity takes focus.
  const qtyInputs = useRef(new Map<number, HTMLInputElement>());
  useEffect(() => {
    if (focusKey != null) qtyInputs.current.get(focusKey)?.focus();
  }, [focusKey]);

  const changeLine = (key: number, patch: Partial<LineDraft>) =>
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const removeLine = (line: LineDraft, index: number, name: string) => {
    onChange(lines.filter((item) => item.key !== line.key));
    setOpenKey(null);
    undoToast.current = toast.show(t('common:row.removed', { name }), {
      polite: true,
      duration: UNDO_WINDOW_MS,
      action: {
        label: t('common:row.undo'),
        onClick: () => {
          const current = latest.current.lines;
          if (current.some((item) => item.key === line.key)) return;
          const next = [...current];
          next.splice(Math.min(index, next.length), 0, line);
          latest.current.onChange(next);
        },
      },
    });
  };

  return (
    <Stack
      component="fieldset"
      spacing={1.5}
      sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
    >
      <Typography component="legend" variant="sectionLabel">
        {t('admin:recipe.lines.title')}
      </Typography>
      {lines.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.lines.empty')}
        </Typography>
      ) : (
        <Stack
          component="ol"
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <SortableList
            keys={lines.map((line) => line.key)}
            nameOf={(key) =>
              lines.find((line) => line.key === key)?.name ||
              t('admin:recipe.lines.unknown')
            }
            onReorder={(from, to) => onChange(reordered(lines, from, to))}
            onLift={() => {
              setOpenKey(null);
              setAddingKey(null);
            }}
          >
            {lines.map((line, index) => {
              const name = line.name || t('admin:recipe.lines.unknown');
              const bad = problems.lines[line.key];
              const open = openKey === line.key;
              const errorId = `line-qty-error-${line.key}`;
              const stripId = `line-strip-${line.key}`;
              const sub = [
                line.optional ? t('admin:recipe.lines.optionalSub') : null,
                line.note || null,
                line.ingredientId === ''
                  ? t('recipes:family.freeTextNote')
                  : null,
              ].filter(Boolean);
              return (
                <SortableItem
                  key={line.key}
                  id={line.key}
                  gripLabel={t('admin:recipe.reorder.grip', { name })}
                >
                  {({ row, grip }) => (
                    <Stack
                      component="li"
                      {...row}
                      sx={{
                        ...row.sx,
                        // Keep the open popover above the rows after this one.
                        zIndex: addingKey === line.key ? 2 : row.sx.zIndex,
                        p: 1,
                        borderTop: index === 0 ? 0 : 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <Box component="button" {...grip}>
                          <GripGlyph />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: 'center' }}
                          >
                            <Typography
                              noWrap
                              sx={{
                                fontWeight: 600,
                                minWidth: 0,
                                opacity: line.optional ? 0.7 : 1,
                              }}
                            >
                              {name}
                            </Typography>
                            {isFamily?.(line) ? <FamilyTag /> : null}
                          </Stack>
                          {sub.length > 0 ? (
                            <Typography
                              noWrap
                              variant="meta"
                              color="text.secondary"
                            >
                              {sub.join(' · ')}
                            </Typography>
                          ) : null}
                        </Box>
                        <TextField
                          hiddenLabel
                          placeholder="–"
                          value={line.quantity}
                          onChange={(event) =>
                            changeLine(line.key, {
                              quantity: event.target.value,
                            })
                          }
                          error={bad}
                          slotProps={{
                            htmlInput: {
                              ref: (node: HTMLInputElement | null) => {
                                if (node) qtyInputs.current.set(line.key, node);
                                else qtyInputs.current.delete(line.key);
                              },
                              inputMode: 'decimal',
                              'aria-label': t('admin:recipe.lines.quantity', {
                                name,
                              }),
                              'aria-describedby': bad ? errorId : undefined,
                              style: { textAlign: 'right' },
                            },
                          }}
                          sx={{ width: 72 }}
                        />
                        <TextField
                          select
                          hiddenLabel
                          value={line.unit}
                          onChange={(event) =>
                            changeLine(line.key, {
                              unit: event.target.value as Unit,
                            })
                          }
                          slotProps={{
                            select: { native: true },
                            htmlInput: {
                              'aria-label': t('admin:recipe.lines.unit', {
                                name,
                              }),
                            },
                          }}
                          sx={{ width: 88 }}
                        >
                          {UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {t(`common:units.${unit}`)}
                            </option>
                          ))}
                        </TextField>
                        <IconButton
                          tone="plain"
                          size={40}
                          label={t('admin:recipe.lines.more', { name })}
                          aria-expanded={open}
                          aria-controls={open ? stripId : undefined}
                          onClick={() => {
                            setOpenKey(open ? null : line.key);
                            if (open) setAddingKey(null);
                          }}
                        >
                          <ChevronDownIcon size={18} />
                        </IconButton>
                      </Stack>
                      {bad ? (
                        <Typography
                          id={errorId}
                          variant="meta"
                          color="error"
                          role="alert"
                        >
                          {t('admin:recipe.invalid.quantity')}
                        </Typography>
                      ) : null}
                      {open ? (
                        <Stack id={stripId} spacing={1.5} sx={{ pt: 1.5 }}>
                          <TextField
                            label={t('admin:recipe.lines.note', { name })}
                            value={line.note}
                            onChange={(event) =>
                              changeLine(line.key, { note: event.target.value })
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center' }}
                          >
                            <Toggle
                              aria-label={t('admin:recipe.lines.optional', {
                                name,
                              })}
                              checked={line.optional}
                              onChange={(optional) =>
                                changeLine(line.key, { optional })
                              }
                            />
                            <Typography variant="body2">
                              {t('admin:recipe.lines.optionalSwitch')}
                            </Typography>
                          </Stack>
                          {onMatched && line.ingredientId === '' ? (
                            <Box
                              sx={{ position: 'relative' }}
                              onPointerDown={keepOutOfRow}
                              onTouchStart={keepOutOfRow}
                              onKeyDown={keepOutOfRow}
                            >
                              <Button
                                variant="ghost"
                                {...{ [ADD_TO_CATALOG_TRIGGER]: '' }}
                                ref={(el: HTMLButtonElement | null) => {
                                  if (el) addTriggers.current.set(line.key, el);
                                  else addTriggers.current.delete(line.key);
                                }}
                                aria-haspopup="dialog"
                                aria-expanded={addingKey === line.key}
                                onClick={() =>
                                  setAddingKey(
                                    addingKey === line.key ? null : line.key,
                                  )
                                }
                              >
                                {t('catalog:search.addToCatalog', {
                                  query: line.name,
                                })}
                              </Button>
                              <AddToCatalog
                                open={addingKey === line.key}
                                typed={line.name}
                                onPicked={(ingredient) => {
                                  setAddingKey(null);
                                  onMatched(line, ingredient);
                                  // The trigger unmounts with the Unmatched state: the quantity takes focus.
                                  setTimeout(
                                    () =>
                                      qtyInputs.current.get(line.key)?.focus(),
                                    0,
                                  );
                                }}
                                onDismiss={() => {
                                  setAddingKey(null);
                                  setTimeout(
                                    () =>
                                      addTriggers.current
                                        .get(line.key)
                                        ?.focus(),
                                    0,
                                  );
                                }}
                              />
                            </Box>
                          ) : null}
                          <RowControls
                            moveUp={t('admin:recipe.lines.moveUp', { name })}
                            moveDown={t('admin:recipe.lines.moveDown', {
                              name,
                            })}
                            remove={t('admin:recipe.lines.remove', { name })}
                            first={index === 0}
                            last={index === lines.length - 1}
                            onMoveUp={() => onChange(moved(lines, index, -1))}
                            onMoveDown={() => onChange(moved(lines, index, 1))}
                            onRemove={() => removeLine(line, index, name)}
                          />
                        </Stack>
                      ) : null}
                    </Stack>
                  )}
                </SortableItem>
              );
            })}
          </SortableList>
        </Stack>
      )}
      <Typography variant="body2" color="text.secondary">
        {t('admin:recipe.lines.hint')}
      </Typography>
      {children}
    </Stack>
  );
}
