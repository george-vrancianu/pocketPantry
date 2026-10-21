import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { AssistantTokenService } from '../src/assistant-tokens/assistant-token.service';
import type { CreatedAssistantToken } from '../src/assistant-tokens/assistant-token.schemas';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { assistantTokens, user } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

// Spec: #411 / #444, ADR 0019. Assistant Tokens: create, list, revoke, and the lookup #446's guard uses.
describe('Assistant Tokens (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let service: AssistantTokenService;
  let ana: Awaited<ReturnType<typeof member>>;
  let ben: Awaited<ReturnType<typeof member>>;
  const stamp = Date.now();

  const member = async (label: string) => {
    const cookie = await signUp(
      app,
      `tokens-${label}-${stamp}@example.com`,
      label,
    );
    const http = client(app, cookie, '/api/assistant-tokens');
    const me = await client(app, cookie, '/api/settings').get('/preferences');
    expect(me.status).toBe(200);
    const [row] = await database
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, `tokens-${label}-${stamp}@example.com`));
    return { id: row.id, http, cookie };
  };

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    service = app.get(AssistantTokenService);
    ana = await member('ana');
    ben = await member('ben');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('service', () => {
    it('creates a secret that the lookup resolves to the Member and their Family', async () => {
      const created = await service.create(ana.id, 'iPhone');
      const found = await service.lookup(created.secret);
      const [row] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, ana.id));
      expect(found).toMatchObject({ id: ana.id, familyId: row.familyId });
    });

    it('resolves unknown and revoked secrets to nothing', async () => {
      expect(await service.lookup('pp_unknown-secret')).toBeNull();
      const created = await service.create(ana.id, 'Old iPad');
      await service.revoke(ana.id, created.id);
      expect(await service.lookup(created.secret)).toBeNull();
    });

    it('never stores the raw secret', async () => {
      const created = await service.create(ana.id, 'Hashed');
      const [row] = await database
        .select()
        .from(assistantTokens)
        .where(eq(assistantTokens.id, created.id));
      expect(Object.values(row).map(String)).not.toContain(created.secret);
      expect(row.secretHash).not.toContain(created.secret);
      expect(created.secret.startsWith(row.prefix)).toBe(true);
      expect(row.prefix.length).toBeLessThan(created.secret.length);
    });

    it('records when the token was last used', async () => {
      const created = await service.create(ana.id, 'Used');
      expect(created.lastUsedAt).toBeNull();
      await service.lookup(created.secret);
      const listed = (await service.list(ana.id)).find(
        (token) => token.id === created.id,
      );
      expect(listed?.lastUsedAt).toBeInstanceOf(Date);
    });

    it('returns the new Family after the Member joins another Family', async () => {
      const joiner = await member('joiner');
      const created = await service.create(joiner.id, 'Joiner phone');
      const before = await service.lookup(created.secret);
      const owner = client(app, ben.cookie, '/api/family');
      const { inviteCode } = (await owner.get('')).body as {
        inviteCode: string;
        id: string;
      };
      await client(app, joiner.cookie, '/api/family')
        .post('/join', { code: inviteCode })
        .expect(201);
      const after = await service.lookup(created.secret);
      expect(after?.familyId).not.toBe(before?.familyId);
      const [benRow] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, ben.id));
      expect(after?.familyId).toBe(benRow.familyId);
    });

    it('deletes tokens with the Member', async () => {
      const gone = await member('gone');
      const created = await service.create(gone.id, 'Doomed');
      await database.delete(user).where(eq(user.id, gone.id));
      expect(await service.lookup(created.secret)).toBeNull();
      const rows = await database
        .select()
        .from(assistantTokens)
        .where(eq(assistantTokens.id, created.id));
      expect(rows).toHaveLength(0);
    });
  });

  describe('HTTP', () => {
    it('creates a token, returning the secret once, and lists it without secrets', async () => {
      const created = (
        await ana.http.post('', { name: 'Kitchen HomePod' }).expect(201)
      ).body as CreatedAssistantToken;
      expect(created.secret).toEqual(expect.any(String));
      const list = (await ana.http.get('').expect(200)).body as Array<
        Record<string, unknown>
      >;
      const row = list.find((token) => token.id === created.id);
      expect(row).toMatchObject({ name: 'Kitchen HomePod' });
      expect(Object.keys(row ?? {}).sort()).toEqual([
        'createdAt',
        'id',
        'lastUsedAt',
        'name',
        'prefix',
      ]);
      expect(JSON.stringify(list)).not.toContain(created.secret);
    });

    it('rejects a blank name and an unauthenticated caller', async () => {
      await ana.http.post('', { name: '   ' }).expect(400);
      await client(app, '', '/api/assistant-tokens').get('').expect(401);
    });

    it("lists only the Member's own tokens", async () => {
      const mine = (await ana.http.post('', { name: 'Ana only' }).expect(201))
        .body as CreatedAssistantToken;
      const bens = (await ben.http.get('').expect(200)).body as Array<{
        id: string;
      }>;
      expect(bens.map((token) => token.id)).not.toContain(mine.id);
    });

    it("answers 404 when revoking someone else's token, and leaves it working", async () => {
      const mine = (await ana.http.post('', { name: 'Not Ben' }).expect(201))
        .body as CreatedAssistantToken;
      await ben.http.del(`/${mine.id}`).expect(404);
      expect(await service.lookup(mine.secret)).not.toBeNull();
    });

    it('revokes an own token, which then leaves the list and stops working', async () => {
      const mine = (await ana.http.post('', { name: 'Revoke me' }).expect(201))
        .body as CreatedAssistantToken;
      await ana.http.del(`/${mine.id}`).expect(200);
      const list = (await ana.http.get('').expect(200)).body as Array<{
        id: string;
      }>;
      expect(list.map((token) => token.id)).not.toContain(mine.id);
      expect(await service.lookup(mine.secret)).toBeNull();
      await ana.http.del(`/${mine.id}`).expect(404);
    });
  });
});
