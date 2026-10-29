import { z } from 'zod';

/** What a Member typed in the Tag field. Length and emptiness are checked after trimming (coded errors). */
export const resolveTagBody = z.object({ name: z.string().max(400) }).strict();
export type ResolveTagBody = z.infer<typeof resolveTagBody>;
