#!/usr/bin/env node
// Fails when Drizzle migrations are inconsistent: duplicate numeric prefixes,
// or drizzle/meta/_journal.json not matching the .sql files one-to-one.
// Usage: node scripts/check-migrations.mjs [migrations-dir]
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(process.argv[2] ?? join(root, 'apps/api/drizzle'));

const prefixOf = (name) => /^(\d+)_/.exec(name)?.[1];
const errors = [];

const sqlTags = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => f.slice(0, -'.sql'.length))
  .sort();

const byPrefix = new Map();
for (const tag of sqlTags) {
  const prefix = prefixOf(tag);
  if (prefix === undefined) {
    errors.push(`${tag}.sql has no numeric prefix`);
    continue;
  }
  const key = Number(prefix);
  byPrefix.set(key, [...(byPrefix.get(key) ?? []), tag]);
}
for (const [prefix, tags] of byPrefix) {
  if (tags.length > 1) {
    errors.push(
      `Duplicate migration number ${String(prefix).padStart(4, '0')}: ${tags.join(', ')}`,
    );
  }
}

let entries;
let journalReadable = false;
try {
  entries = JSON.parse(
    readFileSync(join(dir, 'meta', '_journal.json'), 'utf8'),
  ).entries;
  journalReadable = true;
} catch (e) {
  errors.push(`Cannot read meta/_journal.json: ${e.message}`);
}

if (journalReadable && !Array.isArray(entries)) {
  errors.push('meta/_journal.json has no "entries" array');
} else if (Array.isArray(entries)) {
  const journalTags = new Set(entries.map((e) => e.tag));
  for (const tag of sqlTags) {
    if (!journalTags.has(tag))
      errors.push(`${tag}.sql is not in meta/_journal.json`);
  }
  const sqlSet = new Set(sqlTags);
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.tag)) errors.push(`Journal lists ${e.tag} more than once`);
    seen.add(e.tag);
    if (!sqlSet.has(e.tag))
      errors.push(`Journal entry ${e.tag} has no matching .sql file`);
    const prefix = prefixOf(e.tag);
    if (prefix !== undefined && Number(prefix) !== e.idx) {
      errors.push(`Journal idx ${e.idx} does not match the prefix of ${e.tag}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Migration check failed in ${dir}:`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}
console.log(`Migration check passed: ${sqlTags.length} migrations in ${dir}`);
