import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile(resolve(process.cwd(), '../../.env'));
} catch {
  // No root .env: rely on the environment (CI, containers).
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for Drizzle commands');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
