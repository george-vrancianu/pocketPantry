// Voice Note replay: loads the case set, builds the production transcript-read request for
// each case, compares what a model read with the expected Voice Actions, and renders reports.
// See README.md next to this file.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { z } from 'zod';
import type { ScanLanguage } from '../../catalog/catalog.schemas';
import {
  voiceReadModelSchema,
  withIngredientIds,
} from '../../voice/voice-actions';
import { buildVoiceReadRequest } from '../../voice/voice-read-request';
import type { StructuredOutputRequest } from '../structured-output-ai.service';
import type { AiTokenUsage } from '../structured-output-ai.service';
import { estimateCostUsd, type Price, type ReplayRun } from './scan-replay';
import {
  catalogIn,
  catalogTextFor,
  seedVoiceCatalog,
  type VoiceCatalog,
} from './voice-catalog';
import {
  compareActions,
  normalizeActions,
  voiceCaseFileSchema,
  type ActionComparison,
  type CaseTag,
  type TranscriptComparison,
  type VoiceCase,
} from './voice-cases';

export type LoadedVoiceCase = VoiceCase & {
  /** `synthetic` cases are hand-written, not real Voice Notes. */
  source: 'synthetic' | 'recorded';
  /** The case file it came from. */
  file: string;
  /** Absolute path of the recording, when the case has one. */
  audioPath?: string;
};

