import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { estimateCostUsd } from './scan-replay';
import {
  evaluateReadRun,
  loadVoiceCaseSet,
  renderReadReport,
  renderTranscriptionReport,
  requestFor,
  type LoadedVoiceCase,
} from './voice-replay';
import type { VoiceCatalog } from './voice-cases';

const MILK = '00000000-0000-4000-8000-000000000001';
const catalog: VoiceCatalog = {
  categories: ['Dairy'],
  ingredients: [
    {
      id: MILK,
      category: 'Dairy',
      names: { en: 'Milk', ro: 'Lapte', da: 'Mælk' },
    },
  ],
};
const catalogFile = JSON.stringify(catalog);

const caseJson = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  scanLanguage: 'en',
  tags: ['basic'],
  transcript: 'add milk',
  expected: {
    actions: [{ target: 'shopping', op: 'add', ingredient: 'Milk' }],
  },
  ...overrides,
});

describe('loadVoiceCaseSet', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'voice-cases-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const write = (name: string, value: unknown) =>
    writeFileSync(
      join(dir, name),
      typeof value === 'string' ? value : JSON.stringify(value),
    );

  it('loads the Catalog and every case file, with the audio path resolved beside the file', () => {
    write('catalog.json', catalogFile);
    write('en.json', {
      source: 'recorded',
      cases: [caseJson('en-1', { audio: 'a/en-1.webm' })],
    });
    write('da.json', { source: 'synthetic', cases: [caseJson('da-1')] });

    const set = loadVoiceCaseSet(dir);

    expect(set.catalog).toEqual(catalog);
    expect(set.cases.map((c) => [c.id, c.source])).toEqual([
      ['da-1', 'synthetic'],
      ['en-1', 'recorded'],
    ]);
    expect(set.cases[1].audioPath).toBe(join(dir, 'a/en-1.webm'));
    expect(set.cases[0].audioPath).toBeUndefined();
  });

  it('filters by id and by language', () => {
    write('catalog.json', catalogFile);
    write('en.json', {
      source: 'synthetic',
      cases: [
        caseJson('en-1'),
        caseJson('en-2'),
        caseJson('ro-1', { scanLanguage: 'ro' }),
      ],
    });
    expect(loadVoiceCaseSet(dir, { only: ['en-2'] }).cases).toHaveLength(1);
    expect(loadVoiceCaseSet(dir, { language: 'ro' }).cases[0].id).toBe('ro-1');
  });

  it('names the file and the case when one does not fit the format', () => {
    write('catalog.json', catalogFile);
    write('en.json', {
      source: 'synthetic',
      cases: [caseJson('en-1', { tags: ['nonsense'] })],
    });
    expect(() => loadVoiceCaseSet(dir)).toThrow(/en\.json.*tags/s);
  });

  it('rejects duplicate case ids and a missing Catalog', () => {
    write('en.json', {
      source: 'synthetic',
      cases: [caseJson('x'), caseJson('x')],
    });
    expect(() => loadVoiceCaseSet(dir)).toThrow(/catalog\.json/);
    write('catalog.json', catalogFile);
    expect(() => loadVoiceCaseSet(dir)).toThrow(/duplicate case id "x"/);
  });

  it('ignores subfolders, so recordings can sit beside the case files', () => {
    write('catalog.json', catalogFile);
    mkdirSync(join(dir, 'audio'));
    write('en.json', { source: 'synthetic', cases: [caseJson('en-1')] });
    expect(loadVoiceCaseSet(dir).cases).toHaveLength(1);
  });
});

const loaded = (
  id: string,
  language: 'en' | 'ro' | 'da' = 'en',
  tags: LoadedVoiceCase['tags'] = ['basic'],
): LoadedVoiceCase => ({
  id,
  scanLanguage: language,
  locale: language,
  tags,
  transcript: 'add milk',
  defaultTarget: 'shopping',
  today: '2026-10-14',
  shoppingList: [],
  pantry: [],
  expected: {
    actions: [
      {
        target: 'shopping',
        op: 'add',
        ingredient: { en: 'Milk', ro: 'Lapte', da: 'Mælk' }[language],
        quantity: null,
        unit: null,
        expiresOn: null,
        noExpiry: false,
      },
    ],
    unsupported: 0,
  },
  source: 'synthetic',
  file: 'en.json',
});

const goodAnswer = {
  actions: [
    {
      target: 'shopping',
      op: 'add',
      spokenText: 'milk',
      matchedIngredientId: MILK,
      matchConfidence: 0.9,
      fallbackIngredientName: 'Milk',
      quantity: null,
      unit: null,
      scope: null,
      expiresOn: null,
      noExpiry: false,
      location: null,
    },
  ],
  unsupported: [],
};

describe('requestFor', () => {
  it('builds the production read request from the case and the Catalog in its locale', () => {
    const c = { ...loaded('da-1', 'da'), shoppingList: ['Mælk'] };
    const request = requestFor(c, catalog);
    expect(request.model).toBe('text');
    expect(request.prompt).toContain('"Mælk"');
    expect(request.prompt).toContain('spoken in Danish');
    expect(request.prompt).toContain('Today is 2026-10-14');
    expect(request.prompt).toContain('Transcript: "add milk"');
  });
});

