import {
  Alert,
  Box,
  Button,
  Card,
  radius,
  Stack,
  TextField,
  Typography,
  useToast,
} from '@pocket-pantry/ui';
import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useAssistantTokens,
  useCreateAssistantToken,
  useRevokeAssistantToken,
  type AssistantToken,
  type CreatedAssistantToken,
} from '../../../lib/assistantTokens';
import { formatDate } from '../../../lib/dateFormat';
import { localIso } from '../../../lib/pantry';
import { ScopeCaption, SectionHeading } from './SectionHeading';

/** Keep in step with NAME_MAX_LENGTH in the API's assistant-token.schemas.ts. */
const NAME_MAX_LENGTH = 60;

/** A timestamp as the Member's local calendar day, day-first like every other date. */
function localDay(timestamp: string): string {
  return formatDate(localIso(new Date(timestamp)));
}

/** The secret of a just-created token, shown once. Closing it forgets the secret. */
function SecretReveal({
  token,
  onDone,
}: {
  token: CreatedAssistantToken;
  onDone: () => void;
}) {
  const { t } = useTranslation('siri');
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token.secret);
      toast.show(t('reveal.copied'), { polite: true });
    } catch {
      // The secret stays selectable (one tap selects all), so it can be copied by hand.
    }
  };
  return (
    <Stack
      role="group"
      aria-label={t('reveal.title')}
      spacing={1}
      sx={{ p: 1.5, borderRadius: radius.control, bgcolor: 'pp.subtle' }}
    >
      <Typography sx={{ fontWeight: 600 }}>{t('reveal.title')}</Typography>
      <Typography variant="meta" color="text.secondary">
        {t('reveal.hint')}
      </Typography>
      <Box
        component="code"
        aria-label={t('reveal.secretLabel')}
        sx={{ wordBreak: 'break-all', userSelect: 'all', fontSize: 14 }}
      >
        {token.secret}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="secondary" size="sm" onClick={copy}>
          {t('reveal.copy')}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDone}>
          {t('reveal.done')}
        </Button>
      </Stack>
    </Stack>
  );
}

function TokenRow({
  token,
  confirming,
  busy,
  onAskRevoke,
  onCancel,
  onRevoke,
}: {
  token: AssistantToken;
  confirming: boolean;
  busy: boolean;
  onAskRevoke: () => void;
  onCancel: () => void;
  onRevoke: () => void;
}) {
  const { t } = useTranslation('siri');
  return (
    <Stack component="li" spacing={1}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>{token.name}</Typography>
          <Typography variant="meta" color="text.secondary">
            <code>{token.prefix}…</code>
          </Typography>
          <Typography variant="meta" color="text.secondary" component="p">
            {`${t('created', { date: localDay(token.createdAt) })} · ${
              token.lastUsedAt
                ? t('lastUsed', { date: localDay(token.lastUsedAt) })
                : t('neverUsed')
            }`}
          </Typography>
        </Box>
        {confirming ? null : (
          <Button
            variant="ghost"
            disabled={busy}
            aria-label={t('revokeLabel', { name: token.name })}
            onClick={onAskRevoke}
          >
            {t('revoke')}
          </Button>
        )}
      </Stack>
      {confirming ? (
        <Box
          role="group"
          aria-label={t('revokeConfirm', { name: token.name })}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            p: '10px 12px',
            borderRadius: radius.control,
            bgcolor: 'pp.subtle',
          }}
        >
          <Typography variant="body2">
            {t('revokeConfirm', { name: token.name })}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button variant="ghost" size="sm" autoFocus onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={onRevoke}
            >
              {t('revokeAction')}
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}

/**
 * Siri: the Member's Assistant Tokens (ADR 0019). Create one by name, copy its secret from the
 * one-time reveal, and revoke it after confirming. Setup help for the Shortcut goes in here too.
 */
export function SiriSection() {
  const { t } = useTranslation(['siri', 'settings']);
  const toast = useToast();
  const id = useId();
  const query = useAssistantTokens();
  const create = useCreateAssistantToken();
  const revoke = useRevokeAssistantToken();
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState<CreatedAssistantToken | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const tokens = query.data;
  const error = create.error ?? revoke.error;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (revoke.isError) revoke.reset();
    create.mutate(trimmed, {
      onSuccess: (created) => {
        setName('');
        setRevealed(created);
      },
    });
  };

  return (
    <Stack component="section" spacing={1} aria-labelledby={`${id}-title`}>
      <SectionHeading
        id={`${id}-title`}
        title={t('siri:title')}
        scope={<ScopeCaption scope="you" label={t('settings:scope.you')} />}
      />
      <Card>
        <Stack spacing={1.5}>
          <Typography variant="meta" color="text.secondary">
            {t('siri:hint')}
          </Typography>
          {revealed ? (
            <SecretReveal token={revealed} onDone={() => setRevealed(null)} />
          ) : null}
          <Stack component="form" spacing={1.5} onSubmit={submit}>
            <TextField
              id={`${id}-name`}
              label={t('siri:nameLabel')}
              placeholder={t('siri:namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH } }}
            />
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending ? t('siri:creating') : t('siri:create')}
            </Button>
          </Stack>
          {query.isError ? <Alert>{t('siri:loadFailed')}</Alert> : null}
          {tokens && tokens.length === 0 ? (
            <Typography variant="meta" color="text.secondary">
              {t('siri:empty')}
            </Typography>
          ) : null}
          {tokens && tokens.length > 0 ? (
            <Stack
              component="ul"
              spacing={1.5}
              sx={{ listStyle: 'none', m: 0, p: 0 }}
            >
              {tokens.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  confirming={confirmingId === token.id}
                  busy={revoke.isPending}
                  onAskRevoke={() => setConfirmingId(token.id)}
                  onCancel={() => setConfirmingId(null)}
                  onRevoke={() => {
                    if (create.isError) create.reset();
                    revoke.mutate(token.id, {
                      onSuccess: () => {
                        setConfirmingId(null);
                        toast.show(t('siri:revoked'), { polite: true });
                      },
                    });
                  }}
                />
              ))}
            </Stack>
          ) : null}
          {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
        </Stack>
      </Card>
    </Stack>
  );
}
