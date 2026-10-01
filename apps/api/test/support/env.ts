// Runs before any test module is imported: AppModule validates env at import time.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5433/pocket_pantry_test';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.BETTER_AUTH_SECRET =
  'test-secret-that-is-at-least-32-characters-long';
// Small enough for the Scan Cap tests to reach it in a few requests.
process.env.SCAN_DAILY_CAP = '3';
process.env.SCAN_MATCH_CONFIDENCE_THRESHOLD = '0.6';