describe('evaluateReadRun', () => {
  const usage = { inputTokens: 1000, outputTokens: 200 };

  it('compares an answer with the expected actions and keeps usage and latency', () => {
    const result = evaluateReadRun(
      loaded('en-1'),
      catalog,
      1,
      { ok: true, data: goodAnswer, usage, durationMs: 800 },
      0.6,
    );
    expect(result).toMatchObject({
      caseId: 'en-1',
      ok: true,
      durationMs: 800,
      usage,
    });
    expect(result.comparison?.passed).toBe(true);
  });

  it('records a provider error as a failed run', () => {
    const result = evaluateReadRun(
      loaded('en-1'),
      catalog,
      1,
      { ok: false, error: 'incomplete (max_output_tokens)', durationMs: 5 },
      0.6,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('incomplete (max_output_tokens)');
    expect(result.comparison).toBeUndefined();
  });

  it('records an answer that does not fit the Voice Action schema as a failed run', () => {
    const result = evaluateReadRun(
      loaded('en-1'),
      catalog,
      1,
      { ok: true, data: { nope: true }, durationMs: 5 },
      0.6,
    );
    expect(result).toMatchObject({
      ok: false,
      error: 'answer does not fit the schema',
    });
  });
});

describe('renderReadReport', () => {
  const run = (
    caseOf: LoadedVoiceCase,
    data: unknown,
    usage = { inputTokens: 1_000_000, outputTokens: 100_000 },
  ) =>
    evaluateReadRun(
      caseOf,
      catalog,
      1,
      { ok: true, data, usage, durationMs: 1500 },
      0.6,
    );
  const wrong = {
    ...goodAnswer,
    actions: [{ ...goodAnswer.actions[0], op: 'remove' }],
  };

  const report = renderReadReport({
    model: 'gpt-5-nano',
    effort: 'low',
    repeat: 1,
    prices: { input: 1, cachedInput: 0.5, output: 2 },
    results: [
      run(loaded('en-1', 'en', ['basic']), goodAnswer),
      run(loaded('en-2', 'en', ['basic', 'units']), wrong),
      run(loaded('ro-1', 'ro', ['units']), goodAnswer),
    ],
  });

  it('totals passed cases and actions overall and per Scan Language', () => {
    expect(report).toContain(
      '# Voice Note read replay: gpt-5-nano, effort low',
    );
    expect(report).toMatch(/Runs: 3, passed 2/);
    expect(report).toMatch(/\| en \| 2 \| 1 \| 1 \| 1 \| 0 \| 0 \|/);
    expect(report).toMatch(/\| ro \| 1 \| 1 \| 1 \| 0 \| 0 \| 0 \|/);
  });

  it('breaks results down by tag', () => {
    expect(report).toMatch(/\| basic \| 2 \| 1 \|/);
    expect(report).toMatch(/\| units \| 2 \| 1 \|/);
  });

  it('lists each miss with the field that differs', () => {
    expect(report).toContain('en-2');
    expect(report).toContain('op: expected add, got remove');
  });

  it('reports cost from the given prices: 1M in at 1 plus 100k out at 2 is $1.20 a run', () => {
    expect(report).toContain('Estimated cost: $3.6000 ($1.2000 per run)');
  });

  it('shows unknown cost as - when the model has no price', () => {
    const none = renderReadReport({
      model: 'gpt-5-nano',
      effort: 'low',
      repeat: 1,
      results: [run(loaded('en-1'), goodAnswer)],
    });
    expect(none).toContain('Estimated cost: -');
  });

  it('says the cases are not real Voice Notes when they are synthetic', () => {
    expect(report).toMatch(/synthetic/i);
  });
});

describe('estimateCostUsd with explicit prices', () => {
  it('uses the given price for a model the codebase does not know', () => {
    expect(
      estimateCostUsd(
        'gpt-5-nano',
        { inputTokens: 1_000_000, outputTokens: 0 },
        { input: 3, cachedInput: 1, output: 4 },
      ),
    ).toBe(3);
  });
});

describe('renderTranscriptionReport', () => {
  it('shows the replayed transcript against the typed one, with word errors and latency', () => {
    const report = renderTranscriptionReport({
      model: 'gpt-transcribe',
      results: [
        {
          caseId: 'en-1',
          scanLanguage: 'en',
          ok: true,
          transcript: 'add milk',
          expected: 'add milk',
          durationMs: 1200,
          comparison: { exact: true, wordErrors: 0, words: 2, wer: 0 },
        },
        {
          caseId: 'ro-1',
          scanLanguage: 'ro',
          ok: true,
          transcript: 'adauga lapte',
          expected: 'adaugă lapte',
          durationMs: 1800,
          comparison: { exact: false, wordErrors: 1, words: 2, wer: 0.5 },
        },
        {
          caseId: 'da-1',
          scanLanguage: 'da',
          ok: false,
          error: 'voice.provider_unavailable (HTTP 413)',
          durationMs: 100,
        },
      ],
    });
    expect(report).toContain(
      '# Voice Note transcription replay: gpt-transcribe',
    );
    expect(report).toMatch(/Replayed: 3, failed 1, exact 1/);
    expect(report).toContain('adauga lapte');
    expect(report).toContain('voice.provider_unavailable (HTTP 413)');
    expect(report).toMatch(/\| ro \| 1 \| 1 \| 0\.50 \|/);
    expect(report).toMatch(/Word error rate: 0\.25/);
  });
});
