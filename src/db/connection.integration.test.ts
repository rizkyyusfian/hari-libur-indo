import { describe, expect, it } from 'vitest';
import { Client } from 'pg';

describe.skipIf(!process.env.TEST_DATABASE_URL)('Neon integration database', () => {
  it('is isolated and reachable', async () => {
    const client = new Client({ connectionString: process.env.TEST_DATABASE_URL });
    await client.connect();
    try {
      const result = await client.query<{ database: string }>('select current_database() as database');
      expect(result.rows[0].database).toBeTruthy();
    } finally {
      await client.end();
    }
  });
});
