/** The session shapes live apart from `auth.ts` so `appearance.ts` can read them without importing it back. */
export type Member = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type Session = { user: Member } | null;

export const sessionQueryKey = ['session'] as const;
