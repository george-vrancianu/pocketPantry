import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { FamilyMember } from '../../../lib/family';

export function MemberList({ members }: { members: FamilyMember[] }) {
  const { t } = useTranslation('family');
  return (
    <Stack spacing={1}>
      <Typography variant="sectionLabel" color="text.secondary">
        {t('members')}
      </Typography>
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {members.map((member) => (
          <Stack
            component="li"
            key={member.id}
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
        ))}
      </Stack>
    </Stack>
  );
}
