import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  compareDebugCapture,
  estimateCostUsd,
  loadDebugCaptures,
  renderReport,
  type DebugCapture,
} from './scan-replay';

const PROMPT =
  'Catalog: [["11111111-1111-4111-8111-111111111111","Milk","Dairy"]]';

function writeCapture(
  root: string,
  name: string,
  {
    outcome = 'ok',
    images = ['image-1.jpg'],
    writeImages = images,
    data = { lines: [] },
  }: {
    outcome?: string;
    images?: string[];
    writeImages?: string[];
    data?: unknown;
  } = {},
) {
  const dir = join(root, name);
  mkdirSync(dir);
  for (const image of writeImages) {
    writeFileSync(join(dir, image), Buffer.from('jpeg-bytes'));
  }
  writeFileSync(
    join(dir, 'request.json'),
    JSON.stringify({
      schemaName: 'grocery_receipt_scan',
      provider: 'openai',
      model: 'gpt-4o-mini-2024-07-18',
      maxOutputTokens: 16000,
      images,
      prompt: PROMPT,
      schema: { type: 'object' },
    }),
  );
  writeFileSync(
    join(dir, 'response.json'),
    JSON.stringify({
      durationMs: 19000,
      outcome,
      ...(outcome === 'error'
        ? { error: { code: 'scan.provider_unavailable' } }
        : { data }),
      body: {
        usage: {
          input_tokens: 43855,
          output_tokens: 1488,
          output_tokens_details: { reasoning_tokens: 0 },
        },
      },
    }),
  );
}

describe('loadDebugCaptures', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'scan-replay-'));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('rebuilds the recorded request with its photos as data URLs', async () => {
    writeCapture(root, '2026-10-08-a');

    const { debugCaptures, skipped } = await loadDebugCaptures(root);

    expect(skipped).toEqual([]);
    expect(debugCaptures).toHaveLength(1);
    const [capture] = debugCaptures;
    expect(capture.name).toBe('2026-10-08-a');
    expect(capture.request).toEqual({
      prompt: PROMPT,
      images: [
        `data:image/jpeg;base64,${Buffer.from('jpeg-bytes').toString('base64')}`,
      ],
      schemaName: 'grocery_receipt_scan',
      schema: { type: 'object' },
      maxOutputTokens: 16000,
    });
    expect(capture.recorded).toEqual({
      model: 'gpt-4o-mini-2024-07-18',
      durationMs: 19000,
      data: { lines: [] },
      usage: {
        inputTokens: 43855,
        outputTokens: 1488,
        reasoningTokens: 0,
      },
    });
  });

  it('skips and lists debug captures with an error outcome or a missing image', async () => {
    writeCapture(root, 'b-error', { outcome: 'error' });
    writeCapture(root, 'c-missing-image', { writeImages: [] });
    writeCapture(root, 'a-ok');
    mkdirSync(join(root, 'not-a-capture'));

    const { debugCaptures, skipped } = await loadDebugCaptures(root);

    expect(debugCaptures.map((c) => c.name)).toEqual(['a-ok']);
    expect(skipped).toEqual([
      {
        name: 'b-error',
        reason: 'recorded an error (scan.provider_unavailable)',
      },
      { name: 'c-missing-image', reason: 'image image-1.jpg is missing' },
      { name: 'not-a-capture', reason: 'no request.json or response.json' },
    ]);
  });

  it('skips Voice Note captures and points to voice:replay', async () => {
    writeCapture(root, 'a-ok');
    mkdirSync(join(root, 'b-transcription'));
    writeFileSync(join(root, 'b-transcription', 'transcription.json'), '{}');
    writeCapture(root, 'c-read');
    const request = join(root, 'c-read', 'request.json');
    writeFileSync(
      request,
      JSON.stringify({ schemaName: 'voice_note_actions', images: [] }),
    );

    const { debugCaptures, skipped } = await loadDebugCaptures(root);

    expect(debugCaptures.map((c) => c.name)).toEqual(['a-ok']);
    expect(skipped.map((s) => s.name)).toEqual(['b-transcription', 'c-read']);
    for (const { reason } of skipped) expect(reason).toContain('voice:replay');
  });

  it('loads only the named debug captures when a filter is given', async () => {
    writeCapture(root, 'a');
    writeCapture(root, 'b');
    writeCapture(root, 'c');

    const { debugCaptures } = await loadDebugCaptures(root, {
      only: ['c', 'a'],
    });

    expect(debugCaptures.map((c) => c.name)).toEqual(['a', 'c']);
  });
});

