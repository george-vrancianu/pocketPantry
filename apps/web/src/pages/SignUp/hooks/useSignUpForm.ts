import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useSignUp } from '../../../lib/auth';

export function useSignUpForm() {
  const { t } = useTranslation();
  const signUp = useSignUp();
  const navigate = useNavigate();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signUp.mutate(
      {
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  };

  return {
    submit,
    pending: signUp.isPending,
    error: signUp.error ? translateApiError(t, signUp.error) : null,
  };
}
