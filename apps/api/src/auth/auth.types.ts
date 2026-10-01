import type { betterAuth } from 'better-auth';

export type AuthInstance = ReturnType<typeof betterAuth>;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};
