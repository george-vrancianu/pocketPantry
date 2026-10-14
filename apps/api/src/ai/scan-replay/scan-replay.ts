import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  readAiUsage,
  type AiTokenUsage,
  type StructuredOutputRequest,
} from '../structured-output-ai.service';

/** One Scan debug capture (a folder written under `SCAN_DEBUG_DIR`), ready to resend. */
export type Capture = {
  name: string;
  request: StructuredOutputRequest;
  recorded: {
    model: string;
    durationMs?: number;
    data: unknown;
    usage?: AiTokenUsage;
  };
};

export type SkippedCapture = { name: string; reason: string };

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

type RecordedRequest = {
  schemaName: string;
  provider: string;
  model: string;
  maxOutputTokens: number;
  images: string[];
  prompt: string;
  schema: Record<string, unknown>;
};

type RecordedResponse = {
  durationMs?: number;
  outcome: 'ok' | 'error';
  error?: { code: string };
  data?: unknown;
  body?: unknown;
};

/**
 * Reads every capture folder in `root`, in name (= time) order. A capture that recorded an
 * error, lost a photo, or is not a capture at all is skipped and listed, never fatal.
 */
export async function loadCaptures(
  root: string,
  { only }: { only?: string[] } = {},
): Promise<{ captures: Capture[]; skipped: SkippedCapture[] }> {
  const entries = await readdir(root, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !only || only.includes(name))
    .sort();
  const captures: Capture[] = [];
  const skipped: SkippedCapture[] = [];
  for (const name of names) {
    const result = await loadCapture(join(root, name), name);
    if ('reason' in result) skipped.push(result);
    else captures.push(result);
  }
  return { captures, skipped };
}

async function loadCapture(
  dir: string,
  name: string,
): Promise<Capture | SkippedCapture> {
  let request: RecordedRequest;
  let response: RecordedResponse;
  try {
    request = JSON.parse(
      await readFile(join(dir, 'request.json'), 'utf8'),
    ) as RecordedRequest;
    response = JSON.parse(
      await readFile(join(dir, 'response.json'), 'utf8'),
    ) as RecordedResponse;
  } catch {
    return { name, reason: 'no request.json or response.json' };
  }
  if (response.outcome !== 'ok') {
    return {
      name,
      reason: `recorded an error (${response.error?.code ?? 'unknown'})`,
    };
  }

  const images: string[] = [];
  for (const image of request.images ?? []) {
    const mime = MIME_TYPES[extname(image).toLowerCase()];
    if (!mime) return { name, reason: `image ${image} was not saved` };
    try {
      const bytes = await readFile(join(dir, image));
      images.push(`data:${mime};base64,${bytes.toString('base64')}`);
    } catch {
      return { name, reason: `image ${image} is missing` };
    }
  }

  const usage = readAiUsage(request.provider, response.body);
  return {
    name,
    request: {
      prompt: request.prompt,
      ...(images.length ? { images } : {}),
      schemaName: request.schemaName,
      schema: request.schema,
      maxOutputTokens: request.maxOutputTokens,
    },
    recorded: {
      model: request.model,
      durationMs: response.durationMs,
      data: response.data,
      ...(usage ? { usage } : {}),
    },
  };
}

/** One replay of a capture: the answer, or the error the service threw. */
export type ReplayRun =
  | { ok: true; data: unknown; usage?: AiTokenUsage; durationMs: number }
  | { ok: false; error: string; durationMs: number };

/** A field that differs from the recorded answer; `item` names the line, absent for the whole answer. */
export type Change = {
  item?: string;
  field: string;
  recorded: string;
  replayed: string;
};

/** A field the repeated runs do not agree on, with the runs (1-based) that gave each value. */
export type Disagreement = {
  item?: string;
  field: string;
  values: { value: string; runs: number[] }[];
};

type Stats = {
  lines: number;
  matched: number;
  usage?: AiTokenUsage;
  costUsd?: number;
  durationMs?: number;
};

