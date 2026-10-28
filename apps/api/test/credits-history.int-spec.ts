import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { CreditsService } from '../src/credits/credits.service';
import type { CreditsView } from '../src/credits/credits.schemas';
import { runGrant } from '../src/credits/grant/run-grant';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { setBalance } from './support/credits';

describe('Credit history on the read endpoint (integration)', () => {
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
      .set('x-forwarded-for', `10.51.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name,
        email: `credits-history-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie, id: (response.body as { user: { id: string } }).user.id };
  }

  const family = (
    who: Who,
    method: 'get' | 'post',
    path: string,
    body = {},
  ) => {
    const req = request(app.getHttpServer())
      [method](`/api/family${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', who.cookie);
    return method === 'post' ? req.send(body) : req;
  };
  const view = async (who: Who) =>
    (
      await request(app.getHttpServer())
        .get('/api/credits')
        .set('origin', TEST_ORIGIN)
        .set('cookie', who.cookie)
        .expect(200)
    ).body as CreditsView;
  const spend = (who: Who, kind: 'scan' | 'link-page' | 'voice', n = 1) =>
    app.get(CreditsService).hold(who.id, kind, n);
  const familyId = async (who: Who) =>
    (
      (await family(who, 'get', '').expect(200)).body as {
        id?: string;
      }
    ).id;

  it('shows the threshold of 10 and the prices', async () => {
    const who = await signUp('Ada');
    const body = await view(who);
    expect(body.lowBalanceThreshold).toBe(10);
    expect(body.prices['link-page']).toBe(2);
    expect(body.prices['link-text']).toBe(1);
  });

  it('shows a Welcome Grant by its kind, not as a former Member', async () => {
    const who = await signUp('Ada');
    const { history } = await view(who);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      kind: 'welcome_grant',
      amount: 100,
      memberName: null,
      formerMember: false,
      reason: null,
    });
    expect(new Date(history[0].createdAt).getTime()).not.toBeNaN();
  });

  it('shows a spend with the Member, the kind of read and a negative amount, newest first', async () => {
    const who = await signUp('Ada');
    await spend(who, 'scan');
    await spend(who, 'link-page', 2);
    const { history, balance } = await view(who);
    expect(balance).toBe(97);
    expect(history.map((e) => [e.kind, e.readKind, e.amount])).toEqual([
      ['spend', 'link-page', -2],
      ['spend', 'scan', -1],
      ['welcome_grant', null, 100],
    ]);
    expect(history[0]).toMatchObject({
      memberName: 'Ada',
      formerMember: false,
    });
  });

  it('shows every Member of the Family the same history', async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    const code = (
      (await family(owner, 'get', '').expect(200)).body as {
        inviteCode: string;
      }
    ).inviteCode;
    await family(joiner, 'post', '/join', { code }).expect(201);
    await spend(joiner, 'voice');
    expect((await view(owner)).history[0]).toMatchObject({
      kind: 'spend',
      readKind: 'voice',
      memberName: 'Joiner',
    });
  });

  it('shows a spend by a Member who has left as a former Member', async () => {
    const owner = await signUp('Owner');
    const leaver = await signUp('Leaver');
    const code = (
      (await family(owner, 'get', '').expect(200)).body as {
        inviteCode: string;
      }
    ).inviteCode;
    await family(leaver, 'post', '/join', { code }).expect(201);
    await spend(leaver, 'scan');
    await family(leaver, 'post', '/leave').expect(200);
    const { history } = await view(owner);
    expect(history[0]).toMatchObject({
      kind: 'spend',
      readKind: 'scan',
      amount: -1,
      memberName: null,
      formerMember: true,
    });
  });

  it('shows a hand grant with its reason as entered', async () => {
    const who = await signUp('Ada');
    const id = await familyId(who);
    expect(id).toBeDefined();
    const result = await runGrant(
      ['--family', id!, '--amount', '50', '--reason', 'Beta tester'],
      app.get<Database>(DATABASE),
    );
    expect(result.code).toBe(0);
    const body = await view(who);
    expect(body.balance).toBe(150);
    expect(body.history[0]).toMatchObject({
      kind: 'grant',
      reason: 'Beta tester',
      amount: 50,
      memberName: null,
      formerMember: false,
    });
  });

  it('shows the balance moved in on joining as a transfer_in, without the stored English text', async () => {
    const owner = await signUp('Owner');
    const joiner = await signUp('Joiner');
    await setBalance(app, joiner.id, 73);
    const code = (
      (await family(owner, 'get', '').expect(200)).body as {
        inviteCode: string;
      }
    ).inviteCode;
    await family(joiner, 'post', '/join', { code }).expect(201);
    const { history } = await view(owner);
    expect(history[0]).toMatchObject({
      kind: 'transfer_in',
      amount: 73,
      memberName: 'Joiner',
      formerMember: false,
      reason: null,
    });
  });

  it('returns only the latest 20 entries', async () => {
    const who = await signUp('Ada');
    for (let i = 0; i < 24; i++) await spend(who, 'scan');
    const { history, balance } = await view(who);
    expect(balance).toBe(76);
    expect(history).toHaveLength(20);
    expect(history.every((e) => e.kind === 'spend')).toBe(true);
  });
});
