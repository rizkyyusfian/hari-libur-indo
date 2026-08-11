import 'server-only';

import { unstable_cache } from 'next/cache';
import { listDocuments } from '@/server/data/documents';
import { listHolidays } from '@/server/data/holidays';

const PUBLIC_REVALIDATE_SECONDS = 3600;

function getCachedPublicSnapshot(year?: number) {
  const cacheKey = year === undefined ? 'all' : String(year);

  return unstable_cache(
    async () => {
      const [holidays, documents] = await Promise.all([
        listHolidays(year),
        listDocuments(true, year),
      ]);

      return { holidays, documents };
    },
    ['public-year-snapshot', cacheKey],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [`public-year-${cacheKey}`],
    },
  )();
}

export function getPublicYearSnapshot(year: number) {
  return getCachedPublicSnapshot(year);
}

export function getPublicSnapshot(year?: number) {
  return getCachedPublicSnapshot(year);
}