export type RunComparison = Stats & {
  run: number;
  ok: boolean;
  error?: string;
  changes: Change[];
};

export type CaptureComparison = {
  name: string;
  schemaName: string;
  recordedModel: string;
  recorded: Stats;
  runs: RunComparison[];
  disagreements: Disagreement[];
};

/**
 * One line of an answer. `key` pairs it with the same line in another answer: exactly, or
 * (`fuzzy`) by similar text, since a model reads the same receipt line slightly differently.
 */
type Item = {
  key: string;
  fuzzy: boolean;
  label: string;
  fields: Record<string, string>;
};

/** What the report compares in an answer: top-level fields and its lines. */
type Answer = {
  fields: Record<string, string>;
  items: Item[];
  matched: number;
};

/** An answer whose lines are keyed by the line they pair with across all answers of a capture. */
type View = {
  fields: Record<string, string>;
  items: Map<string, { label: string; fields: Record<string, string> }>;
  matched: number;
};

/** Below this, two receipt lines are different lines (Dice similarity of their text). */
const SAME_LINE = 0.6;

const FOUND = 'found';
const MISSING = 'missing';

/** Compares each replay with the recorded answer, and the replays with each other. */
export function compareCapture(
  capture: Capture,
  model: string,
  runs: ReplayRun[],
): CaptureComparison {
  const catalog = catalogNames(capture.request.prompt);
  const answerOf = (data: unknown) =>
    readAnswer(capture.request.schemaName, data, catalog);
  const okRuns = runs.flatMap((run, index) =>
    run.ok ? [{ index, answer: answerOf(run.data) }] : [],
  );
  const [recorded, ...aligned] = align([
    answerOf(capture.recorded.data),
    ...okRuns.map((run) => run.answer),
  ]);
  const views: (View | undefined)[] = runs.map(() => undefined);
  okRuns.forEach(({ index }, n) => (views[index] = aligned[n]));

  return {
    name: capture.name,
    schemaName: capture.request.schemaName,
    recordedModel: capture.recorded.model,
    recorded: {
      lines: recorded.items.size,
      matched: recorded.matched,
      usage: capture.recorded.usage,
      costUsd: estimateCostUsd(capture.recorded.model, capture.recorded.usage),
      durationMs: capture.recorded.durationMs,
    },
    runs: runs.map((run, index): RunComparison => {
      const view = views[index];
      if (!run.ok || !view) {
        return {
          run: index + 1,
          ok: false,
          error: run.ok ? undefined : run.error,
          lines: 0,
          matched: 0,
          durationMs: run.durationMs,
          changes: [],
        };
      }
      return {
        run: index + 1,
        ok: true,
        lines: view.items.size,
        matched: view.matched,
        usage: run.usage,
        costUsd: estimateCostUsd(model, run.usage),
        durationMs: run.durationMs,
        changes: diffViews(recorded, view),
      };
    }),
    disagreements: disagreements(
      views.flatMap((view, index) => (view ? [{ run: index + 1, view }] : [])),
    ),
  };
}

/** Fields and lines the successful runs disagree on; none with fewer than two. */
function disagreements(runs: { run: number; view: View }[]): Disagreement[] {
  if (runs.length < 2) return [];
  const result: Disagreement[] = [];
  const compare = (
    item: string | undefined,
    field: string,
    valueOf: (view: View) => string | undefined,
  ) => {
    const values: Disagreement['values'] = [];
    for (const { run, view } of runs) {
      const value = valueOf(view);
      if (value === undefined) continue;
      const seen = values.find((entry) => entry.value === value);
      if (seen) seen.runs.push(run);
      else values.push({ value, runs: [run] });
    }
    if (values.length > 1) {
      result.push({ ...(item === undefined ? {} : { item }), field, values });
    }
  };

  const fields = new Set(runs.flatMap(({ view }) => Object.keys(view.fields)));
  for (const field of fields) {
    compare(undefined, field, (view) => view.fields[field] ?? MISSING);
  }
  const items = new Map<string, { label: string; fields: Set<string> }>();
  for (const { view } of runs) {
    for (const [key, item] of view.items) {
      const entry = items.get(key) ?? { label: item.label, fields: new Set() };
      Object.keys(item.fields).forEach((field) => entry.fields.add(field));
      items.set(key, entry);
    }
  }
  for (const [key, { label, fields: itemFields }] of items) {
    compare(label, 'line', (view) => (view.items.has(key) ? FOUND : MISSING));
    for (const field of itemFields) {
      compare(label, field, (view) => view.items.get(key)?.fields[field]);
    }
  }
  return result;
}

