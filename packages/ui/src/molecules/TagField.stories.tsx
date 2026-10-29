import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { useState } from 'react';
import { TagField, type TagFieldOption, type TagFieldProps } from './TagField';

const OPTIONS: TagFieldOption[] = [
  { id: 'mine', name: 'Meal prep', kind: 'family', groupName: null },
  { id: 'kids', name: 'Kids love it', kind: 'family', groupName: null },
  {
    id: 'breakfast',
    name: 'Breakfast',
    kind: 'catalog',
    groupName: 'Meal',
    groupOrder: 1,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    kind: 'catalog',
    groupName: 'Meal',
    groupOrder: 1,
  },
  {
    id: 'vegan',
    name: 'Vegan',
    kind: 'catalog',
    groupName: 'Diet',
    groupOrder: 2,
  },
  {
    id: 'romana',
    name: 'Română',
    kind: 'catalog',
    groupName: 'Cuisine',
    groupOrder: 3,
  },
  {
    id: 'grill',
    name: 'Grill',
    kind: 'catalog',
    groupName: 'Method',
    groupOrder: 4,
  },
];

const COUNTS: Record<string, number> = {
  mine: 4,
  kids: 0,
  breakfast: 2,
  dinner: 7,
  vegan: 3,
  romana: 0,
  grill: 1,
};

const labels: TagFieldProps['labels'] = {
  field: 'Filter by Tags',
  placeholder: 'Type to find a Tag',
  yourTags: 'Your Tags',
  yourTagsNote: 'only your family sees these',
  noOptions: 'No Tag by that name on your Recipes',
  clear: 'Clear Tags',
  remove: (name) => `Remove Tag ${name}`,
  more: (count) => `and ${count} more Tags`,
  optionCount: (count) => `${count} Recipes`,
};

const meta: Meta<typeof TagField> = {
  title: 'Molecules/TagField',
  component: TagField,
};
export default meta;

function Demo(props: Partial<TagFieldProps>) {
  const [value, setValue] = useState<TagFieldOption[]>([OPTIONS[2]]);
  return (
    <Box sx={{ p: 2, maxWidth: 420 }}>
      <TagField
        options={OPTIONS}
        value={value}
        onChange={setValue}
        labels={labels}
        {...props}
      />
    </Box>
  );
}

/** The Tags sheet: the list is always open and rendered in place, with counts; Tags that would leave 0 Recipes are dimmed. */
export const FilterInline: StoryObj<typeof TagField> = {
  render: () => <Demo list="inline" countOf={(tag) => COUNTS[tag.id] ?? 0} />,
};

/** The Recipe editor: a popup list, no counts, and at most two chips at rest. */
export const EditorPopup: StoryObj<typeof TagField> = {
  render: () => <Demo list="popup" limitTags={2} />,
};

/** The editor with `create`: typing a name nothing matches adds a `Create "…"` row. */
export const EditorCreate: StoryObj<typeof TagField> = {
  render: () => {
    const Create = () => {
      const [options, setOptions] = useState(OPTIONS);
      const [value, setValue] = useState<TagFieldOption[]>([]);
      return (
        <Box sx={{ p: 2, maxWidth: 420 }}>
          <TagField
            list="popup"
            limitTags={2}
            options={options}
            value={value}
            onChange={setValue}
            labels={labels}
            create={{
              label: (name) => `Create “${name}”`,
              maxLength: 30,
              onCreate: (name) => {
                const tag: TagFieldOption = {
                  id: name,
                  name,
                  kind: 'family',
                  groupName: null,
                };
                setOptions([...options, tag]);
                setValue([...value, tag]);
              },
            }}
          />
        </Box>
      );
    };
    return <Create />;
  },
};
