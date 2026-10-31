import { Box, Sheet, tokens } from '@pocket-pantry/ui';
import type { CatalogParent } from '../../../lib/catalog';
import {
  displayName,
  type ReviewLine,
  type RowStatus,
} from '../../../lib/review';
import { RowEditPanel } from './RowEditPanel';

type Props = {
  open: boolean;
  line: ReviewLine;
  status: RowStatus;
  /** The Confirm button reads "Done" on a row that was already sure. */
  sure: boolean;
  parents: CatalogParent[];
  blocked: boolean;
  /** From `accessibleNamesOf`: the display name, position-qualified when repeated. */
  accessibleName: string;
  /** Swipe, backdrop or Escape: the edits stay and the line is not confirmed. */
  onClose: () => void;
  onEntered: () => void;
  onExited: () => void;
  onChange: (patch: Partial<ReviewLine>) => void;
  onSwapMatch: () => void;
  onRemove: () => void;
  onConfirm: () => void;
};

/** The phone Review's line editor: one line's whole form in a sheet titled with its name. */
export function ReviewLineSheet({
  open,
  line,
  accessibleName,
  onClose,
  onEntered,
  onExited,
  ...panel
}: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      onEntered={onEntered}
      onExited={onExited}
      label={accessibleName}
      header={
        <Box
          component="h2"
          sx={{
            m: 0,
            px: '20px',
            py: '12px',
            fontSize: 18,
            fontWeight: 700,
            color: tokens.color.ink,
          }}
        >
          {displayName(line)}
        </Box>
      }
    >
      <RowEditPanel line={line} accessibleName={accessibleName} {...panel} />
    </Sheet>
  );
}
