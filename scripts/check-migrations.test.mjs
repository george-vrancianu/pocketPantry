import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  'check-migrations.mjs',
);

function makeDir({ sql, journal }) {
  const dir = mkdtempSync(join(tmpdir(), 'check-migrations-'));
  mkdirSync(join(dir, 'meta'));
  for (const name of sql) writeFileSync(join(dir, `${name}.sql`), '-- sql\n');
  const entries = journal.map((tag, idx) => ({ idx, tag }));
  writeFileSync(
    join(dir, 'meta', '_journal.json'),
    JSON.stringify({ entries }),
  );
  return dir;
}

function run(dirOptions) {
  const dir = makeDir(dirOptions);
  try {
    const r = spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
    return { status: r.status, output: r.stdout + r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('passes when SQL files and journal match one-to-one', () => {
  const r = run({
    sql: ['0000_init', '0001_family'],
    journal: ['0000_init', '0001_family'],
  });
  assert.equal(r.status, 0, r.output);
});

test('fails when two SQL files share a numeric prefix', () => {
  const r = run({
    sql: ['0000_init', '0001_family', '0001_other'],
    journal: ['0000_init', '0001_family', '0001_other'],
  });
  assert.equal(r.status, 1);
  assert.match(r.output, /duplicate.*0001/i);
});

test('fails when a SQL file is missing from the journal', () => {
  const r = run({ sql: ['0000_init', '0001_family'], journal: ['0000_init'] });
  assert.equal(r.status, 1);
  assert.match(r.output, /0001_family.*not in.*journal/i);
});

test('fails when a journal entry has no SQL file', () => {
  const r = run({ sql: ['0000_init'], journal: ['0000_init', '0001_family'] });
  assert.equal(r.status, 1);
  assert.match(r.output, /0001_family.*no matching.*sql/i);
});

test('fails when a journal idx does not match the tag prefix', () => {
  const dir = makeDir({
    sql: ['0000_init', '0001_family'],
    journal: ['0000_init', '0001_family'],
  });
  try {
    writeFileSync(
      join(dir, 'meta', '_journal.json'),
      JSON.stringify({
        entries: [
          { idx: 0, tag: '0000_init' },
          { idx: 5, tag: '0001_family' },
        ],
      }),
    );
    const r = spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /idx 5.*0001_family/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('fails when the journal has no entries array', () => {
  const dir = makeDir({ sql: ['0000_init'], journal: ['0000_init'] });
  try {
    writeFileSync(join(dir, 'meta', '_journal.json'), '{}');
    const r = spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stdout + r.stderr, /entries/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('fails when the journal lists a tag twice', () => {
  const r = run({ sql: ['0000_init'], journal: ['0000_init', '0000_init'] });
  assert.equal(r.status, 1);
  assert.match(r.output, /0000_init more than once/);
});

test('fails when a SQL file has no numeric prefix', () => {
  const r = run({ sql: ['0000_init', 'oops'], journal: ['0000_init', 'oops'] });
  assert.equal(r.status, 1);
  assert.match(r.output, /oops\.sql has no numeric prefix/);
});
