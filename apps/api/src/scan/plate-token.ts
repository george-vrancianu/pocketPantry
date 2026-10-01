import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiException } from '../common/api-exception';

/** How long a Plate Scan's dish list can be used to load Ingredients. */
export const PLATE_TOKEN_TTL_MS = 10 * 60_000;

type Payload = { m: string; t: string[]; e: number };

const mac = (secret: string, body: string) =>
  createHmac('sha256', secret).update(body).digest();

const rejected = () => new ApiException(400, 'scan.plate_token_invalid');

/**
 * Signs the dish titles one Plate Scan returned for one Member, so the
 * Ingredients call can only be made for a dish that Scan actually guessed.
 * `base64url(payload).base64url(HMAC-SHA256)`; the payload is signed, not secret.
 */
export function signPlateToken(input: {
  secret: string;
  memberId: string;
  titles: string[];
  now?: number;
}): string {
  const payload: Payload = {
    m: input.memberId,
    t: input.titles.map((title) => title.trim()),
    e: (input.now ?? Date.now()) + PLATE_TOKEN_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${mac(input.secret, body).toString('base64url')}`;
}

/** Throws `scan.plate_token_invalid` unless the token is genuine, unexpired, this Member's, and lists the title. */
export function verifyPlateToken(input: {
  secret: string;
  memberId: string;
  dishTitle: string;
  token: string | undefined;
  now?: number;
}): void {
  const parts = input.token?.split('.') ?? [];
  if (parts.length !== 2) throw rejected();
  const [body, signature] = parts;
  const given = Buffer.from(signature, 'base64url');
  const expected = mac(input.secret, body);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw rejected();
  }
  let payload: Payload;
  try {
    payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as Payload;
  } catch {
    throw rejected();
  }
  if (
    payload.m !== input.memberId ||
    !Array.isArray(payload.t) ||
    typeof payload.e !== 'number' ||
    (input.now ?? Date.now()) > payload.e ||
    !payload.t.includes(input.dishTitle.trim())
  ) {
    throw rejected();
  }
}
