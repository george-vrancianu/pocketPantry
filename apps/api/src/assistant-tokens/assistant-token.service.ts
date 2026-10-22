import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { assistantTokens, user } from '../database/schema';
import type {
  AssistantTokenMember,
  AssistantTokenView,
  CreatedAssistantToken,
} from './assistant-token.schemas';

const SECRET_MARKER = 'pp_';
const SECRET_BYTES = 32;
/** Marker plus the first characters of the random part. */
const PREFIX_LENGTH = SECRET_MARKER.length + 4;

const hashSecret = (secret: string): string =>
  createHash('sha256').update(secret).digest('hex');

const view = (
  row: typeof assistantTokens.$inferSelect,
): AssistantTokenView => ({
  id: row.id,
  name: row.name,
  prefix: row.prefix,
  createdAt: row.createdAt,
  lastUsedAt: row.lastUsedAt,
});

/**
 * Assistant Tokens (ADR 0019): named, revocable secrets a Member creates so a voice
 * assistant can make Assistant Requests for them. Only a SHA-256 hash is stored. The
 * secret is 256 random bits, so an unsalted fast hash is enough, and the lookup is an
 * indexed equality match on the hash, which does not depend on the secret's bytes.
 */
@Injectable()
export class AssistantTokenService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /** Creates a token and returns its raw secret, which is never available again. */
  async create(memberId: string, name: string): Promise<CreatedAssistantToken> {
    const secret =
      SECRET_MARKER + randomBytes(SECRET_BYTES).toString('base64url');
    const [row] = await this.database
      .insert(assistantTokens)
      .values({
        userId: memberId,
        name,
        secretHash: hashSecret(secret),
        prefix: secret.slice(0, PREFIX_LENGTH),
      })
      .returning();
    return { ...view(row), secret };
  }

  /** The Member's own active (not revoked) tokens, oldest first. */
  async list(memberId: string): Promise<AssistantTokenView[]> {
    const rows = await this.database
      .select()
      .from(assistantTokens)
      .where(
        and(
          eq(assistantTokens.userId, memberId),
          isNull(assistantTokens.revokedAt),
        ),
      )
      .orderBy(asc(assistantTokens.createdAt), asc(assistantTokens.id));
    return rows.map(view);
  }

  /** Revokes one of the Member's own active tokens; anyone else's (or an unknown one) is a 404. */
  async revoke(memberId: string, tokenId: string): Promise<void> {
    const revoked = await this.database
      .update(assistantTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(assistantTokens.id, tokenId),
          eq(assistantTokens.userId, memberId),
          isNull(assistantTokens.revokedAt),
        ),
      )
      .returning({ id: assistantTokens.id });
    if (revoked.length === 0) {
      throw new ApiException(404, 'assistantTokens.not_found');
    }
  }

  /**
   * Resolves a presented secret to its Member and the Family they belong to now, and
   * records the use. Unknown and revoked secrets give null.
   */
  async lookup(secret: string): Promise<AssistantTokenMember | null> {
    const [token] = await this.database
      .update(assistantTokens)
      .set({ lastUsedAt: new Date() })
      .where(
        and(
          eq(assistantTokens.secretHash, hashSecret(secret)),
          isNull(assistantTokens.revokedAt),
        ),
      )
      .returning({ userId: assistantTokens.userId });
    if (!token) return null;
    const [member] = await this.database
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        locale: user.locale,
        familyId: user.familyId,
      })
      .from(user)
      .where(eq(user.id, token.userId))
      .limit(1);
    return member ?? null;
  }
}
