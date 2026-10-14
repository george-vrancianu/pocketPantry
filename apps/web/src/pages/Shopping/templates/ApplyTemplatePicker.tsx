import {
  Alert,
  Box,
  Button,
  Checkbox,
  Spinner,
  Stack,
  Typography,
  radius,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useApplyTemplate,
  groupByAisle,
  useTemplate,
  type TemplateLine,
} from '../../../lib/shoppingTemplates';

type Props = {
  templateId: string;
  onDone: () => void;
  onCancel: () => void;
};

/**
 * The apply picker. Ingredients already in the Pantry start unticked; Unmatched
 * lines and missing Ingredients start ticked. Only the ticked lines are added.
 */
export function ApplyTemplatePicker({ templateId, onDone, onCancel }: Props) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const template = useTemplate(templateId, i18n.language);
  const apply = useApplyTemplate(i18n.language);
  // Only the lines the Member has flipped; every other line keeps its default.
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());

  if (template.isPending) return <Spinner label={t('common:loading')} />;
  if (template.error || !template.data) {
    return (
      <Stack spacing={2}>
        <Alert>{translateApiError(t, template.error)}</Alert>
        <Button variant="ghost" onClick={onCancel}>
          {t('templates:apply.cancel')}
        </Button>
      </Stack>
    );
  }

  const { name, lines } = template.data;
  const isTicked = (line: TemplateLine) =>
    !line.inPantry !== flipped.has(line.id);
  const ticked = lines.filter(isTicked);

  const toggle = (id: string) =>
    setFlipped((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const submit = () => apply.mutate(ticked, { onSuccess: onDone });

  const quantityOf = (line: TemplateLine) =>
    line.quantity === null
      ? ''
      : line.unit
        ? `, ${line.quantity} ${t(`common:units.${line.unit}`)}`
        : `, ${line.quantity}`;

  return (
    <Stack
      spacing={2}
      role="region"
      aria-label={t('templates:apply.title', { name })}
    >
      <Typography variant="h2">
        {t('templates:apply.title', { name })}
      </Typography>
      <Typography color="text.secondary">
        {t('templates:apply.hint')}
      </Typography>
      {apply.error ? <Alert>{translateApiError(t, apply.error)}</Alert> : null}
      {lines.length === 0 ? (
        <Typography>{t('templates:apply.empty')}</Typography>
      ) : null}
      {groupByAisle(lines).map((group) => (
        <Box component="section" key={group.key}>
          <Typography
            component="h3"
            variant="sectionLabel"
            color="text.secondary"
            sx={{ mx: 0.5, mb: 1 }}
          >
            {group.title ?? t('templates:apply.unmatchedGroup')}
          </Typography>
          <Stack
            sx={{
              px: 1.5,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: radius.card,
            }}
          >
            {group.lines.map((line) => (
              <Checkbox
                key={line.id}
                label={`${line.name}${quantityOf(line)}`}
                checked={isTicked(line)}
                onChange={() => toggle(line.id)}
                helperText={
                  line.inPantry ? t('templates:apply.inPantry') : undefined
                }
              />
            ))}
          </Stack>
        </Box>
      ))}
      <Stack direction="row" spacing={1}>
        <Button
          disabled={ticked.length === 0 || apply.isPending}
          onClick={submit}
        >
          {apply.isPending
            ? t('templates:apply.confirming')
            : t('templates:apply.confirm', { count: ticked.length })}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('templates:apply.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
