import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  readAiUsage,
  type AiTokenUsage,
  type StructuredOutputRequest,
} from '../structured-output-ai.service';
import { INGREDIENTS_SCAN_SCHEMA_NAME } from '../../scan/ingredients-scan.schemas';
import {
  PLATE_DISHES_SCHEMA_NAME,
  PLATE_INGREDIENTS_SCHEMA_NAME,
} from '../../scan/plate-scan.schemas';
import { PRODUCT_SCAN_SCHEMA_NAME } from '../../scan/product-scan.schemas';
import { RECEIPT_SCAN_SCHEMA_NAME } from '../../scan/receipt-scan.schemas';

/** One debug capture (a folder written under `SCAN_DEBUG_DIR`), ready to resend. */
export type DebugCapture = {
  name: string;
  request: StructuredOutputRequest;
  recorded: {
    model: string;
    durationMs?: number;
    data: unknown;
    usage?: AiTokenUsage;
  };
};

export type SkippedDebugCapture = { name: string; reason: string };

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
 * Reads every debug capture folder in `root`, in name (= time) order. A folder that recorded
 * an error, lost a photo, or is not a debug capture at all is skipped and listed, never fatal.
 */
export async function loadDebugCaptures(
  root: string,
  { only }: { only?: string[] } = {},
): Promise<{ debugCaptures: DebugCapture[]; skipped: SkippedDebugCapture[] }> {
  const entries = await readdir(root, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !only || only.includes(name))
    .sort();
  const debugCaptures: DebugCapture[] = [];
  const skipped: SkippedDebugCapture[] = [];
  for (const name of names) {
    const result = await loadDebugCapture(join(root, name), name);
    if ('reason' in result) skipped.push(result);
    else debugCaptures.push(result);
  }
  return { debugCaptures, skipped };
}

