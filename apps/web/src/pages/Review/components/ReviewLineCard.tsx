import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import {
  LOCATIONS,
  UNITS,
  type CatalogParent,
  type CatalogSearchResult,
} from '../../../lib/catalog';
import { parseQuantity } from '../../../lib/pantry';
import type { ReviewLine } from '../../../lib/review';
import type { ScanMode } from '../../../lib/scan';
import { SourceText } from './SourceText';

type Props = {
  line: ReviewLine;
  onChange: (patch: Partial<ReviewLine>) => void;
  onChangeMatch: (match: CatalogSearchResult) => void;
  onDrop: () => void;
  /** Parent Categories an Unmatched line can be placed in. */
  parents: CatalogParent[];
  /** The line goes on the Shopping List: no Category, Location, expiry or description. */
  shopping?: boolean;
  /** The Scan Mode the line came from; picks the source text's prefix. */
  mode: ScanMode;
};

/** One proposed line, editable. Flagged lines (Unmatched or low confidence) are tinted and say why. */
export function ReviewLineCard({
  line,
  onChange,
  onChangeMatch,
  onDrop,
  parents,
  shopping = false,
  mode,
}: Props) {
  const { t } = useTranslation(['review', 'pantry']);
  const id = useId();
  const [searching, setSearching] = useState(false);
  const unmatched = line.match === null;
  const flagged = unmatched || line.lowConfidence;
  const displayName = line.match?.name ?? line.name;
  const quantityValid = parseQuantity(line.quantity).valid;

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        p: 2,
        borderRadius: `${tokens.radius.card}px`,
        bgcolor: tokens.color.surface,
        border: `1px solid ${flagged ? tokens.color.urgentFg : tokens.color.line}`,
      }}
    >
      <Stack
        spacing={1.5}
        component="section"
        aria-label={displayName}
        id={`review-line-${line.key}`}
        tabIndex={-1}
        sx={{ outline: 'none' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{displayName}</Typography>
            <SourceText text={line.sourceText} mode={mode} />
          </Box>
          <Button
            variant="text"
            type="button"
            onClick={onDrop}
            aria-label={t('review:drop', { name: displayName })}
          >
            {t('review:dropShort')}
          </Button>
        </Stack>

        {flagged ? (
          <Box
            role="note"
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: `${tokens.radius.input}px`,
              bgcolor: tokens.color.urgentBg,
              color: tokens.color.urgentFg,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {unmatched
              ? t(
                  shopping
                    ? 'review:flag.unmatchedShopping'
                    : 'review:flag.unmatched',
                )
              : t('review:flag.lowConfidence')}
          </Box>
        ) : null}

        {unmatched ? (
          <TextField
            id={`${id}-name`}
            label={t('review:name')}
            value={line.name}
            onChange={(event) => onChange({ name: event.target.value })}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
        ) : null}

        {unmatched && !shopping ? (
          <TextField
            id={`${id}-category`}
            select
            label={t('review:category')}
            value={line.parentCategoryId}
            onChange={(event) =>
              onChange({ parentCategoryId: event.target.value })
            }
            slotProps={{ select: { native: true } }}
          >
            <option value="">{t('review:categoryOther')}</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </TextField>
        ) : null}

        {searching ? (
          <Stack spacing={1}>
            <CatalogSearch
              autoFocus
              onSelect={(match) => {
                onChangeMatch(match);
                setSearching(false);
              }}
            />
            <Button
              variant="text"
              type="button"
              onClick={() => setSearching(false)}
            >
              {t('review:keepMatch')}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="text"
            type="button"
            onClick={() => setSearching(true)}
          >
            {t('review:changeMatch')}
          </Button>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            id={`${id}-quantity`}
            label={t('pantry:form.quantity')}
            type="number"
            value={line.quantity}
            error={!quantityValid}
            helperText={
              quantityValid ? undefined : t('pantry:form.quantityInvalid')
            }
            onChange={(event) => onChange({ quantity: event.target.value })}
            slotProps={{
              htmlInput: { min: 0, step: 'any', inputMode: 'decimal' },
            }}
          />
          <TextField
            id={`${id}-unit`}
            select
            label={t('pantry:form.unit')}
            value={line.unit}
            onChange={(event) =>
              onChange({ unit: event.target.value as ReviewLine['unit'] })
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

        {shopping ? null : (
          <>
            <TextField
              id={`${id}-location`}
              select
              label={t('pantry:form.location')}
              value={line.location}
              onChange={(event) =>
                onChange({
                  location: event.target.value as ReviewLine['location'],
                })
              }
              slotProps={{ select: { native: true } }}
            >
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {t(`common:locations.${location}`)}
                </option>
              ))}
            </TextField>

            <TextField
              id={`${id}-expiry`}
              type="date"
              label={t('pantry:form.expiry')}
              value={line.expiryDate}
              onChange={(event) =>
                onChange({
                  expiryDate: event.target.value,
                  expiryExplicit: true,
                })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              id={`${id}-description`}
              label={t('pantry:form.description')}
              value={line.description}
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
