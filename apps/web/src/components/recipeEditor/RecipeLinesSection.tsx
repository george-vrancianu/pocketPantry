import { Checkbox, Stack, TextField, Typography } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type Unit } from '../../lib/catalog';
import {
  moved,
  type DraftProblems,
  type LineDraft,
} from '../../lib/recipeDraft';
import { RowControls } from '../RowControls';

type Props = {
  lines: LineDraft[];
  problems: DraftProblems;
  onChange: (lines: LineDraft[]) => void;
  /** Extra text after a line's name (the Family form flags typed names). */
  nameNote?: (line: LineDraft) => ReactNode;
  /** The controls that add a line, shown under the list. */
  children: ReactNode;
};

/** The ordered Ingredient Lines of a Recipe draft, with the add controls below. */
export function RecipeLinesSection({
  lines,
  problems,
  onChange,
  nameNote,
  children,
}: Props) {
  const { t } = useTranslation(['admin', 'common']);
  const changeLine = (key: number, patch: Partial<LineDraft>) =>
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  return (
    <Stack
      component="fieldset"
      spacing={1.5}
      sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
    >
      <Typography component="legend" variant="sectionLabel">
        {t('admin:recipe.lines.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:recipe.lines.hint')}
      </Typography>
      {lines.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:recipe.lines.empty')}
        </Typography>
      ) : null}
      <Stack component="ol" spacing={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {lines.map((line, index) => {
          const name = line.name || t('admin:recipe.lines.unknown');
          return (
            <Stack component="li" key={line.key} spacing={1}>
              <Typography sx={{ fontWeight: 600 }}>
                {name}
                {nameNote?.(line)}
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label={t('admin:recipe.lines.quantity', { name })}
                  value={line.quantity}
                  onChange={(event) =>
                    changeLine(line.key, { quantity: event.target.value })
                  }
                  error={problems.lines[line.key]}
                  helperText={
                    problems.lines[line.key]
                      ? t('admin:recipe.invalid.quantity')
                      : undefined
                  }
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
                <TextField
                  select
                  label={t('admin:recipe.lines.unit', { name })}
                  value={line.unit}
                  onChange={(event) =>
                    changeLine(line.key, { unit: event.target.value as Unit })
                  }
                  slotProps={{ select: { native: true } }}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`common:units.${unit}`)}
                    </option>
                  ))}
                </TextField>
              </Stack>
              <TextField
                label={t('admin:recipe.lines.note', { name })}
                value={line.note}
                onChange={(event) =>
                  changeLine(line.key, { note: event.target.value })
                }
              />
              <Checkbox
                label={t('admin:recipe.lines.optional', { name })}
                checked={line.optional}
                onChange={(event) =>
                  changeLine(line.key, { optional: event.target.checked })
                }
              />
              <RowControls
                moveUp={t('admin:recipe.lines.moveUp', { name })}
                moveDown={t('admin:recipe.lines.moveDown', { name })}
                remove={t('admin:recipe.lines.remove', { name })}
                first={index === 0}
                last={index === lines.length - 1}
                onMoveUp={() => onChange(moved(lines, index, -1))}
                onMoveDown={() => onChange(moved(lines, index, 1))}
                onRemove={() =>
                  onChange(lines.filter((item) => item.key !== line.key))
                }
              />
            </Stack>
          );
        })}
      </Stack>
      {children}
    </Stack>
  );
}
