// Shared by global setup/teardown: names and URLs of the per-run databases.
export const baseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5433/pocket_pantry_test';

export function urlFor(database) {
  const url = new URL(baseUrl);
  url.pathname = `/${database}`;
  return url.toString();
}

export function workerDatabases(prefix, maxWorkers) {
  return Array.from({ length: maxWorkers }, (_, i) => `${prefix}_w${i + 1}`);
}
