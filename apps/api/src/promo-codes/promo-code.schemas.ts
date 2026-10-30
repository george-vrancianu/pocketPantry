import { z } from 'zod';

export const MAX_BATCH = 50;
export const DEFAULT_CREDITS = 100;
export const MAX_CREDITS = 10_000;
export const MAX_NOTE_LENGTH = 500;
export const MAX_PAGE_SIZE = 100;

export const PROMO_CODE_STATUSES = ['unused', 'redeemed', 'revoked'] as const;
export type PromoCodeStatus = (typeof PROMO_CODE_STATUSES)[number];

export const generateBody = z.object({
  count: z.number().int().min(1).max(MAX_BATCH).default(1),
  credits: z.number().int().min(0).max(MAX_CREDITS).default(DEFAULT_CREDITS),
  note: z
    .string()
    .trim()
    .max(MAX_NOTE_LENGTH)
    .optional()
    .transform((note) => note || undefined),
});
export type GenerateBody = z.infer<typeof generateBody>;

export type PromoCodeCursor = { createdAt: string; id: string };
export const encodeCursor = (cursor: PromoCodeCursor): string =>
  Buffer.from(JSON.stringify([cursor.createdAt, cursor.id])).toString(
    'base64url',
  );

export const listQuery = z.object({
  status: z.enum(PROMO_CODE_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(50),
  /** `nextCursor` of the previous page. */
  cursor: z
    .string()
    .max(400)
    .optional()
    .transform((value, ctx): PromoCodeCursor | undefined => {
      if (value === undefined) return undefined;
      try {
        const [createdAt, id] = z
          .tuple([z.iso.datetime({ precision: 6 }), z.uuid()])
          .parse(JSON.parse(Buffer.from(value, 'base64url').toString()));
        return { createdAt, id };
      } catch {
        ctx.addIssue({ code: 'custom', message: 'malformed cursor' });
        return z.NEVER;
      }
    }),
});
export type ListQuery = z.infer<typeof listQuery>;

export type PromoCodeEntry = {
  id: string;
  /** Shown as `XXXXX-XXXXX`. */
  code: string;
  credits: number;
  note: string | null;
  createdAt: string;
  status: PromoCodeStatus;
  redeemedAt: string | null;
  redeemedByName: string | null;
  redeemedByEmail: string | null;
  /** May name a Family that no longer exists. */
  redeemedFamilyId: string | null;
};

export type PromoCodePage = {
  entries: PromoCodeEntry[];
  nextCursor: string | null;
};
