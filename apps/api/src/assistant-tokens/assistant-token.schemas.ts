import { z } from 'zod';

export const NAME_MAX_LENGTH = 60;

export const createAssistantTokenBody = z.object({
  name: z.string().trim().min(1).max(NAME_MAX_LENGTH),
});
export type CreateAssistantTokenBody = z.infer<typeof createAssistantTokenBody>;

export const assistantTokenIdParam = z.uuid();

/** What a Member sees of a token: never the secret or its hash. */
export type AssistantTokenView = {
  id: string;
  name: string;
  /** The start of the secret, enough to tell tokens apart. */
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
};

/** Returned once on creation: the only time the raw secret exists outside the assistant. */
export type CreatedAssistantToken = AssistantTokenView & { secret: string };

/** The Member behind a presented secret, with the Family they belong to right now. */
export type AssistantTokenMember = {
  id: string;
  name: string;
  email: string;
  /** Member Preference locale, or null until chosen. */
  locale: string | null;
  familyId: string;
};
