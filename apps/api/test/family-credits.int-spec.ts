import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { family } from '../src/database/schema';
import { eq } from 'drizzle-orm';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { CreditsService } from '../src/credits/credits.service';
import { setBalance } from './support/credits';

describe('Credits follow Family moves (integration)', () => {
  let app: NestFastifyApplication;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  type Who = { cookie: string; id: string };

  async function signUp(name: string): Promise<Who> {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.41.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name,
        email: `family-credits-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie, id: (response.body as { user: { id: string } }).user.id };
  }

  const call = (
    who: Who,
    method: 'get' | 'post' | 'delete',
    path: string,
    body?: object,
  ) => {
    const req = request(app.getHttpServer())
      [method](`/api/family${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', who.cookie);
    return method === 'post' ? req.send(body ?? {}) : req;
  };

  const balanceOf = async (who: Who) =>
    (
      (
        await request(app.getHttpServer())
          .get('/api/credits')
          .set('cookie', who.cookie)
          .expect(200)
      ).body as { balance: number }
    ).balance;

  const codeOf = async (who: Who) =>
    ((await call(who, 'get', '').expect(200)).body as { inviteCode: string })
      .inviteCode;

  async function familyWith(count: number) {
    const owner = await signUp('Owner');
    const code = await codeOf(owner);
    const members: Who[] = [];
    for (let i = 0; i < count; i++) {
      const m = await signUp(`Member${i}`);
      await call(m, 'post', '/join', { code }).expect(201);
      members.push(m);
    }
    return { owner, members, code };
  }

  it('gives a leaver a Household of One at 0 and the old Family keeps its balance', async () => {
    const { owner, members } = await familyWith(1);
    await setBalance(app, owner.id, 150);
    await call(members[0], 'post', '/leave').expect(200);
    expect(await balanceOf(members[0])).toBe(0);
    expect(await balanceOf(owner)).toBe(150);
  });

  it('gives a removed Member a Household of One at 0', async () => {
    const { owner, members } = await familyWith(1);
    await setBalance(app, owner.id, 150);
    await call(owner, 'delete', `/members/${members[0].id}`).expect(200);
    expect(await balanceOf(members[0])).toBe(0);
    expect(await balanceOf(owner)).toBe(150);
  });

  it("adds a joiner's Household of One balance to the joined Family", async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    await setBalance(app, joiner.id, 73);
    expect(await balanceOf(owner)).toBe(100);
    await call(joiner, 'post', '/join', { code: await codeOf(owner) }).expect(
      201,
    );
    expect(await balanceOf(owner)).toBe(173);
    expect(await balanceOf(joiner)).toBe(173);
  });

  it('joins with an empty Household of One without changing the joined balance', async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    await setBalance(app, joiner.id, 0);
    await call(joiner, 'post', '/join', { code: await codeOf(owner) }).expect(
      201,
    );
    expect(await balanceOf(owner)).toBe(100);
  });

  it('leaves every former Member at 0 when the Family is deleted', async () => {
    const { owner, members } = await familyWith(2);
    await call(owner, 'delete', '').expect(200);
    expect(await balanceOf(owner)).toBe(0);
    for (const m of members) expect(await balanceOf(m)).toBe(0);
  });

  it('never grants again when a Member leaves and rejoins', async () => {
    const { owner, members, code } = await familyWith(1);
    // owner 100 + member's 100 on the first join
    expect(await balanceOf(owner)).toBe(200);
    for (let i = 0; i < 3; i++) {
      await call(members[0], 'post', '/leave').expect(200);
      expect(await balanceOf(members[0])).toBe(0);
      await call(members[0], 'post', '/join', { code }).expect(201);
      expect(await balanceOf(owner)).toBe(200);
    }
  });

  it('changes no balance when a join is refused', async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    await setBalance(app, joiner.id, 73);
    await call(joiner, 'post', '/join', { code: 'NOPE0000' }).expect(404);
    const code = await codeOf(owner);
    await app
      .get<Database>(DATABASE)
      .update(family)
      .set({ inviteCodeExpiresAt: new Date(Date.now() - 1000) })
      .where(eq(family.inviteCode, code));
    await call(joiner, 'post', '/join', { code }).expect(410);
    expect(await balanceOf(joiner)).toBe(73);
    expect(await balanceOf(owner)).toBe(100);
  });

  it('keeps a hold that races a join in the Family the Member ends up in', async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    const code = await codeOf(owner);
    const credits = app.get(CreditsService);
    const results = await Promise.all([
      call(joiner, 'post', '/join', { code }),
      credits.hold(joiner.id, 'scan', 5),
    ]);
    expect(results[0].status).toBe(201);
    // Whichever came first, the 5 is spent once and nothing is lost in the deleted Household of One.
    expect(await balanceOf(owner)).toBe(195);
  });
});
