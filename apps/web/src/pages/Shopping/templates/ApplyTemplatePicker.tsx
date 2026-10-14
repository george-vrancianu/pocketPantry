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
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useShoppingList } from '../../../lib/shopping';
import {
  bulkBody,
  lineTag,
  useSingleTemplateSelection,
} from '../../../lib/templateSelection';
import {
  useApplyTemplate,
  groupByAisle,
  useTemplate,
  type Template,
  type TemplateLine,
} from '../../../lib/shoppingTemplates';

type Props = {
  templateId: string;
  onDone: () => void;
  onCancel: () => void;
};

/**
 * The apply picker. Ingredients in the Pantry or in the trolley start unticked;
 * everything else starts ticked. Only the ticked lines are added.
 */
export function ApplyTemplatePicker({ templateId, onDone, onCancel }: Props) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const template = useTemplate(templateId, i18n.language);

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

  return (
    <Picker template={template.data} onDone={onDone} onCancel={onCancel} />
  );
}

function Picker({
  template,
  onDone,
  onCancel,
}: Omit<Props, 'templateId'> & { template: Template }) {
  const { t, i18n } = useTranslation(['templates', 'common', 'shopping']);
  const shoppingList = useShoppingList(i18n.language);
  const apply = useApplyTemplate(i18n.language);
  const { name, lines } = template;
  const { selection, isTicked, ticked, toggle } = useSingleTemplateSelection(
    template,
    shoppingList.data,
  );

  const submit = () =>
    apply.mutate(bulkBody(selection, [template]), { onSuccess: onDone });

  const tagText = (tag: ReturnType<typeof lineTag>) =>
    tag === 'inPantry'
      ? t('templates:apply.inPantry')
      : tag === 'inTrolley'
        ? t('shopping:import.inTrolley')
        : tag === 'onList'
          ? t('templates:apply.onList')
          : undefined;

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
                onChange={() => toggle(line)}
                helperText={tagText(lineTag(line, shoppingList.data))}
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
