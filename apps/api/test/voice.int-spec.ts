import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { scanUsage } from '../src/database/schema';
import type {
  TranscriptionRequest,
  TranscriptionService,
} from '../src/voice/transcription.service';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Fake = Pick<TranscriptionService, 'isConfigured' | 'transcribe'>;

describe('Voice Note (integration)', () => {
  let app: NestFastifyApplication;
  let configured = true;
  let next: (input: TranscriptionRequest) => Promise<{ text: string }>;
  const calls: TranscriptionRequest[] = [];
  let counter = 0;

  beforeAll(async () => {
    const fake: Fake = {
      isConfigured: () => configured,
      transcribe: (input) => {
        calls.push(input);
        return next(input);
      },
    };
    app = await createTestApp([], undefined, undefined, undefined, fake);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    configured = true;
    calls.length = 0;
    next = () => Promise.resolve({ text: 'got the bread and sausages' });
  });

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.15.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Voice ${n}`,
        email: `voice-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return {
      cookie: [response.headers['set-cookie'] ?? []]
        .flat()
        .map((c) => c.split(';')[0])
        .join('; '),
      memberId: (response.body as { user: { id: string } }).user.id,
    };
  }

  type Options = {
    contentType?: string;
    audio?: Buffer;
    durationMs?: string;
    language?: string;
  };

  const note = (cookie: string, options: Options = {}) =>
    request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .field('scanLanguage', options.language ?? 'ro')
      .field('locale', 'en')
      .field('defaultTarget', 'shopping')
      .field('today', '2026-10-16')
      .field('durationMs', options.durationMs ?? '4200')
      .attach('audio', options.audio ?? Buffer.from('fake-audio'), {
        filename: 'note.webm',
        contentType: options.contentType ?? 'audio/webm;codecs=opus',
      });

  const usage = async (memberId: string, kind: 'voice' | 'scan') => {
    const rows = await app
      .get<Database>(DATABASE)
      .select({ count: scanUsage.count, kind: scanUsage.kind })
      .from(scanUsage)
      .where(eq(scanUsage.memberId, memberId));
    return rows.find((r) => r.kind === kind)?.count ?? 0;
  };

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', TEST_ORIGIN)
      .attach('audio', Buffer.from('x'), {
        filename: 'a.webm',
        contentType: 'audio/webm',
      })
      .expect(401);
  });

  it('transcribes the recording with the Scan Language as the main hint and the others as extra hints', async () => {
    const { cookie, memberId } = await signUp();
    const response = await note(cookie).expect(201);
    expect(response.body).toEqual({ transcript: 'got the bread and sausages' });
    expect(calls).toHaveLength(1);
    expect(calls[0].audio.toString()).toBe('fake-audio');
    expect(calls[0].mimeType).toBe('audio/webm');
    expect(calls[0].language).toBe('ro');
    expect(calls[0].otherLanguages.sort()).toEqual(['da', 'en']);
    expect(await usage(memberId, 'voice')).toBe(1);
    expect(await usage(memberId, 'scan')).toBe(0);
  });

  it('accepts Chromium (webm/opus) and iOS Safari (mp4/aac) recordings', async () => {
    const { cookie } = await signUp();
    await note(cookie, { contentType: 'audio/webm;codecs=opus' }).expect(201);
    await note(cookie, { contentType: 'audio/mp4' }).expect(201);
    const firefox = await signUp();
    await note(firefox.cookie, { contentType: 'audio/ogg;codecs=opus' }).expect(
      201,
    );
    expect(calls.map((c) => c.mimeType)).toEqual([
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ]);
  });

  it('rejects a format it cannot read before charging the Voice Cap', async () => {
    const { cookie, memberId } = await signUp();
    const response = await note(cookie, { contentType: 'text/plain' }).expect(
      415,
    );
    expect((response.body as { code: string }).code).toBe(
      'voice.unsupported_audio',
    );
    expect(calls).toHaveLength(0);
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('rejects a recording over 60 seconds, or too big, without charging', async () => {
    const { cookie, memberId } = await signUp();
    const long = await note(cookie, { durationMs: '75000' }).expect(413);
    expect((long.body as { code: string }).code).toBe('voice.too_long');
    const big = await note(cookie, {
      audio: Buffer.alloc(3 * 1024 * 1024),
    }).expect(413);
    expect((big.body as { code: string }).code).toBe('voice.too_long');
    expect(calls).toHaveLength(0);
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('returns voice.not_configured when the server has no transcription', async () => {
    const { cookie, memberId } = await signUp();
    configured = false;
    const response = await note(cookie).expect(503);
    expect((response.body as { code: string }).code).toBe(
      'voice.not_configured',
    );
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('tells the web whether voice is configured', async () => {
    const { cookie } = await signUp();
    const get = () =>
      request(app.getHttpServer())
        .get('/api/voice/config')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie);
    expect((await get().expect(200)).body).toEqual({ configured: true });
    configured = false;
    expect((await get().expect(200)).body).toEqual({ configured: false });
  });

  it('refunds the Voice Cap when the provider fails', async () => {
    const { cookie, memberId } = await signUp();
    next = () =>
      Promise.reject(new ApiException(502, 'voice.provider_unavailable'));
    for (let i = 0; i < 3; i++) {
      const response = await note(cookie).expect(502);
      expect((response.body as { code: string }).code).toBe(
        'voice.provider_unavailable',
      );
    }
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('refunds the Voice Cap when nothing was heard', async () => {
    const { cookie, memberId } = await signUp();
    next = () => Promise.resolve({ text: '  ' });
    for (let i = 0; i < 3; i++) {
      const response = await note(cookie).expect(422);
      expect((response.body as { code: string }).code).toBe(
        'voice.nothing_heard',
      );
    }
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('stops at the Voice Cap (2 in tests) and never touches the Scan Cap', async () => {
    const { cookie, memberId } = await signUp();
    await note(cookie).expect(201);
    await note(cookie).expect(201);
    const response = await note(cookie).expect(429);
    expect((response.body as { code: string }).code).toBe('voice.cap_reached');
    expect(calls).toHaveLength(2);
    expect(await usage(memberId, 'voice')).toBe(2);
    expect(await usage(memberId, 'scan')).toBe(0);
  });
});
