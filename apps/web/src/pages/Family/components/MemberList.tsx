import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { FamilyMember } from '../../../lib/family';
import { ConfirmAction } from './ConfirmAction';

type Props = {
  members: FamilyMember[];
  /** Present only for the Owner: shows per-Member actions. */
  onMakeOwner?: (member: FamilyMember) => void;
  onRemove?: (member: FamilyMember) => void;
  busy?: boolean;
};

export function MemberList({ members, onMakeOwner, onRemove, busy }: Props) {
  const { t } = useTranslation('family');
  return (
    <Stack spacing={1}>
      <Typography variant="sectionLabel" color="text.secondary">
        {t('members')}
      </Typography>
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {members.map((member) => (
          <Stack component="li" key={member.id} spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', minHeight: 44 }}
            >
              <Typography variant="body1">{member.name}</Typography>
              {member.isOwner ? (
                <Typography variant="meta" color="text.secondary">
                  {t('owner')}
                </Typography>
              ) : null}
            </Stack>
            {!member.isOwner && (onMakeOwner || onRemove) ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {onMakeOwner ? (
                  <ConfirmAction
                    variant="text"
                    label={t('makeOwner')}
                    triggerName={t('makeOwnerNamed', { name: member.name })}
                    message={t('makeOwnerConfirm', { name: member.name })}
                    disabled={busy}
                    onConfirm={() => onMakeOwner(member)}
                  />
                ) : null}
                {onRemove ? (
                  <ConfirmAction
                    variant="text"
                    label={t('remove')}
                    triggerName={t('removeNamed', { name: member.name })}
                    message={t('removeConfirm', { name: member.name })}
                    disabled={busy}
                    onConfirm={() => onRemove(member)}
                  />
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