describe('estimateCostUsd', () => {
  it('prices gpt-6-luna input and output (reasoning is billed as output)', () => {
    expect(
      estimateCostUsd('gpt-6-luna', {
        inputTokens: 25239,
        outputTokens: 2539,
        reasoningTokens: 263,
      }),
    ).toBeCloseTo(0.0037934, 9);
  });

  it('prices cached input at the cached rate, for a dated model name', () => {
    expect(
      estimateCostUsd('gpt-4o-mini-2024-07-18', {
        inputTokens: 2000,
        cachedInputTokens: 1000,
        outputTokens: 100,
      }),
    ).toBeCloseTo(0.000285, 9);
  });

  it('has no estimate for an unknown model or missing usage', () => {
    expect(
      estimateCostUsd('vendor-model', { inputTokens: 1, outputTokens: 1 }),
    ).toBeUndefined();
    expect(estimateCostUsd('gpt-6-luna', undefined)).toBeUndefined();
  });
});

const MILK_ID = '11111111-1111-4111-8111-111111111111';
const BREAD_ID = '22222222-2222-4222-8222-222222222222';
const CATALOG_PROMPT = `Catalog: {"ingredients":[["${MILK_ID}","Milk","Dairy"],["${BREAD_ID}","Bread","Bakery"]]}`;

function receiptLine(
  sourceText: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    lineNumber: 1,
    sourceText,
    lineType: 'product',
    includeInPantry: true,
    exclusionReason: null,
    productName: sourceText,
    productType: null,
    matchedIngredientId: null,
    matchedCategory: null,
    matchConfidence: 0.9,
    fallbackIngredientName: null,
    matchExplanation: 'x',
    quantityType: 'count',
    purchasedCount: 1,
    quantityPerItem: null,
    quantityUnit: null,
    confidence: 0.9,
    ...overrides,
  };
}

function receiptCapture(lines: unknown[]): DebugCapture {
  return {
    name: 'receipt-1',
    request: {
      prompt: CATALOG_PROMPT,
      schemaName: 'grocery_receipt_scan',
      schema: {},
      maxOutputTokens: 16000,
    },
    recorded: {
      model: 'gpt-4o-mini-2024-07-18',
      durationMs: 19000,
      data: { merchantName: 'Shop', purchaseDate: '2026-10-08', lines },
      usage: { inputTokens: 44000, outputTokens: 1500 },
    },
  };
}

const receipt = (lines: unknown[], merchantName = 'Shop') => ({
  merchantName,
  purchaseDate: '2026-10-08',
  lines,
});

