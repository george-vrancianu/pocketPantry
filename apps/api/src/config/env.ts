import { randomBytes } from 'node:crypto';
import { z } from 'zod';

/** Reasoning efforts AI_REASONING_EFFORT accepts. */
export const REASONING_EFFORTS = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

/** Scan model when AI_VISION_MODEL is unset, run at DEFAULT_REASONING_EFFORT. */
export const DEFAULT_VISION_MODEL = 'gpt-6-luna';
/** Keeps temperature 0 on gpt-6-luna, and spends no reasoning tokens. */
const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'none';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLIENT_ORIGIN: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  AI_PROVIDER: z.enum(['openai', 'openai-compatible']).default('openai'),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.url().optional(),
  AI_VISION_MODEL: z.string().min(1).default(DEFAULT_VISION_MODEL),
  /**
   * Reasoning effort for a reasoning model such as gpt-6-luna. Unset: `none` with the
   * default model, otherwise no effort is sent (gpt-4o-mini, openai-compatible vendors).
   */
  AI_REASONING_EFFORT: z.enum(REASONING_EFFORTS).optional(),
  /** Scan Cap: Scans per Member per UTC day. 0 disables the cap (unlimited). */
  SCAN_DAILY_CAP: z.coerce.number().int().min(0).default(30),
  VOICE_DAILY_CAP: z.coerce.number().int().min(0).default(50),
  /** Meal Plans per Family, past ones included. */
  MEAL_PLAN_CAP: z.coerce.number().int().positive().default(10),
  /** Invite Code redemption (join-preview and join) requests per minute, per Member and per IP. */
  INVITE_CODE_LIMIT_PER_USER: z.coerce.number().int().positive().default(10),
  INVITE_CODE_LIMIT_PER_IP: z.coerce.number().int().positive().default(30),
  /** Below this a Match counts as Unmatched, and an image read counts as low-confidence. */
  SCAN_MATCH_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.6),
  /** Signs the Plate Scan token. Required in production; elsewhere a missing one becomes a random per-process secret (tokens do not survive a restart). */
  SCAN_TOKEN_SECRET: z.string().min(32).optional(),
  /** Open Food Facts (Barcode Lookup). The User-Agent is what they ask every client to send: app name, version and a contact. */
  OPEN_FOOD_FACTS_BASE_URL: z.url().default('https://world.openfoodfacts.org'),
  OPEN_FOOD_FACTS_USER_AGENT: z
    .string()
    .min(1)
    .default(
      'PocketPantry/1.0 (https://github.com/george-vrancianu/pocketPantry)',
    ),
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
    // The default effort belongs to the default model: a deployer who picks a model
    // (gpt-4o-mini, a vendor's model) gets no effort unless they set one.
    AI_REASONING_EFFORT:
      rest.AI_REASONING_EFFORT ??
      (present.AI_VISION_MODEL === undefined
        ? DEFAULT_REASONING_EFFORT
        : undefined),
    // Only an explicit NODE_ENV=development counts, never the default for a missing one.
    SCAN_DEBUG_DIR:
      present.NODE_ENV === 'development' ? rest.SCAN_DEBUG_DIR : undefined,
    SCAN_TOKEN_SECRET:
      SCAN_TOKEN_SECRET ?? randomBytes(32).toString('base64url'),
  };
}
