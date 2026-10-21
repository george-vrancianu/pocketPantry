import { z } from 'zod';
import type { AssistantOutcome } from './assistant-speech';

/** The body of `POST /assistant/requests`. */
export const assistantRequestBody = z.object({
  /** What the Member dictated. Read and applied, never stored. */
  text: z.string().trim().min(1).max(2000),
  /** The Member's local date, for resolving spoken dates. Defaults to today (UTC). */
  today: z.iso.date().optional(),
});
export type AssistantRequestBody = z.infer<typeof assistantRequestBody>;

export type AssistantRequestResponse = {
  outcomes: AssistantOutcome[];
  /** One sentence for the assistant to say aloud. */
  speech: string;
};