async function loadDebugCapture(
  dir: string,
  name: string,
): Promise<DebugCapture | SkippedDebugCapture> {
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

/** One replay of a debug capture: the answer, or the error the service threw. */
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

type AnswerStats = {
  lines: number;
  matched: number;
  usage?: AiTokenUsage;
  costUsd?: number;
  durationMs?: number;
};

export type RunComparison = AnswerStats & {
  run: number;
  ok: boolean;
  error?: string;
  changes: Change[];
};

export type DebugCaptureComparison = {
  name: string;
  schemaName: string;
  recordedModel: string;
  recorded: AnswerStats;
  runs: RunComparison[];
  disagreements: Disagreement[];
};

/**
 * One line of an answer. `key` pairs it with the same line in another answer: exactly, or
 * (`fuzzy`) by similar text, since a model reads the same receipt line slightly differently.
 */
type AnswerLine = {
  key: string;
  fuzzy: boolean;
  label: string;
  fields: Record<string, string>;
};

/** What the report compares in an answer: top-level fields and its lines. */
type Answer = {
  fields: Record<string, string>;
  lines: AnswerLine[];
  matched: number;
};

/** An answer whose lines are keyed by the line they pair with across all answers of a debug capture. */
type AlignedAnswer = {
  fields: Record<string, string>;
  lines: Map<string, { label: string; fields: Record<string, string> }>;
  matched: number;
};

/** Below this, two receipt lines are different lines (Dice similarity of their text). */
const SAME_LINE = 0.6;

const FOUND = 'found';
const MISSING = 'missing';

/** Compares each replay with the recorded answer, and the replays with each other. */
export function compareDebugCapture(
  debugCapture: DebugCapture,
  model: string,
  runs: ReplayRun[],
): DebugCaptureComparison {
  const catalog = catalogNames(debugCapture.request.prompt);
  const answerOf = (data: unknown) =>
    readAnswer(debugCapture.request.schemaName, data, catalog);
  const okRuns = runs.flatMap((run, index) =>
    run.ok ? [{ index, answer: answerOf(run.data) }] : [],
  );
  const [recorded, ...alignedRuns] = align([
    answerOf(debugCapture.recorded.data),
    ...okRuns.map((run) => run.answer),
  ]);
  const byRun: (AlignedAnswer | undefined)[] = runs.map(() => undefined);
  okRuns.forEach(({ index }, n) => (byRun[index] = alignedRuns[n]));

  return {
    name: debugCapture.name,
    schemaName: debugCapture.request.schemaName,
    recordedModel: debugCapture.recorded.model,
    recorded: {
      lines: recorded.lines.size,
      matched: recorded.matched,
      usage: debugCapture.recorded.usage,
      costUsd: estimateCostUsd(
        debugCapture.recorded.model,
        debugCapture.recorded.usage,
      ),
      durationMs: debugCapture.recorded.durationMs,
    },
    runs: runs.map((run, index): RunComparison => {
      const answer = byRun[index];
      if (!run.ok || !answer) {
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
        lines: answer.lines.size,
        matched: answer.matched,
        usage: run.usage,
        costUsd: estimateCostUsd(model, run.usage),
        durationMs: run.durationMs,
        changes: diffAnswers(recorded, answer),
      };
    }),
    disagreements: disagreements(
      byRun.flatMap((answer, index) =>
        answer ? [{ run: index + 1, answer }] : [],
      ),
    ),
  };
}

/** Fields and lines the successful runs disagree on; none with fewer than two. */
function disagreements(
  runs: { run: number; answer: AlignedAnswer }[],
): Disagreement[] {
  if (runs.length < 2) return [];
  const result: Disagreement[] = [];
  const compare = (
    item: string | undefined,
    field: string,
    valueOf: (answer: AlignedAnswer) => string | undefined,
  ) => {
    const values: Disagreement['values'] = [];
    for (const { run, answer } of runs) {
      const value = valueOf(answer);
      if (value === undefined) continue;
      const seen = values.find((entry) => entry.value === value);
      if (seen) seen.runs.push(run);
      else values.push({ value, runs: [run] });
    }
    if (values.length > 1) {
      result.push({ ...(item === undefined ? {} : { item }), field, values });
    }
  };

  const fields = new Set(
    runs.flatMap(({ answer }) => Object.keys(answer.fields)),
  );
  for (const field of fields) {
    compare(undefined, field, (answer) => answer.fields[field] ?? MISSING);
  }
  const lineFields = new Map<string, { label: string; fields: Set<string> }>();
  for (const { answer } of runs) {
    for (const [key, item] of answer.lines) {
      const entry = lineFields.get(key) ?? {
        label: item.label,
        fields: new Set(),
      };
      Object.keys(item.fields).forEach((field) => entry.fields.add(field));
      lineFields.set(key, entry);
    }
  }
  for (const [key, { label, fields: itemFields }] of lineFields) {
    compare(label, 'line', (answer) =>
      answer.lines.has(key) ? FOUND : MISSING,
    );
    for (const field of itemFields) {
      compare(label, field, (answer) => answer.lines.get(key)?.fields[field]);
    }
  }
  return result;
}

function diffAnswers(
  recorded: AlignedAnswer,
  replayed: AlignedAnswer,
): Change[] {
  const changes: Change[] = diffFields(
    recorded.fields,
    replayed.fields,
    undefined,
  );
  for (const [key, item] of recorded.lines) {
    const other = replayed.lines.get(key);
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
  for (const [key, item] of replayed.lines) {
    if (!recorded.lines.has(key)) {
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

type RawLine = Record<string, unknown>;

/** A raw answer value as report text: strings as is, anything else as JSON, null as `-`. */
const displayValue = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : (JSON.stringify(value ?? null) ?? '-').replace(/^null$/, '-');

/**
 * Keys every answer's lines so a line pairs with the same line in the other answers: each
 * line joins the most similar unclaimed line seen so far, or starts a new one.
 */
function align(answers: Answer[]): AlignedAnswer[] {
  const seenLines: { line: AnswerLine; id: string }[] = [];
  return answers.map((answer) => {
    const pairings: { line: number; seenLine: number; score: number }[] = [];
    answer.lines.forEach((item, line) =>
      seenLines.forEach((seen, seenLine) => {
        const score = similarity(item, seen.line);
        if (score >= SAME_LINE) pairings.push({ line, seenLine, score });
      }),
    );
    pairings.sort((a, b) => b.score - a.score);
    const ids: (string | undefined)[] = answer.lines.map(() => undefined);
    const claimed = new Set<number>();
    for (const { line, seenLine } of pairings) {
      if (ids[line] !== undefined || claimed.has(seenLine)) continue;
      ids[line] = seenLines[seenLine].id;
      claimed.add(seenLine);
    }
    const lines: AlignedAnswer['lines'] = new Map();
    answer.lines.forEach((item, line) => {
      let id = ids[line];
      let label = item.label;
      if (id === undefined) {
        id = String(seenLines.length);
        seenLines.push({ line: item, id });
      } else {
        label = seenLines[Number(id)].line.label;
      }
      lines.set(id, { label, fields: item.fields });
    });
    return { fields: answer.fields, lines, matched: answer.matched };
  });
}

function similarity(a: AnswerLine, b: AnswerLine): number {
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
  const answer = (data ?? {}) as RawLine;
  const ingredient = (line: RawLine): string => {
    const id = line.matchedIngredientId;
    if (typeof id === 'string') return catalog.get(id.toLowerCase()) ?? id;
    return `unmatched (${displayValue(line.fallbackIngredientName)})`;
  };
  const isMatched = (line: RawLine) =>
    typeof line.matchedIngredientId === 'string';
  const linesOf = (value: unknown): RawLine[] =>
    Array.isArray(value) ? (value as RawLine[]) : [];

  switch (schemaName) {
    case RECEIPT_SCAN_SCHEMA_NAME: {
      const lines = linesOf(answer.lines);
      return {
        fields: {
          merchant: displayValue(answer.merchantName),
          purchaseDate: displayValue(answer.purchaseDate),
        },
        lines: lines.map((line) => ({
          key: normalize(displayValue(line.sourceText)),
          fuzzy: true,
          label: displayValue(line.sourceText),
          fields: {
            type: `${displayValue(line.lineType)}${line.includeInPantry === false ? ' (excluded)' : ''}`,
            ingredient: ingredient(line),
            quantity: receiptQuantity(line),
          },
        })),
        matched: lines.filter(isMatched).length,
      };
    }
    case PRODUCT_SCAN_SCHEMA_NAME:
      return {
        fields: {
          ingredient: ingredient(answer),
          expiryDate: displayValue(answer.expiryDate),
        },
        lines: [],
        matched: isMatched(answer) ? 1 : 0,
      };
    case INGREDIENTS_SCAN_SCHEMA_NAME:
    case PLATE_INGREDIENTS_SCHEMA_NAME: {
      const lines = linesOf(answer.items);
      return {
        fields: {},
        lines: lines.map((line): AnswerLine => ({
          key: normalize(ingredient(line)),
          fuzzy: false,
          label: ingredient(line),
          fields:
            schemaName === PLATE_INGREDIENTS_SCHEMA_NAME
              ? {
                  quantity: `${displayValue(line.quantity)}${line.unit ? ` ${displayValue(line.unit).toLowerCase()}` : ''} (${displayValue(line.quantityType)})`,
                }
              : {},
        })),
        matched: lines.filter(isMatched).length,
      };
    }
    case PLATE_DISHES_SCHEMA_NAME:
      return {
        fields: {},
        lines: linesOf(answer.matches).map((line) => ({
          key: normalize(displayValue(line.title)),
          fuzzy: false,
          label: displayValue(line.title),
          fields: {},
        })),
        matched: 0,
      };
    default:
      return {
        fields: { answer: JSON.stringify(data) },
        lines: [],
        matched: 0,
      };
  }
}

function receiptQuantity(line: RawLine): string {
  const perItem =
    line.quantityPerItem === null || line.quantityPerItem === undefined
      ? ''
      : ` x ${displayValue(line.quantityPerItem)}${line.quantityUnit ? ` ${displayValue(line.quantityUnit).toLowerCase()}` : ''}`;
  return `${displayValue(line.purchasedCount)}${perItem} (${displayValue(line.quantityType)})`;
}

/** Case, spacing and decimal commas are reading noise, not a different line. */
const normalize = (value: string) =>
  value.toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim();

export type ReportInput = {
  model: string;
  effort: string;
  repeat: number;
  comparisons: DebugCaptureComparison[];
  skipped: SkippedDebugCapture[];
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
    `# Scan replay: ${model}, effort ${effort}, ${repeat} runs per debug capture`,
    '',
    `Debug captures: ${comparisons.length} replayed, ${skipped.length} skipped. Estimated replay cost: ${usd(totalCost)}`,
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

function statsRow(run: string, model: string, stats: AnswerStats): string {
  const { usage } = stats;
  return `| ${run} | ${model} | ${stats.lines} | ${stats.matched} | ${count(usage?.inputTokens)} | ${count(usage?.cachedInputTokens)} | ${count(usage?.outputTokens)} | ${count(usage?.reasoningTokens)} | ${usd(stats.costUsd)} | ${seconds(stats.durationMs)} |`;
}

export type Price = { input: number; cachedInput: number; output: number };

/** USD per 1M tokens (OpenAI list prices, 2026-10). Reasoning tokens bill as output. */
const PRICES: Record<string, Price> = {
  'gpt-6-luna': { input: 0.1, cachedInput: 0.01, output: 0.5 },
  'gpt-4o-mini': { input: 0.15, cachedInput: 0.075, output: 0.6 },
};

/** Estimated cost of one call; `undefined` when the model's price or the usage is unknown. */
export function estimateCostUsd(
  model: string,
  usage: AiTokenUsage | undefined,
  /** A price given by the developer; wins over the list for models not priced here. */
  given?: Price,
): number | undefined {
  const price = given ?? PRICES[model.replace(/-\d{4}-\d{2}-\d{2}$/, '')];
  if (!price || !usage) return undefined;
  const cached = usage.cachedInputTokens ?? 0;
  return (
    ((usage.inputTokens - cached) * price.input +
      cached * price.cachedInput +
      usage.outputTokens * price.output) /
    1_000_000
  );
}
