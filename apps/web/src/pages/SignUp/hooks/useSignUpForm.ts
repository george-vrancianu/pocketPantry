import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useSignUp } from '../../../lib/auth';
import {
  clearLanguagePicks,
  INTRO_PATHS,
  readLanguagePicks,
  type LanguagePicks,
} from '../../../lib/intro';
import { preferencesQueryKey, saveIntroLanguages } from '../../../lib/settings';
import { useIntro } from '../../../lib/useIntro';

export function useSignUpForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUnsavedLanguages } = useIntro();

  /**
   * The picks kept from Languages are saved as soon as the account exists, then forgotten. A failed save
   * never blocks the Member: Set up or skip says what they chose instead.
   */
  const saveKeptLanguages = async (): Promise<LanguagePicks | null> => {
    const picks = readLanguagePicks();
    if (!picks) return null;
    try {
      queryClient.setQueryData(
        preferencesQueryKey,
        await saveIntroLanguages(picks),
      );
      return null;
    } catch {
      return picks;
    } finally {
      clearLanguagePicks();
    }
  };

  const signUp = useSignUp(saveKeptLanguages);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signUp.mutate(
      {
        name: String(form.get('name') ?? '').trim(),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
      {
        onSuccess: (unsaved) => {
          setUnsavedLanguages(unsaved ?? null);
          void navigate(INTRO_PATHS['setup-or-skip'], {
            replace: true,
          });
        },
      },
    );
  };

  return {
    submit,
    pending: signUp.isPending,
    error: signUp.error ? translateApiError(t, signUp.error) : null,
  };
}
