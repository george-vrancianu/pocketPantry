// Runs before any test module is imported: AppModule validates env at import time.
process.env.NODE_ENV = 'test';
// Each Jest worker gets its own database, cloned in global-setup.mjs.
const testDatabaseUrl = new URL(
  process.env.TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5433/pocket_pantry_test',
);
testDatabaseUrl.pathname = `/${process.env.TEST_DB_PREFIX}_w${process.env.JEST_WORKER_ID}`;
process.env.DATABASE_URL = testDatabaseUrl.toString();
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.BETTER_AUTH_SECRET =
  'test-secret-that-is-at-least-32-characters-long';
// Small enough for the Scan Cap tests to reach it in a few requests.
process.env.SCAN_DAILY_CAP = '3';
process.env.SCAN_MATCH_CONFIDENCE_THRESHOLD = '0.6';
process.env.ADMIN_EMAILS = 'Chef.Admin@example.com, second-admin@example.com';
