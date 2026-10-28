// Reference port of the prototype's Tag field to the MUI 9 Autocomplete API (as wrapped by @pocket-pantry/ui).
// The prototype itself runs on MUI 5 (last version with a browser bundle). API differences used here:
//   renderTags(value, getTagProps)      → renderValue(value, getItemProps)
//   PopperComponent / componentsProps   → slots.popper / slotProps
// Not compiled against the repo — treat as a spec in code form; styling should come from the theme overrides, not sx.

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import type { PopperProps } from '@mui/material/Popper';
import { forwardRef, type ReactNode } from 'react';

export interface Tag {
  id: string;
  name: string; // display name in the viewer's language (Family Tags as written)
  kind: 'catalog' | 'family';
  groupId: string;
  groupName: string; // "Your Tags" for kind === 'family'
}

export interface TagFieldProps {
  options: Tag[]; // sorted: Your Tags first, then groups in Admin order
  value: Tag[];
  onChange: (next: Tag[]) => void;
  /** Recipes you'd see with this Tag added (search + picked Tags + this). Omit to hide counts. */
  countWith?: (tag: Tag) => number;
  limitTags?: number; // -1 in the filter sheet, 2 in the editor
  inline?: boolean; // filter sheet: list always open and rendered in place
  onEscape?: () => void;
  labels: {
    field: string; // "Filter by Tags"
    placeholder: string; // "Type to find a Tag"
    yourTagsNote: string; // "only your family sees these"
    noOptions: string;
    clear: string; // "Clear Tags"
    more: (n: number) => string; // "and 2 more Tags"
    optionCount: (n: number) => string; // "3 Recipes"
  };
  tagIcon: ReactNode;
  peopleIcon: ReactNode;
}

// Renders the listbox where Autocomplete puts it instead of in a floating popper (Tags sheet).
const InlinePopper = forwardRef<HTMLDivElement, PopperProps>(function InlinePopper(props, ref) {
  const { anchorEl, open, disablePortal, placement, popperRef, popperOptions, modifiers, transition, keepMounted, container, style, children, className, ...rest } = props;
  return (
    <div ref={ref} {...(rest as object)} className={[className, 'TagField-inlineList'].filter(Boolean).join(' ')}>
      {children as ReactNode}
    </div>
  );
});

const filter = createFilterOptions<Tag>({ ignoreCase: true, ignoreAccents: true });

export function TagField({ options, value, onChange, countWith, limitTags = 2, inline, onEscape, labels, tagIcon, peopleIcon }: TagFieldProps) {
  const selected = new Set(value.map(t => t.id));
  return (
    <Autocomplete<Tag, true, false, false>
      multiple
      options={options}
      value={value}
      onChange={(_, next) => onChange(next)}
      filterOptions={filter}
      groupBy={t => t.groupName}
      getOptionLabel={t => t.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionDisabled={t => !!countWith && !selected.has(t.id) && countWith(t) === 0}
      limitTags={limitTags}
      getLimitTagsText={n => <span aria-label={labels.more(n)}>+{n}</span>}
      disableCloseOnSelect
      autoHighlight
      openOnFocus
      forcePopupIcon={false}
      clearText={labels.clear}
      noOptionsText={labels.noOptions}
      open={inline ? true : undefined}
      onClose={(_, reason) => { if (reason === 'escape') onEscape?.(); }}
      disablePortal={inline}
      slots={inline ? { popper: InlinePopper } : undefined}
      renderValue={(tags, getItemProps) =>
        tags.map((t, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} {...itemProps} size="small" label={t.name} data-kind={t.kind} />;
        })
      }
      renderGroup={params => (
        <li key={params.key} className="TagField-group">
          <div className="TagField-groupHeader">
            {params.group === options.find(o => o.kind === 'family')?.groupName ? (
              <>{peopleIcon}<span>{params.group}</span><em>{labels.yourTagsNote}</em></>
            ) : (
              <span>{params.group}</span>
            )}
          </div>
          <ul className="TagField-groupItems">{params.children}</ul>
        </li>
      )}
      renderOption={(props, t, { selected: isOn }) => {
        const { key, ...liProps } = props;
        const n = countWith?.(t);
        return (
          <li key={key} {...liProps}>
            <span className="TagField-box" data-on={isOn} aria-hidden="true" />
            <span className="TagField-name">{t.name}</span>
            {n !== undefined && !isOn && <span className="TagField-count" aria-label={labels.optionCount(n)}>{n}</span>}
          </li>
        );
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={value.length ? undefined : labels.placeholder}
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.inputProps, 'aria-label': labels.field },
            input: {
              ...params.InputProps,
              startAdornment: <>{tagIcon}{params.InputProps.startAdornment}</>,
            },
          }}
        />
      )}
    />
  );
}