function diffViews(recorded: View, replayed: View): Change[] {
  const changes: Change[] = diffFields(
    recorded.fields,
    replayed.fields,
    undefined,
  );
  for (const [key, item] of recorded.items) {
    const other = replayed.items.get(key);
    if (!other) {
      changes.push({
        item: item.label,
        field: 'line',
        recorded: FOUND,
        replayed: MISSING,
      });
    } else {
      changes.push(...diffFields(item.fields, other.fields, item.label));
    }
  }
  for (const [key, item] of replayed.items) {
    if (!recorded.items.has(key)) {
      changes.push({
        item: item.label,
        field: 'line',
        recorded: MISSING,
        replayed: FOUND,
      });
    }
  }
  return changes;
}

function diffFields(
  recorded: Record<string, string>,
  replayed: Record<string, string>,
  item: string | undefined,
): Change[] {
  return Object.keys({ ...recorded, ...replayed })
    .filter((field) => recorded[field] !== replayed[field])
    .map((field) => ({
      ...(item === undefined ? {} : { item }),
      field,
      recorded: recorded[field] ?? MISSING,
      replayed: replayed[field] ?? MISSING,
    }));
}

/** Ingredient names by id, read from the Catalog the prompt lists as `["id","name",...]`. */
function catalogNames(prompt: string): Map<string, string> {
  const names = new Map<string, string>();
  for (const match of prompt.matchAll(
    /\["([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})","((?:[^"\\]|\\.)*)"/gi,
  )) {
    names.set(match[1].toLowerCase(), match[2]);
  }
  return names;
}

type Line = Record<string, unknown>;

const text = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : (JSON.stringify(value ?? null) ?? '-').replace(/^null$/, '-');

/**
 * Keys every answer's lines so a line pairs with the same line in the other answers: each
 * line joins the most similar unclaimed line seen so far, or starts a new one.
 */
function align(answers: Answer[]): View[] {
  const known: { item: Item; id: string }[] = [];
  return answers.map((answer) => {
    const candidates: { line: number; known: number; score: number }[] = [];
    answer.items.forEach((item, line) =>
      known.forEach((other, index) => {
        const score = similarity(item, other.item);
        if (score >= SAME_LINE) candidates.push({ line, known: index, score });
      }),
    );
    candidates.sort((a, b) => b.score - a.score);
    const ids: (string | undefined)[] = answer.items.map(() => undefined);
    const claimed = new Set<number>();
    for (const { line, known: index } of candidates) {
      if (ids[line] !== undefined || claimed.has(index)) continue;
      ids[line] = known[index].id;
      claimed.add(index);
    }
    const items: View['items'] = new Map();
    answer.items.forEach((item, line) => {
      let id = ids[line];
      let label = item.label;
      if (id === undefined) {
        id = String(known.length);
        known.push({ item, id });
      } else {
        label = known[Number(id)].item.label;
      }
      items.set(id, { label, fields: item.fields });
    });
    return { fields: answer.fields, items, matched: answer.matched };
  });
}

function similarity(a: Item, b: Item): number {
  if (a.key === b.key) return 1;
  if (!a.fuzzy || !b.fuzzy) return 0;
  const left = bigrams(a.key);
  const right = bigrams(b.key);
  let shared = 0;
  for (const [gram, count] of left) {
    shared += Math.min(count, right.get(gram) ?? 0);
  }
  const total = a.key.length - 1 + (b.key.length - 1);
  return total > 0 ? (2 * shared) / total : 0;
}

