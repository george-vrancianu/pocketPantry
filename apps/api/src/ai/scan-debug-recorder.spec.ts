import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import {
  createScanDebugRecorder,
  type ScanDebugCall,
} from './scan-debug-recorder';

const call = (overrides: Partial<ScanDebugCall> = {}): ScanDebugCall => ({
  request: {
    prompt: 'Read the receipt',
    images: ['data:image/jpeg;base64,aGVsbG8=', 'data:image/png;base64,aGk='],
    schemaName: 'grocery_receipt_scan',
    schema: { type: 'object' },
    maxOutputTokens: 100,
  },
  provider: 'openai',
  model: 'vision-model',
  startedAt: new Date('2026-10-08T12:00:00.000Z'),
  durationMs: 1234,
  requestId: 'req-1',
  httpStatus: 200,
  body: { output: [] },
  data: { lines: [] },
  ...overrides,
});

describe('createScanDebugRecorder', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'scan-debug-'));
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    rmSync(dir, { recursive: true, force: true });
  });

  const onlyFolder = () => {
    const [folder] = readdirSync(dir);
    return join(dir, folder);
  };
  const readJson = (folder: string, name: string): unknown =>
    JSON.parse(readFileSync(join(folder, name), 'utf8'));

  it.each(['production', 'test'])('is off in %s, even with a folder', (env) => {
    expect(createScanDebugRecorder(env, dir)).toBeUndefined();
  });

  it('is off in development without a folder', () => {
    expect(createScanDebugRecorder('development', undefined)).toBeUndefined();
  });

  it('saves the photos, the request and the answer of one call', async () => {
    await createScanDebugRecorder('development', dir)!.record(call());

    const folder = onlyFolder();
    expect(folder).toMatch(
      /2026-10-08T12-00-00-000Z-grocery_receipt_scan-[0-9a-f]{6}$/,
    );
    expect(readFileSync(join(folder, 'image-1.jpg'), 'utf8')).toBe('hello');
    expect(readFileSync(join(folder, 'image-2.png'), 'utf8')).toBe('hi');
    expect(readJson(folder, 'request.json')).toEqual({
      schemaName: 'grocery_receipt_scan',
      provider: 'openai',
      model: 'vision-model',
      maxOutputTokens: 100,
      images: ['image-1.jpg', 'image-2.png'],
      prompt: 'Read the receipt',
      schema: { type: 'object' },
    });
    expect(readJson(folder, 'response.json')).toEqual({
      startedAt: '2026-10-08T12:00:00.000Z',
      durationMs: 1234,
      requestId: 'req-1',
      httpStatus: 200,
      outcome: 'ok',
      data: { lines: [] },
      body: { output: [] },
    });
  });

  it('does not trust an unexpected image type for the file name', async () => {
    await createScanDebugRecorder('development', dir)!.record(
      call({
        request: {
          ...call().request,
          images: [
            'data:image/gif;base64,aGk=',
            'data:image/../../x;base64,aGk=',
          ],
        },
      }),
    );

    const folder = onlyFolder();
    expect(readdirSync(folder).sort()).toEqual([
      'image-1.bin',
      'request.json',
      'response.json',
    ]);
    expect(readJson(folder, 'request.json')).toMatchObject({
      images: ['image-1.bin', 'data:image/../../x;base64,aGk='],
    });
  });

  it('records a failed call with its error', async () => {
    await createScanDebugRecorder('development', dir)!.record(
      call({
        httpStatus: 500,
        body: 'upstream exploded',
        data: undefined,
        error: { code: 'scan.provider_unavailable' },
      }),
    );

    expect(readJson(onlyFolder(), 'response.json')).toMatchObject({
      outcome: 'error',
      error: { code: 'scan.provider_unavailable' },
      body: 'upstream exploded',
    });
  });

  it('never throws when it cannot write', async () => {
    const blocked = join(dir, 'not-a-folder');
    writeFileSync(blocked, '');
    const warn = jest.spyOn(Logger.prototype, 'warn');

    await expect(
      createScanDebugRecorder('development', blocked)!.record(call()),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenLastCalledWith(
      expect.stringContaining('Could not save'),
    );
    expect(existsSync(join(blocked, 'request.json'))).toBe(false);
  });
});
