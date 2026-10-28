import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import type { PopperProps } from '@mui/material/Popper';
import { forwardRef, useMemo, type ReactNode, type Ref } from 'react';
import { Box } from '../atoms/Layout';
import { PeopleIcon, TagIcon } from '../atoms/icons';
import { TagChip, type TagChipKind } from '../atoms/TagChip';
import { TextField } from '../atoms/TextField';
import { tokens } from '../theme/tokens';
import { bodyFont, palette, radius } from '../theme/themeVars';

/** What the field needs of a Tag; the web's `RecipeTag` fits. */
export type TagFieldOption = {
  id: string;
  name: string;
  kind: TagChipKind;
  /** The Tag Group header the option sits under. Null on a Family Tag, which goes under "Your Tags". */
  groupName: string | null;
  /** Sorts the groups (Meal, Diet, Cuisine, Method, ...). */
  groupOrder?: number | null;
};

export type TagFieldLabels = {
  /** Accessible name of the input, e.g. "Filter by Tags". */
  field: string;
  /** Shown while nothing is picked, e.g. "Type to find a Tag". */
  placeholder: string;
  /** Header of the Family Tags group, e.g. "Your Tags". */
  yourTags: string;
  /** Its right-hand note, e.g. "only your family sees these". */
  yourTagsNote: string;
  /** Shown when typing matches nothing. */
  noOptions: string;
  /** Accessible name of the clear (x) indicator, e.g. "Clear Tags". */
  clear: string;
  /** Accessible name of a picked chip, e.g. "Remove Tag Vegan". */
  remove: (name: string) => string;
  /** Accessible name of the "+N" chip when `limitTags` cuts the list, e.g. "and 3 more Tags". */
  more: (count: number) => string;
  /** Accessible name of an option's count, e.g. "3 Recipes". */
  optionCount: (count: number) => string;
};

export type TagFieldProps<T extends TagFieldOption = TagFieldOption> = {
  /** Every Tag that can be picked. Family Tags first, then the groups in order: they are grouped as given. */
  options: readonly T[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  labels: TagFieldLabels;
  /**
   * How many Recipes a Member would see with this Tag added. Given, each unpicked option shows
   * its count and one at 0 is disabled (a picked Tag stays enabled so it can be removed). Omitted:
   * no counts and nothing is disabled, as in the Recipe editor.
   */
  countOf?: (tag: T) => number;
  /**
   * `popup`: the list floats under the field while it is focused. `inline`: the list is always
   * open and rendered in place after the field, as in the Tags sheet.
   */
  list?: 'popup' | 'inline';
  /** Picked chips shown before "+N" while the field is not focused; -1 (default) shows them all. */
  limitTags?: number;
  /** Escape in the open list; the Tags sheet closes itself with it. */
  onEscape?: () => void;
  autoFocus?: boolean;
};

// Module-level so they keep their identity: Autocomplete resets the typed text when they change.
const optionLabel = (tag: TagFieldOption) => tag.name;
const sameTag = (a: TagFieldOption, b: TagFieldOption) => a.id === b.id;

/** Renders the list where Autocomplete puts it, in place, instead of in a floating popper. */
const InlinePopper = forwardRef(function InlinePopper(
  props: PopperProps,
  ref: Ref<HTMLDivElement>,
) {
  const { children, className } = props;
  return (
    <Box ref={ref} className={className} sx={{ width: '100%' }}>
      {typeof children === 'function'
        ? children({ placement: 'bottom' })
        : (children as ReactNode)}
    </Box>
  );
});

const optionSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minHeight: 44,
  px: 2,
  fontFamily: bodyFont,
  fontSize: 15,
  fontWeight: 600,
  color: tokens.color.ink,
  '&.Mui-focused, &:hover': { bgcolor: tokens.color.subtle },
  '&.Mui-disabled, &[aria-disabled="true"]': { opacity: 0.42 },
} as const;

/** Family Tags first, then the groups by position (the order given breaks ties). */
function grouped<T extends TagFieldOption>(options: readonly T[]): T[] {
  return options
    .map((tag, index) => ({ tag, index }))
    .sort(
      (a, b) =>
        (a.tag.kind === b.tag.kind ? 0 : a.tag.kind === 'family' ? -1 : 1) ||
        (a.tag.groupOrder ?? 0) - (b.tag.groupOrder ?? 0) ||
        a.index - b.index,
    )
    .map(({ tag }) => tag);
}

/**
 * The Tag field (ADR 0033, docs/handoffs/tags-filter section 4): a multi-select with a grouped
 * option list, Your Tags first. Shared by the Recipes and Explore filters (counts, inline list)
 * and the Recipe editor (popup list, `limitTags`, no counts). Matching ignores case and accents.
 * It never offers to create a Tag: the editor adds that option itself.
 */
