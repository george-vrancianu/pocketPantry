import {
  Box,
  ChevronDownIcon,
  GripIcon,
  IconButton,
  Stack,
  TextField,
  Toggle,
  Typography,
  useToast,
  type ToastHandle,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type Unit } from '../../lib/catalog';
import {
  moved,
  type DraftProblems,
  type LineDraft,
} from '../../lib/recipeDraft';
import { UNDO_WINDOW_MS } from '../../lib/useDeferredRemoval';
import { RowControls } from '../RowControls';

type Props = {
  lines: LineDraft[];
  problems: DraftProblems;
  onChange: (lines: LineDraft[]) => void;
  /** The search that adds a line, shown under the list. */
  children: ReactNode;
};

/** The ordered Ingredient Lines of a Recipe draft: one row each, rare controls behind a ⌄ strip. */
export function RecipeLinesSection({
  lines,
  problems,
  onChange,
  children,
}: Props) {
  const { t } = useTranslation(['admin', 'common', 'recipes']);
  const toast = useToast();
  const [openKey, setOpenKey] = useState<number | null>(null);

  // Undo builds on the newest lines, not on what rendered when the toast appeared.
  const latest = useRef({ lines, onChange });
  useEffect(() => {
    latest.current = { lines, onChange };
  });
  // The toast outlives this page: take it down when we go.
  const undoToast = useRef<ToastHandle | null>(null);
  useEffect(() => () => undoToast.current?.close(), []);

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
          {lines.map((line, index) => {
            const name = line.name || t('admin:recipe.lines.unknown');
            const bad = problems.lines[line.key];
            const open = openKey === line.key;
            const stripId = `line-strip-${line.key}`;
            const sub = [
              line.optional ? t('admin:recipe.lines.optionalSub') : null,
              line.note || null,
              line.ingredientId === ''
                ? t('recipes:family.freeTextNote')
                : null,
            ].filter(Boolean);
            return (
              <Stack
                component="li"
                key={line.key}
                sx={{
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
                  <GripIcon size={18} aria-hidden />
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
                      {line.family ? (
                        <Typography
                          component="span"
                          variant="meta"
                          color="text.secondary"
                          sx={{ flexShrink: 0 }}
                        >
                          {t('admin:recipe.lines.familyPill')}
                        </Typography>
                      ) : null}
                    </Stack>
                    {sub.length > 0 ? (
                      <Typography noWrap variant="meta" color="text.secondary">
                        {sub.join(' · ')}
                      </Typography>
                    ) : null}
                  </Box>
                  <TextField
                    label={t('admin:recipe.lines.quantity', { name })}
                    value={line.quantity}
                    onChange={(event) =>
                      changeLine(line.key, { quantity: event.target.value })
                    }
                    error={bad}
                    slotProps={{
                      htmlInput: { inputMode: 'decimal' },
                      inputLabel: { shrink: true },
                    }}
                    sx={{ width: 84 }}
                  />
                  <TextField
                    select
                    label={t('admin:recipe.lines.unit', { name })}
                    value={line.unit}
                    onChange={(event) =>
                      changeLine(line.key, {
                        unit: event.target.value as Unit,
                      })
                    }
                    slotProps={{ select: { native: true } }}
                    sx={{ width: 96 }}
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
                    onClick={() => setOpenKey(open ? null : line.key)}
                  >
                    <ChevronDownIcon size={18} />
                  </IconButton>
                </Stack>
                {bad ? (
                  <Typography variant="meta" color="error" role="alert">
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
                        aria-label={t('admin:recipe.lines.optional', { name })}
                        checked={line.optional}
                        onChange={(optional) =>
                          changeLine(line.key, { optional })
                        }
                      />
                      <Typography variant="body2">
                        {t('admin:recipe.lines.optionalSwitch')}
                      </Typography>
                    </Stack>
                    <RowControls
                      moveUp={t('admin:recipe.lines.moveUp', { name })}
                      moveDown={t('admin:recipe.lines.moveDown', { name })}
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
            );
          })}
        </Stack>
      )}
      <Typography variant="body2" color="text.secondary">
        {t('admin:recipe.lines.hint')}
      </Typography>
      {children}
    </Stack>
  );
}