describe('compareDebugCapture', () => {
  it('lists what a replay changed against the recorded receipt answer', () => {
    const capture = receiptCapture([
      receiptLine('MILK 1L', { matchedIngredientId: MILK_ID }),
      receiptLine('BREAD', { matchedIngredientId: BREAD_ID }),
      receiptLine('BAG', { lineType: 'fee', includeInPantry: false }),
    ]);

    const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
      {
        ok: true,
        durationMs: 8000,
        usage: { inputTokens: 25000, outputTokens: 2000, reasoningTokens: 0 },
        data: receipt(
          [
            receiptLine('MILK 1L', {
              matchedIngredientId: MILK_ID,
              quantityType: 'package_size',
              purchasedCount: 2,
              quantityPerItem: 1,
              quantityUnit: 'l',
            }),
            receiptLine('BAG', { lineType: 'fee', includeInPantry: false }),
            receiptLine('EGGS', { fallbackIngredientName: 'Eggs' }),
          ],
          'Shop SRL',
        ),
      },
    ]);

    expect(comparison.recorded).toMatchObject({
      lines: 3,
      matched: 2,
    });
    expect(comparison.recorded.costUsd).toBeCloseTo(0.0075, 9);
    expect(comparison.runs).toHaveLength(1);
    expect(comparison.runs[0]).toMatchObject({
      run: 1,
      ok: true,
      lines: 3,
      matched: 1,
      durationMs: 8000,
    });
    expect(comparison.runs[0].costUsd).toBeCloseTo(0.0035, 9);
    expect(comparison.runs[0].changes).toEqual([
      { field: 'merchant', recorded: 'Shop', replayed: 'Shop SRL' },
      {
        item: 'MILK 1L',
        field: 'quantity',
        recorded: '1 (count)',
        replayed: '2 x 1 l (package_size)',
      },
      { item: 'BREAD', field: 'line', recorded: 'found', replayed: 'missing' },
      { item: 'EGGS', field: 'line', recorded: 'missing', replayed: 'found' },
    ]);
  });

  it('names Ingredients the capture matched by Catalog index, as the Catalog text now sends them', () => {
    const capture: DebugCapture = {
      ...receiptCapture([
        receiptLine('MILK 1L', { matchedIngredientId: 0 }),
        receiptLine('BREAD'),
      ]),
    };
    capture.request.prompt =
      'Catalog: {"ingredients":[[0,"Milk","Dairy"],[1,"Bread","Bakery"]]}';

    const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
      {
        ok: true,
        durationMs: 1,
        data: receipt([
          receiptLine('MILK 1L', { matchedIngredientId: 1 }),
          receiptLine('BREAD', { matchedIngredientId: 1 }),
        ]),
      },
    ]);

    expect(comparison.recorded).toMatchObject({ matched: 1 });
    expect(comparison.runs[0]).toMatchObject({ matched: 2 });
    expect(comparison.runs[0].changes).toEqual([
      {
        item: 'MILK 1L',
        field: 'ingredient',
        recorded: 'Milk',
        replayed: 'Bread',
      },
      {
        item: 'BREAD',
        field: 'ingredient',
        recorded: 'unmatched (-)',
        replayed: 'Bread',
      },
    ]);
  });

  it('shows where repeated runs disagree, leaving failed runs out', () => {
    const capture = receiptCapture([receiptLine('MILK 1L')]);
    const ok = (lines: unknown[]) => ({
      ok: true as const,
      durationMs: 1,
      data: receipt(lines),
    });

    const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
      ok([receiptLine('MILK 1L'), receiptLine('BREAD')]),
      ok([receiptLine('MILK 1L')]),
      ok([receiptLine('MILK 1L', { purchasedCount: 2 }), receiptLine('BREAD')]),
      { ok: false, error: 'scan.provider_incomplete', durationMs: 1 },
    ]);

    expect(comparison.runs[3]).toMatchObject({
      run: 4,
      ok: false,
      error: 'scan.provider_incomplete',
    });
    expect(comparison.disagreements).toEqual([
      {
        item: 'MILK 1L',
        field: 'quantity',
        values: [
          { value: '1 (count)', runs: [1, 2] },
          { value: '2 (count)', runs: [3] },
        ],
      },
      {
        item: 'BREAD',
        field: 'line',
        values: [
          { value: 'found', runs: [1, 3] },
          { value: 'missing', runs: [2] },
        ],
      },
    ]);
  });

  it('pairs receipt lines whose text was read slightly differently', () => {
    const capture = receiptCapture([
      receiptLine('1.000 Buc x 6.59 LAPTE INTEGRAL 3.5% 5LGR'),
      receiptLine('1.000 Buc x 6.59 LAPTE INTEGRAL 3.5% 5LGR'),
      receiptLine('2.000 Buc x 12.49 SEM.PESTRITE CU SARE'),
    ]);
    const run = (lines: unknown[]) => ({
      ok: true as const,
      durationMs: 1,
      data: receipt(lines),
    });

    const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
      run([
        receiptLine('1,000 Buc x 6,59 LAPTE INTEGRAL 3.5% 1L'),
        receiptLine('1,000 Buc x 6,59 LAPTE INTEGRAL 3.5% 1L'),
        receiptLine('2,000 Buc x 12,49 SEM.PESTRITE CU SARE', {
          matchedIngredientId: BREAD_ID,
        }),
      ]),
      run([
        receiptLine('1.000 BUC X 6.59 LAPTE INTEGRAL 3.5% 1L'),
        receiptLine('2,000 Buc x 12,49 SEM.PESTRITE CU SARE', {
          matchedIngredientId: BREAD_ID,
        }),
        receiptLine('1.000 BUC X 6.59 LAPTE INTEGRAL 3.5% 1L'),
      ]),
    ]);

    expect(comparison.runs[0].changes).toEqual([
      {
        item: '2.000 Buc x 12.49 SEM.PESTRITE CU SARE',
        field: 'ingredient',
        recorded: 'unmatched (-)',
        replayed: 'Bread',
      },
    ]);
    expect(comparison.disagreements).toEqual([]);
  });

  it('ignores the case of a unit', () => {
    const line = (unit: string) =>
      receiptLine('AQUA 1.5L', {
        quantityType: 'package_size',
        purchasedCount: 6,
        quantityPerItem: 1.5,
        quantityUnit: unit,
      });
    const comparison = compareDebugCapture(receiptCapture([line('L')]), 'm', [
      { ok: true, durationMs: 1, data: receipt([line('l')]) },
    ]);
    expect(comparison.runs[0].changes).toEqual([]);
  });

  it('reports no disagreement for a single run', () => {
    const capture = receiptCapture([receiptLine('MILK 1L')]);
    const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
      { ok: true, durationMs: 1, data: receipt([receiptLine('BREAD')]) },
    ]);
    expect(comparison.disagreements).toEqual([]);
  });

  const item = (overrides: Record<string, unknown>) => ({
    productName: 'Thing',
    productType: 'thing',
    matchedIngredientId: null,
    matchedCategory: null,
    matchConfidence: 0.9,
    fallbackIngredientName: 'Thing',
    confidence: 0.9,
    ...overrides,
  });

  it.each([
    [
      'grocery_product_scan',
      item({ matchedIngredientId: MILK_ID, expiryDate: '2026-11-01' }),
      item({ matchedIngredientId: MILK_ID, expiryDate: '2026-11-07' }),
      [{ field: 'expiryDate', recorded: '2026-11-01', replayed: '2026-11-07' }],
    ],
    [
      'grocery_ingredients_photo_scan',
      { items: [item({ matchedIngredientId: MILK_ID }), item({})] },
      {
        items: [
          item({ matchedIngredientId: MILK_ID }),
          item({ matchedIngredientId: BREAD_ID }),
        ],
      },
      [
        {
          item: 'unmatched (Thing)',
          field: 'line',
          recorded: 'found',
          replayed: 'missing',
        },
        {
          item: 'Bread',
          field: 'line',
          recorded: 'missing',
          replayed: 'found',
        },
      ],
    ],
    [
      'plate_recipe_suggestions',
      {
        matches: [
          { title: 'Carbonara', confidence: 0.8 },
          { title: 'Cacio e pepe', confidence: 0.3 },
        ],
      },
      { matches: [{ title: 'carbonara', confidence: 0.9 }] },
      [
        {
          item: 'Cacio e pepe',
          field: 'line',
          recorded: 'found',
          replayed: 'missing',
        },
      ],
    ],
    [
      'selected_recipe_ingredients',
      {
        items: [
          item({
            matchedIngredientId: MILK_ID,
            quantityType: 'measured',
            quantity: 200,
            unit: 'ml',
          }),
        ],
      },
      {
        items: [
          item({
            matchedIngredientId: MILK_ID,
            quantityType: 'measured',
            quantity: 250,
            unit: 'ml',
          }),
        ],
      },
      [
        {
          item: 'Milk',
          field: 'quantity',
          recorded: '200 ml (measured)',
          replayed: '250 ml (measured)',
        },
      ],
    ],
  ])(
    'compares the parts that matter for %s',
    (schemaName, recordedData, replayedData, changes) => {
      const capture: DebugCapture = {
        name: 'c',
        request: {
          prompt: CATALOG_PROMPT,
          schemaName,
          schema: {},
          maxOutputTokens: 400,
        },
        recorded: { model: 'gpt-4o-mini', data: recordedData },
      };
      const comparison = compareDebugCapture(capture, 'gpt-6-luna', [
        { ok: true, durationMs: 1, data: replayedData },
      ]);
      expect(comparison.runs[0].changes).toEqual(changes);
    },
  );
});

