import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

export type Member = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type Session = { user: Member } | null;

export const sessionQueryKey = ['session'] as const;

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

export function useSignUp() {
  const refreshSession = useSessionRefresh();
  return useMutation({
    mutationFn: (input: SignUpInput) =>
      apiRequest('/auth/sign-up/email', { method: 'POST', body: input }),
    onSuccess: refreshSession,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest('/auth/sign-out', { method: 'POST', body: {} }),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}
