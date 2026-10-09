import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLIENT_ORIGIN: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  // Comma-separated emails that become Admins at signup. The only way to get the role.
  AI_PROVIDER: z.enum(['openai', 'openai-compatible']).default('openai'),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.url().optional(),
  AI_VISION_MODEL: z.string().min(1).default('gpt-4o-mini-2024-07-18'),
  /** Scan Cap: Scans per Member per UTC day. 0 disables the cap (unlimited). */
  SCAN_DAILY_CAP: z.coerce.number().int().min(0).default(30),
  /** Below this a Match counts as Unmatched, and an image read counts as low-confidence. */
  SCAN_MATCH_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),
  /** Signs the Plate Scan token. Required in production; elsewhere a missing one becomes a random per-process secret (tokens do not survive a restart). */
  SCAN_TOKEN_SECRET: z.string().min(32).optional(),
  /** Built web app (`apps/web/dist`) to serve from the API's origin. Unset: API only. */
  WEB_DIST_DIR: z.string().min(1).optional(),
  /** Dev-only: save every Scan's photos and raw AI answer here. Refused in production, ignored outside development. */
  SCAN_DEBUG_DIR: z.string().min(1).optional(),
});

export type AppConfig = Omit<z.infer<typeof envSchema>, 'SCAN_TOKEN_SECRET'> & {
  SCAN_TOKEN_SECRET: string;
};

export function validateEnv(config: Record<string, unknown>): AppConfig {
  // `KEY=` in a .env file means "unset", not an empty value.
  const present = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== ''),
  );
  const result = envSchema.safeParse(present);
  if (!result.success) {
    throw new Error(`Invalid environment: ${z.prettifyError(result.error)}`);
  }
  const { SCAN_TOKEN_SECRET, ...rest } = result.data;
  if (!SCAN_TOKEN_SECRET && rest.NODE_ENV === 'production') {
    throw new Error(
      'Invalid environment: SCAN_TOKEN_SECRET is required in production (at least 32 characters)',
    );
  }
  if (rest.SCAN_DEBUG_DIR && rest.NODE_ENV === 'production') {
    // Receipts are personal data: refuse to start rather than risk capturing them.
    // Elsewhere outside development (tests reading a dev's .env) it is ignored.
    throw new Error(
      'Invalid environment: SCAN_DEBUG_DIR must not be set in production',
    );
  }
  return {
    ...rest,
    // Only an explicit NODE_ENV=development counts, never the default for a missing one.
    SCAN_DEBUG_DIR:
      present.NODE_ENV === 'development' ? rest.SCAN_DEBUG_DIR : undefined,
    SCAN_TOKEN_SECRET:
      SCAN_TOKEN_SECRET ?? randomBytes(32).toString('base64url'),
  };
}
