import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  IconButton,
  Stack,
} from '@pocket-pantry/ui';

type Props = {
  moveUp: string;
  moveDown: string;
  /** Omit when the row cannot be removed here. */
  remove?: string;
  first: boolean;
  last: boolean;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove?: () => void;
};

/** Move up / Move down / Remove buttons of one row in an ordered editor list. */
export function RowControls({
  moveUp,
  moveDown,
  remove,
  first,
  last,
  disabled,
  onMoveUp,
  onMoveDown,
  onRemove,
}: Props) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <IconButton
        tone="plain"
        size={40}
        label={moveUp}
        ariaDisabled={first || disabled}
        onClick={onMoveUp}
      >
        <ChevronUpIcon />
      </IconButton>
      <IconButton
        tone="plain"
        size={40}
        label={moveDown}
        ariaDisabled={last || disabled}
        onClick={onMoveDown}
      >
        <ChevronDownIcon />
      </IconButton>
      {remove && onRemove ? (
        <IconButton
          tone="plain"
          size={40}
          label={remove}
          ariaDisabled={disabled}
          onClick={onRemove}
        >
          <DeleteIcon />
        </IconButton>
      ) : null}
    </Stack>
  );
}
