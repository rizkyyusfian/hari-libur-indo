import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const directDatabaseUrl = process.env.DATABASE_URL_UNPOOLED;
if (!directDatabaseUrl && process.argv.includes('migrate')) {
  throw new Error('DATABASE_URL_UNPOOLED is required for database migrations');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Schema generation does not connect. Migrations fail above instead of
    // silently falling back to an unintended local database.
    url: directDatabaseUrl ?? 'postgresql://schema:only@localhost:5432/schema',
  },
  strict: true,
  verbose: true,
});
