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
import type { CatalogParent, CatalogSearchResult } from '../../../lib/catalog';
import { LOCATIONS, UNITS } from '../../../lib/pantry';
import { isQuantityValid, type ReviewLine } from '../../../lib/review';

type Props = {
  line: ReviewLine;
  onChange: (patch: Partial<ReviewLine>) => void;
  onChangeMatch: (match: CatalogSearchResult) => void;
  onDrop: () => void;
  /** Parent Categories an Unmatched line can be placed in. */
  parents: CatalogParent[];
};

/** One proposed line, editable. Flagged lines (Unmatched or low confidence) are tinted and say why. */
export function ReviewLineCard({
  line,
  onChange,
  onChangeMatch,
  onDrop,
  parents,
}: Props) {
  const { t } = useTranslation(['review', 'pantry']);
  const id = useId();
  const [searching, setSearching] = useState(false);
  const unmatched = line.match === null;
  const flagged = unmatched || line.lowConfidence;
  const displayName = line.match?.name ?? line.name;
  const quantityValid = isQuantityValid(line.quantity);

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
      <Stack spacing={1.5} component="section" aria-label={displayName}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>
            {displayName}
          </Typography>
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
              ? t('review:flag.unmatched')
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

        {unmatched ? (
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
            label={t('review:quantity')}
            type="number"
            value={line.quantity}
            error={!quantityValid}
            helperText={quantityValid ? undefined : t('review:quantityInvalid')}
            onChange={(event) => onChange({ quantity: event.target.value })}
            slotProps={{
              htmlInput: { min: 0, step: 'any', inputMode: 'decimal' },
            }}
          />
          <TextField
            id={`${id}-unit`}
            select
            label={t('review:unit')}
            value={line.unit}
            onChange={(event) =>
              onChange({ unit: event.target.value as ReviewLine['unit'] })
            }
            slotProps={{ select: { native: true } }}
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`pantry:units.${unit}`)}
              </option>
            ))}
          </TextField>
        </Stack>

        <TextField
          id={`${id}-location`}
          select
          label={t('review:location')}
          value={line.location}
          onChange={(event) =>
            onChange({ location: event.target.value as ReviewLine['location'] })
          }
          slotProps={{ select: { native: true } }}
        >
          {LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {t(`pantry:locations.${location}`)}
            </option>
          ))}
        </TextField>

        <TextField
          id={`${id}-expiry`}
          type="date"
          label={t('review:expiry')}
          value={line.expiryDate}
          onChange={(event) =>
            onChange({ expiryDate: event.target.value, expiryExplicit: true })
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          id={`${id}-description`}
          label={t('review:description')}
          value={line.description}
          onChange={(event) => onChange({ description: event.target.value })}
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
      </Stack>
    </Box>
  );
}
