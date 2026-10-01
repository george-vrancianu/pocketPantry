import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

export type FamilyMember = { id: string; name: string; isOwner: boolean };

export type Family = {
  id: string;
  inviteCode: string;
  /** ISO timestamp. */
  inviteCodeExpiresAt: string;
  members: FamilyMember[];
  currentMemberIsOwner: boolean;
};

export const familyQueryKey = ['family'] as const;

export function useFamily() {
  return useQuery({
    queryKey: familyQueryKey,
    queryFn: () => apiRequest<Family>('/family'),
  });
}

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<Family>('/family/invite-code/regenerate', {
        method: 'POST',
        body: {},
      }),
    onSuccess: (family) => queryClient.setQueryData(familyQueryKey, family),
  });
}
