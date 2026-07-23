import 'server-only';

import { attachDatabasePool } from '@vercel/functions';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { getDatabaseUrl } from '@/server/env';

type Database = NodePgDatabase<typeof schema>;

const globalDatabase = globalThis as typeof globalThis & {
  hariLiburPool?: Pool;
  hariLiburDb?: Database;
};

function getPool(): Pool {
  if (!globalDatabase.hariLiburPool) {
    globalDatabase.hariLiburPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    attachDatabasePool(globalDatabase.hariLiburPool);
  }
  return globalDatabase.hariLiburPool;
}

export function getDb(): Database {
  if (!globalDatabase.hariLiburDb) {
    globalDatabase.hariLiburDb = drizzle(getPool(), { schema });
  }
  return globalDatabase.hariLiburDb;
}