describe('renderReport', () => {
  it('reports per capture the runs, their differences, disagreements and totals', () => {
    const comparison = compareDebugCapture(
      receiptCapture([
        receiptLine('MILK 1L', { matchedIngredientId: MILK_ID }),
        receiptLine('BREAD'),
      ]),
      'gpt-6-luna',
      [
        {
          ok: true,
          durationMs: 8000,
          usage: { inputTokens: 25000, outputTokens: 2000, reasoningTokens: 0 },
          data: receipt([
            receiptLine('MILK 1L', { matchedIngredientId: MILK_ID }),
          ]),
        },
        {
          ok: true,
          durationMs: 9500,
          usage: { inputTokens: 25000, outputTokens: 2000, reasoningTokens: 0 },
          data: receipt([
            receiptLine('MILK 1L', { matchedIngredientId: MILK_ID }),
            receiptLine('BREAD'),
          ]),
        },
        { ok: false, error: 'scan.provider_incomplete', durationMs: 30000 },
      ],
    );

    const report = renderReport({
      model: 'gpt-6-luna',
      effort: 'none',
      repeat: 3,
      comparisons: [comparison],
      skipped: [{ name: 'old', reason: 'recorded an error (scan.x)' }],
    });

    expect(report).toContain(
      '# Scan replay: gpt-6-luna, effort none, 3 runs per debug capture',
    );
    expect(report).toContain('1 replayed, 1 skipped');
    expect(report).toContain('Estimated replay cost: $0.0070');
    expect(report).toContain('- old: recorded an error (scan.x)');
    expect(report).toContain('## receipt-1 (grocery_receipt_scan)');
    expect(report).toContain(
      '| recorded | gpt-4o-mini-2024-07-18 | 2 | 1 | 44000 | - | 1500 | - | $0.0075 | 19.0s |',
    );
    expect(report).toContain(
      '| 1 | gpt-6-luna | 1 | 1 | 25000 | - | 2000 | 0 | $0.0035 | 8.0s |',
    );
    expect(report).toContain(
      '| 3 | gpt-6-luna | failed: scan.provider_incomplete | - | - | - | - | - | - | 30.0s |',
    );
    expect(report).toContain(
      '### Run 1 vs recorded\n\n- BREAD, line: found -> missing',
    );
    expect(report).toContain('### Run 2 vs recorded\n\nNo differences.');
    expect(report).toContain('- BREAD, line: missing in run 1; found in run 2');
  });

  it('says when repeated runs agree', () => {
    const capture = receiptCapture([receiptLine('MILK 1L')]);
    const same = {
      ok: true as const,
      durationMs: 1,
      data: receipt([receiptLine('MILK 1L')]),
    };
    const report = renderReport({
      model: 'gpt-6-luna',
      effort: 'none',
      repeat: 2,
      comparisons: [compareDebugCapture(capture, 'gpt-6-luna', [same, same])],
      skipped: [],
    });
    expect(report).toContain('All 2 runs agree.');
  });
});