export function TagField<T extends TagFieldOption = TagFieldOption>({
  options,
  value,
  onChange,
  labels,
  countOf,
  list = 'popup',
  limitTags = -1,
  onEscape,
  autoFocus,
}: TagFieldProps<T>) {
  const inline = list === 'inline';
  const filter = useMemo(
    () => createFilterOptions<T>({ ignoreCase: true, ignoreAccents: true }),
    [],
  );
  const sorted = useMemo(() => grouped(options), [options]);
  const picked = new Set(value.map((tag) => tag.id));
  const blocked = (tag: T) =>
    countOf !== undefined && !picked.has(tag.id) && countOf(tag) === 0;
  const groupOf = (tag: TagFieldOption) =>
    tag.kind === 'family' ? labels.yourTags : (tag.groupName ?? '');
  return (
    <Box>
      <Autocomplete<T, true, false, false>
        multiple
        options={sorted}
        value={value as T[]}
        onChange={(_event, next) =>
          // Only pointer-events keep a click off a dimmed option, so refuse it here too.
          onChange(next.filter((tag) => picked.has(tag.id) || !blocked(tag)))
        }
        filterOptions={filter}
        groupBy={groupOf}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={sameTag}
        getOptionDisabled={blocked}
        limitTags={limitTags}
        getLimitTagsText={(count) => (
          <span aria-label={labels.more(count)}>+{count}</span>
        )}
        disableCloseOnSelect
        autoHighlight
        openOnFocus
        forcePopupIcon={false}
        clearText={labels.clear}
        noOptionsText={labels.noOptions}
        {...(inline ? { open: true, disablePortal: true } : {})}
        onClose={(_event, reason) => {
          if (reason === 'escape') onEscape?.();
        }}
        slots={inline ? { popper: InlinePopper } : undefined}
        sx={{
          // A touch screen has no hover: keep the clear (x) in view whenever there is a pick.
          '& .MuiAutocomplete-clearIndicator': {
            visibility: 'visible',
            color: tokens.color.muted,
            width: 32,
            height: 32,
          },
          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            gap: '5px',
            py: '7px',
            pl: '12px',
            pr: '6px',
            flexWrap: 'wrap',
          },
          '& .MuiAutocomplete-input': { minWidth: 80, p: '4px !important' },
          '& .MuiAutocomplete-tag': {
            fontSize: 12.5,
            fontWeight: 700,
            color: palette('pp-accentOnTint'),
          },
        }}
        renderValue={(tags, getItemProps) =>
          tags.map((tag, index) => {
            const { key, onDelete, className, ...rest } = getItemProps({
              index,
            });
            return (
              <TagChip
                key={key}
                kind={tag.kind}
                size="medium"
                className={className}
                data-item-index={rest['data-item-index']}
                tabIndex={rest.tabIndex}
                onRemove={() => onDelete({} as never)}
                removeLabel={labels.remove(tag.name)}
                sx={{ maxWidth: 132, fontSize: 12.5 }}
              >
                {tag.name}
              </TagChip>
            );
          })
        }
        renderGroup={(params) => (
          <li key={params.key}>
            <Box
              sx={{
                position: inline ? 'static' : 'sticky',
                top: 0,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                px: inline ? 2.5 : 2,
                pt: '12px',
                pb: '4px',
                bgcolor: tokens.color.surface,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                color: tokens.color.muted,
              }}
            >
              {params.group === labels.yourTags ? (
                <>
                  <Box
                    component="span"
                    aria-hidden
                    sx={{ display: 'flex', color: tokens.color.butterInk }}
                  >
                    <PeopleIcon size={13} />
                  </Box>
                  <span>{params.group}</span>
                  <Box
                    component="em"
                    sx={{
                      ml: 'auto',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      textTransform: 'none',
                      letterSpacing: 0,
                    }}
                  >
                    {labels.yourTagsNote}
                  </Box>
                </>
              ) : (
                <span>{params.group}</span>
              )}
            </Box>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {params.children}
            </Box>
          </li>
        )}
        renderOption={(props, tag, { selected }) => {
          const { key, ...li } = props;
          const count = countOf?.(tag);
          return (
            <Box
              component="li"
              key={key}
              {...li}
              sx={{ ...optionSx, px: inline ? 2.5 : 2 }}
            >
              <Box
                component="span"
                aria-hidden
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '6px',
                  border: `1.5px solid ${selected ? tokens.color.accent : palette('pp-lineStrong')}`,
                  bgcolor: selected ? tokens.color.accent : 'transparent',
                  color: palette('pp-accentInk'),
                }}
              >
                {selected ? <CheckMark /> : null}
              </Box>
              <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                {tag.name}
              </Box>
              {count !== undefined && !selected ? (
                <Box
                  component="span"
                  aria-label={labels.optionCount(count)}
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: tokens.color.muted,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {count}
                </Box>
              ) : null}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus={autoFocus}
            placeholder={value.length > 0 ? undefined : labels.placeholder}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                'aria-label': labels.field,
              },
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <>
                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: 'flex',
                        color: tokens.color.accent,
                        borderRadius: radius.chip,
                      }}
                    >
                      <TagIcon size={18} />
                    </Box>
                    {params.slotProps.input.startAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
}

function CheckMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
