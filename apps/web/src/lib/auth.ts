import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { clearPendingTheme } from './appearance';
import { voiceNote } from './voiceNote';
import { linkReads } from './linkReads';
import { sessionQueryKey, type Session } from './session';

export type SignInInput = { email: string; password: string };
export type SignUpInput = SignInInput & { name: string };

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => apiRequest<Session>('/auth/get-session'),
    retry: false,
    staleTime: 60_000,
  });
}

/** After a successful sign-in or sign-up the cookie is set; reload the session before navigating. */
function useSessionRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: sessionQueryKey });
}

export function useSignIn() {
  const refreshSession = useSessionRefresh();
  return useMutation({
    mutationFn: (input: SignInInput) =>
      apiRequest('/auth/sign-in/email', { method: 'POST', body: input }),
    onSuccess: refreshSession,
  });
}

/**
 * Creates the account. `afterCreate` runs once the cookie is set and before the session reloads (which
 * moves the Member on), for anything that has to be saved first; what it returns is the mutation's result.
 */
export function useSignUp<Result = undefined>(
  afterCreate?: () => Promise<Result>,
) {
  const refreshSession = useSessionRefresh();
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      await apiRequest('/auth/sign-up/email', { method: 'POST', body: input });
      return afterCreate ? await afterCreate() : undefined;
    },
    onSuccess: refreshSession,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest('/auth/sign-out', { method: 'POST', body: {} }),
    onSuccess: () => {
      clearPendingTheme();
      voiceNote.clear();
      linkReads.clear();
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}