const readJson = (path: string, label: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(
      `${label}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Loads every `*.json` file of `dir` (subfolders, such as the recordings, are ignored) and
 * pairs the cases with the seed Catalog, which every read is sent. A file that does not fit
 * the case format throws, naming it.
 */
export function loadVoiceCaseSet(
  dir: string,
  filter: { only?: string[]; language?: ScanLanguage } = {},
): { catalog: VoiceCatalog; cases: LoadedVoiceCase[] } {
  const root = resolve(dir);
  const files = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => e.name)
    .sort();
  const cases: LoadedVoiceCase[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const parsed = voiceCaseFileSchema.safeParse(
      readJson(join(root, file), file),
    );
    if (!parsed.success)
      throw new Error(`${file}: ${describeIssues(parsed.error)}`);
    for (const c of parsed.data.cases) {
      if (seen.has(c.id))
        throw new Error(`${file}: duplicate case id "${c.id}"`);
      seen.add(c.id);
      cases.push({
        ...c,
        source: parsed.data.source,
        file,
        ...(c.audio ? { audioPath: join(root, c.audio) } : {}),
      });
    }
  }
  return {
    catalog: seedVoiceCatalog(),
    cases: cases.filter(
      (c) =>
        (!filter.only || filter.only.includes(c.id)) &&
        (!filter.language || c.spokenLanguage === filter.language),
    ),
  };
}

const describeIssues = (error: z.ZodError) =>
  error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');

/** The transcript read, built exactly as production builds it. */
export function requestFor(
  c: LoadedVoiceCase,
  catalog: VoiceCatalog,
): StructuredOutputRequest {
  return buildVoiceReadRequest({
    catalogText: catalogTextFor(catalog, c.locale),
    shoppingNames: c.shoppingList,
    pantryNames: c.pantry,
    transcript: c.transcript,
    spokenLanguage: c.spokenLanguage,
    locale: c.locale,
    today: c.today,
    defaultTarget: c.defaultTarget,
  });
}

export type ReadRunResult = {
  caseId: string;
  spokenLanguage: ScanLanguage;
  tags: CaseTag[];
  source: LoadedVoiceCase['source'];
  run: number;
  ok: boolean;
  error?: string;
  comparison?: ActionComparison;
  usage?: AiTokenUsage;
  durationMs: number;
};

/** Compares one replayed read with the case's expected Voice Actions. */
export function evaluateReadRun(
  c: LoadedVoiceCase,
  catalog: VoiceCatalog,
  run: number,
  replay: ReplayRun,
  threshold: number,
): ReadRunResult {
  const base = {
    caseId: c.id,
    spokenLanguage: c.spokenLanguage,
    tags: c.tags,
    source: c.source,
    run,
    durationMs: replay.durationMs,
  };
  if (!replay.ok) return { ...base, ok: false, error: replay.error };
  const answer = voiceReadModelSchema.safeParse(replay.data);
  if (!answer.success) {
    return { ...base, ok: false, error: 'answer does not fit the schema' };
  }
  return {
    ...base,
    ok: true,
    usage: replay.usage,
    comparison: compareActions(c.expected, {
      // The answer names Ingredients by index into the Catalog text the read sent.
      actions: normalizeActions(
        withIngredientIds(answer.data, catalogIn(catalog, c.locale)),
        catalog,
        c.locale,
        threshold,
      ),
      unsupported: answer.data.unsupported,
    }),
  };
}

const usd = (value: number | undefined) =>
  value === undefined ? '-' : `$${value.toFixed(4)}`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
/** A failed run's time is a timeout or an early error: it says nothing about latency. */
const meanLatency = (runs: { ok: boolean; durationMs: number }[]) => {
  const done = runs.filter((r) => r.ok);
  return done.length
    ? seconds(sum(done.map((r) => r.durationMs)) / done.length)
    : '-';
};

export type ReadReportInput = {
  model: string;
  effort: string;
  repeat: number;
  results: ReadRunResult[];
  /** USD per 1M tokens, for a model the codebase has no list price for. */
  prices?: Price;
};

/** The read replay as Markdown: totals, per Spoken Language, per tag, then every miss. */
export function renderReadReport({
  model,
  effort,
  repeat,
  results,
  prices,
}: ReadReportInput): string {
  const passed = results.filter((r) => r.comparison?.passed).length;
  const failed = results.filter((r) => !r.ok);
  const costs = results.map((r) => estimateCostUsd(model, r.usage, prices));
  const known = costs.filter((c): c is number => c !== undefined);
  const totalCost = known.length ? sum(known) : undefined;
  const perRun = totalCost === undefined ? undefined : totalCost / known.length;
  const usage = results.flatMap((r) => (r.usage ? [r.usage] : []));
  const lines: string[] = [
    `# Voice Note read replay: ${model}, effort ${effort}, ${repeat} run(s) per case`,
    '',
    `Runs: ${results.length}, passed ${passed}, failed to answer ${failed.length}. A run passes when every expected Voice Action was read exactly, nothing extra was read, and the unsupported count matches.`,
    `Tokens: ${sum(usage.map((u) => u.inputTokens))} in (${sum(usage.map((u) => u.cachedInputTokens ?? 0))} cached), ${sum(usage.map((u) => u.outputTokens))} out (${sum(usage.map((u) => u.reasoningTokens ?? 0))} reasoning). Estimated cost: ${usd(totalCost)}${perRun === undefined ? '' : ` (${usd(perRun)} per run)`}. Mean latency (successful runs): ${meanLatency(results)}.`,
    'Matching is approximated on the seed Catalog (not a Family Catalog): a confident proposed Ingredient wins, else an exact name or Synonym hit on the fallback name or spoken text, as in the app. Dates are scored as the model read them (no sensibleDate clamp), and no Pantry or Shopping List state is resolved.',
  ];
  if (results.some((r) => r.source === 'synthetic')) {
    lines.push(
      '',
      'Some cases are synthetic transcripts, not real Voice Notes: they test the transcript read only, and say nothing about transcription or real speech.',
    );
  }

  const languages = [...new Set(results.map((r) => r.spokenLanguage))].sort();
  lines.push(
    '',
    '## By Spoken Language',
    '',
    '| Language | Runs | Passed | Actions matched | Mismatched | Missing | Extra |',
    '|---|---|---|---|---|---|---|',
  );
  for (const language of languages) {
    const rows = results.filter((r) => r.spokenLanguage === language);
    const c = rows.flatMap((r) => (r.comparison ? [r.comparison] : []));
    lines.push(
      `| ${language} | ${rows.length} | ${c.filter((x) => x.passed).length} | ${sum(c.map((x) => x.matched))} | ${sum(c.map((x) => x.mismatched.length))} | ${sum(c.map((x) => x.missing.length))} | ${sum(c.map((x) => x.extra.length))} |`,
    );
  }

  const tags = [...new Set(results.flatMap((r) => r.tags))].sort();
  lines.push('', '## By tag', '', '| Tag | Runs | Passed |', '|---|---|---|');
  for (const tag of tags) {
    const rows = results.filter((r) => r.tags.includes(tag));
    lines.push(
      `| ${tag} | ${rows.length} | ${rows.filter((r) => r.comparison?.passed).length} |`,
    );
  }

  const misses = results.filter((r) => !r.comparison?.passed);
  lines.push('', '## Misses', '');
  if (!misses.length) lines.push('None.');
  for (const r of misses) {
    lines.push(`### ${r.caseId} (run ${r.run})`, '');
    if (!r.comparison) {
      lines.push(`- failed: ${r.error ?? 'unknown'}`, '');
      continue;
    }
    const c = r.comparison;
    for (const m of c.mismatched) {
      lines.push(
        `- ${label(m.expected)}: ${m.diffs.map((d) => `${d.field}: expected ${show(d.expected)}, got ${show(d.actual)}`).join('; ')}`,
      );
    }
    for (const e of c.missing) lines.push(`- ${label(e)}: not read`);
    for (const a of c.extra) lines.push(`- ${label(a)}: read but not expected`);
    if (c.unsupported.expected !== c.unsupported.actual) {
      lines.push(
        `- unsupported phrases: expected ${c.unsupported.expected}, got ${c.unsupported.actual}`,
      );
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

const show = (value: unknown) =>
  value === null || value === undefined
    ? 'none'
    : typeof value === 'string'
      ? value
      : JSON.stringify(value);
const label = (a: {
  target: string | null;
  op: string;
  ingredient: string | string[];
}) =>
  `${a.target ?? 'no list'} ${a.op} ${Array.isArray(a.ingredient) ? a.ingredient.join('/') : a.ingredient}`;

export type TranscriptionRunResult = {
  caseId: string;
  spokenLanguage: ScanLanguage;
  ok: boolean;
  error?: string;
  /** What the provider heard. */
  transcript?: string;
  /** The transcript typed in the case. */
  expected?: string;
  comparison?: TranscriptComparison;
  durationMs: number;
};

/** The transcription replay as Markdown. Quotes transcripts of real recordings: keep it local. */
export function renderTranscriptionReport({
  model,
  results,
}: {
  model: string;
  results: TranscriptionRunResult[];
}): string {
  const ok = results.filter((r) => r.comparison);
  const errors = sum(ok.map((r) => r.comparison!.wordErrors));
  const words = sum(ok.map((r) => r.comparison!.words));
  const wer = (e: number, w: number) => (w ? (e / w).toFixed(2) : '-');
  const lines = [
    `# Voice Note transcription replay: ${model}`,
    '',
    `Replayed: ${results.length}, failed ${results.length - ok.length}, exact ${ok.filter((r) => r.comparison!.exact).length}. Word error rate: ${wer(errors, words)} (${errors} word errors in ${words} words). Mean latency (successful runs): ${meanLatency(results)}. Transcription is billed per audio, not per token: cost is not estimated here.`,
    '',
    '## By Spoken Language',
    '',
    '| Language | Replayed | Word errors | WER |',
    '|---|---|---|---|',
  ];
  for (const language of [
    ...new Set(results.map((r) => r.spokenLanguage)),
  ].sort()) {
    const rows = ok.filter((r) => r.spokenLanguage === language);
    const e = sum(rows.map((r) => r.comparison!.wordErrors));
    lines.push(
      `| ${language} | ${rows.length} | ${e} | ${wer(e, sum(rows.map((r) => r.comparison!.words)))} |`,
    );
  }
  lines.push('', '## Cases', '');
  for (const r of results) {
    if (!r.comparison) {
      lines.push(
        `- ${r.caseId}: failed: ${r.error ?? 'unknown'} (${seconds(r.durationMs)})`,
      );
      continue;
    }
    lines.push(
      `- ${r.caseId} (${seconds(r.durationMs)}, ${r.comparison.wordErrors}/${r.comparison.words} word errors): ${
        r.comparison.exact
          ? 'exact'
          : `heard ${JSON.stringify(r.transcript)}, expected ${JSON.stringify(r.expected)}`
      }`,
    );
  }
  return `${lines.join('\n')}\n`;
}