function bigrams(value: string): Map<string, number> {
  const grams = new Map<string, number>();
  for (let i = 0; i < value.length - 1; i++) {
    const gram = value.slice(i, i + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }
  return grams;
}

function readAnswer(
  schemaName: string,
  data: unknown,
  catalog: Map<string, string>,
): Answer {
  const answer = (data ?? {}) as Line;
  const ingredient = (line: Line): string => {
    const id = line.matchedIngredientId;
    if (typeof id === 'string') return catalog.get(id.toLowerCase()) ?? id;
    return `unmatched (${text(line.fallbackIngredientName)})`;
  };
  const isMatched = (line: Line) =>
    typeof line.matchedIngredientId === 'string';
  const linesOf = (value: unknown): Line[] =>
    Array.isArray(value) ? (value as Line[]) : [];

  switch (schemaName) {
    case 'grocery_receipt_scan': {
      const lines = linesOf(answer.lines);
      return {
        fields: {
          merchant: text(answer.merchantName),
          purchaseDate: text(answer.purchaseDate),
        },
        items: lines.map((line) => ({
          key: normalize(text(line.sourceText)),
          fuzzy: true,
          label: text(line.sourceText),
          fields: {
            type: `${text(line.lineType)}${line.includeInPantry === false ? ' (excluded)' : ''}`,
            ingredient: ingredient(line),
            quantity: receiptQuantity(line),
          },
        })),
        matched: lines.filter(isMatched).length,
      };
    }
    case 'grocery_product_scan':
      return {
        fields: {
          ingredient: ingredient(answer),
          expiryDate: text(answer.expiryDate),
        },
        items: [],
        matched: isMatched(answer) ? 1 : 0,
      };
    case 'grocery_ingredients_photo_scan':
    case 'selected_recipe_ingredients': {
      const lines = linesOf(answer.items);
      return {
        fields: {},
        items: lines.map((line): Item => ({
          key: normalize(ingredient(line)),
          fuzzy: false,
          label: ingredient(line),
          fields:
            schemaName === 'selected_recipe_ingredients'
              ? {
                  quantity: `${text(line.quantity)}${line.unit ? ` ${text(line.unit).toLowerCase()}` : ''} (${text(line.quantityType)})`,
                }
              : {},
        })),
        matched: lines.filter(isMatched).length,
      };
    }
    case 'plate_recipe_suggestions':
      return {
        fields: {},
        items: linesOf(answer.matches).map((line) => ({
          key: normalize(text(line.title)),
          fuzzy: false,
          label: text(line.title),
          fields: {},
        })),
        matched: 0,
      };
    default:
      return {
        fields: { answer: JSON.stringify(data) },
        items: [],
        matched: 0,
      };
  }
}

function receiptQuantity(line: Line): string {
  const perItem =
    line.quantityPerItem === null || line.quantityPerItem === undefined
      ? ''
      : ` x ${text(line.quantityPerItem)}${line.quantityUnit ? ` ${text(line.quantityUnit).toLowerCase()}` : ''}`;
  return `${text(line.purchasedCount)}${perItem} (${text(line.quantityType)})`;
}

/** Case, spacing and decimal commas are reading noise, not a different line. */
const normalize = (value: string) =>
  value.toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim();

export type ReportInput = {
  model: string;
  effort: string;
  repeat: number;
  comparisons: CaptureComparison[];
  skipped: SkippedCapture[];
};

/** The replay report as Markdown. It quotes receipt lines: personal data, keep it local. */
export function renderReport({
  model,
  effort,
  repeat,
  comparisons,
  skipped,
}: ReportInput): string {
  const totalCost = comparisons
    .flatMap((c) => c.runs)
    .reduce((sum, run) => sum + (run.costUsd ?? 0), 0);
  const out: string[] = [
    `# Scan replay: ${model}, effort ${effort}, ${repeat} runs per capture`,
    '',
    `Captures: ${comparisons.length} replayed, ${skipped.length} skipped. Estimated replay cost: ${usd(totalCost)}`,
  ];
  if (skipped.length) {
    out.push('', '## Skipped', '');
    for (const { name, reason } of skipped) out.push(`- ${name}: ${reason}`);
  }
  for (const comparison of comparisons) {
    out.push(
      '',
      `## ${comparison.name} (${comparison.schemaName})`,
      '',
      '| Run | Model | Lines | Matched | Input | Cached | Output | Reasoning | Cost | Latency |',
      '|---|---|---|---|---|---|---|---|---|---|',
      statsRow('recorded', comparison.recordedModel, comparison.recorded),
      ...comparison.runs.map((run) =>
        run.ok
          ? statsRow(String(run.run), model, run)
          : `| ${run.run} | ${model} | failed: ${run.error ?? 'unknown'} | - | - | - | - | - | - | ${seconds(run.durationMs)} |`,
      ),
    );
    for (const run of comparison.runs.filter((r) => r.ok)) {
      out.push('', `### Run ${run.run} vs recorded`, '');
      if (!run.changes.length) out.push('No differences.');
      for (const change of run.changes) {
        out.push(
          `- ${subject(change)}: ${change.recorded} -> ${change.replayed}`,
        );
      }
    }
    const okRuns = comparison.runs.filter((r) => r.ok).length;
    if (okRuns > 1) {
      out.push('', '### Repeatability', '');
      if (!comparison.disagreements.length) {
        out.push(`All ${okRuns} runs agree.`);
      }
      for (const disagreement of comparison.disagreements) {
        const values = disagreement.values
          .map(
            ({ value, runs }) =>
              `${value} in run${runs.length > 1 ? 's' : ''} ${runs.join(', ')}`,
          )
          .join('; ');
        out.push(`- ${subject(disagreement)}: ${values}`);
      }
    }
  }
  return `${out.join('\n')}\n`;
}

const subject = ({ item, field }: { item?: string; field: string }) =>
  item === undefined ? field : `${item}, ${field}`;

const count = (value: number | undefined) =>
  value === undefined ? '-' : String(value);

const usd = (value: number | undefined) =>
  value === undefined ? '-' : `$${value.toFixed(4)}`;

const seconds = (ms: number | undefined) =>
  ms === undefined ? '-' : `${(ms / 1000).toFixed(1)}s`;

function statsRow(run: string, model: string, stats: Stats): string {
  const { usage } = stats;
  return `| ${run} | ${model} | ${stats.lines} | ${stats.matched} | ${count(usage?.inputTokens)} | ${count(usage?.cachedInputTokens)} | ${count(usage?.outputTokens)} | ${count(usage?.reasoningTokens)} | ${usd(stats.costUsd)} | ${seconds(stats.durationMs)} |`;
}

type Price = { input: number; cachedInput: number; output: number };

/** USD per 1M tokens (OpenAI list prices, 2026-10). Reasoning tokens bill as output. */
const PRICES: Record<string, Price> = {
  'gpt-6-luna': { input: 0.1, cachedInput: 0.01, output: 0.5 },
  'gpt-4o-mini': { input: 0.15, cachedInput: 0.075, output: 0.6 },
};

/** Estimated cost of one call; `undefined` when the model's price or the usage is unknown. */
export function estimateCostUsd(
  model: string,
  usage: AiTokenUsage | undefined,
): number | undefined {
  const price = PRICES[model.replace(/-\d{4}-\d{2}-\d{2}$/, '')];
  if (!price || !usage) return undefined;
  const cached = usage.cachedInputTokens ?? 0;
  return (
    ((usage.inputTokens - cached) * price.input +
      cached * price.cachedInput +
      usage.outputTokens * price.output) /
    1_000_000
  );
}
