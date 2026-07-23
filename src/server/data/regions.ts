import 'server-only';

import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { regions } from '@/db/schema';
import { mapRegion } from './mappers';

export async function listRegions() {
  const rows = await getDb().select().from(regions).orderBy(asc(regions.name));
  return rows.map(mapRegion);
}
