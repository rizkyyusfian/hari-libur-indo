import 'server-only';

import { and, eq, gte, ilike, isNull, lte, ne } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { adminAuditLog, holidayDocuments, holidays } from '@/db/schema';
import { AppError } from '@/domain/errors';
import { holidayInputSchema, type HolidayInput } from '@/domain/validation';
import { mapHoliday } from './mappers';

export async function listHolidays(year?: number) {
  const where = year
    ? and(
        gte(holidays.holidayDate, `${year}-01-01`),
        lte(holidays.holidayDate, `${year}-12-31`),
      )
    : undefined;
  const rows = await getDb().query.holidays.findMany({
    where,
    orderBy: (table, { asc }) => [asc(table.holidayDate), asc(table.name)],
    with: {
      region: true,
      documentLinks: {
        with: {
          document: {
            with: { region: true, supersedes: true },
          },
        },
      },
    },
  });
  return rows.map(mapHoliday);
}

export async function findHoliday(id: string) {
  const row = await getDb().query.holidays.findFirst({
    where: eq(holidays.id, id),
    with: {
      region: true,
      documentLinks: {
        with: { document: { with: { region: true, supersedes: true } } },
      },
    },
  });
  return row ? mapHoliday(row) : null;
}

async function assertNoDuplicate(input: HolidayInput, excludingId?: string) {
  const conditions = [
    eq(holidays.holidayDate, input.date),
    ilike(holidays.name, input.name),
    eq(holidays.type, input.type),
    input.region_id ? eq(holidays.regionId, input.region_id) : isNull(holidays.regionId),
  ];
  if (excludingId) conditions.push(ne(holidays.id, excludingId));
  const [duplicate] = await getDb().select({ id: holidays.id }).from(holidays).where(and(...conditions)).limit(1);
  if (duplicate) throw new AppError('CONFLICT', 'Hari libur dengan tanggal dan nama yang sama sudah ada.');
}

export async function createHoliday(input: unknown) {
  const parsed = holidayInputSchema.parse(input);
  await assertNoDuplicate(parsed);
  const requestId = randomUUID();
  const createdId = await getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(holidays)
      .values({
        holidayDate: parsed.date,
        name: parsed.name,
        type: parsed.type,
        regionId: parsed.region_id,
        description: parsed.description,
        isCutiBersama: parsed.is_cuti_bersama,
      })
      .returning({ id: holidays.id });
    if (parsed.document_ids.length) {
      await tx.insert(holidayDocuments).values(
        [...new Set(parsed.document_ids)].map((documentId) => ({
          holidayId: created.id,
          documentId,
          relationType: 'source' as const,
        })),
      );
    }
    await tx.insert(adminAuditLog).values({
      action: 'holiday.create',
      entityType: 'holiday',
      entityId: created.id,
      outcome: 'success',
      requestId,
    });
    return created.id;
  });
  return findHoliday(createdId);
}

export async function updateHoliday(id: string, input: unknown) {
  const parsed = holidayInputSchema.parse(input);
  await assertNoDuplicate(parsed, id);
  const requestId = randomUUID();
  await getDb().transaction(async (tx) => {
    const where = parsed.updated_at
      ? and(eq(holidays.id, id), eq(holidays.updatedAt, new Date(parsed.updated_at)))
      : eq(holidays.id, id);
    const updated = await tx
      .update(holidays)
      .set({
        holidayDate: parsed.date,
        name: parsed.name,
        type: parsed.type,
        regionId: parsed.region_id,
        description: parsed.description,
        isCutiBersama: parsed.is_cuti_bersama,
        updatedAt: new Date(),
      })
      .where(where)
      .returning({ id: holidays.id });
    if (!updated.length) {
      throw new AppError('CONFLICT', 'Data telah berubah. Muat ulang sebelum menyimpan.');
    }
    await tx.delete(holidayDocuments).where(eq(holidayDocuments.holidayId, id));
    if (parsed.document_ids.length) {
      await tx.insert(holidayDocuments).values(
        [...new Set(parsed.document_ids)].map((documentId) => ({
          holidayId: id,
          documentId,
          relationType: 'source' as const,
        })),
      );
    }
    await tx.insert(adminAuditLog).values({
      action: 'holiday.update',
      entityType: 'holiday',
      entityId: id,
      outcome: 'success',
      requestId,
    });
  });
  return findHoliday(id);
}

export async function deleteHoliday(id: string) {
  const requestId = randomUUID();
  await getDb().transaction(async (tx) => {
    const deleted = await tx.delete(holidays).where(eq(holidays.id, id)).returning({ id: holidays.id });
    if (!deleted.length) throw new AppError('NOT_FOUND', 'Hari libur tidak ditemukan.');
    await tx.insert(adminAuditLog).values({
      action: 'holiday.delete',
      entityType: 'holiday',
      entityId: id,
      outcome: 'success',
      requestId,
    });
  });
}

export async function createHolidayBatch(input: unknown) {
  const rows = holidayInputSchema.array().min(1).max(500).parse(input);
  const batchKeys = new Set<string>();
  for (const row of rows) {
    const key = `${row.date}\0${row.name.toLocaleLowerCase('id-ID')}\0${row.type}\0${row.region_id ?? ''}`;
    if (batchKeys.has(key)) {
      throw new AppError('VALIDATION', `Batch memuat duplikat: ${row.date} — ${row.name}.`);
    }
    batchKeys.add(key);
    await assertNoDuplicate(row);
  }
  const requestId = randomUUID();
  return getDb().transaction(async (tx) => {
    const created = [];
    for (const row of rows) {
      const [holiday] = await tx
        .insert(holidays)
        .values({
          holidayDate: row.date,
          name: row.name,
          type: row.type,
          regionId: row.region_id,
          description: row.description,
          isCutiBersama: row.is_cuti_bersama,
        })
        .returning({ id: holidays.id });
      created.push(holiday.id);
    }
    await tx.insert(adminAuditLog).values({
      action: 'holiday.batch-create',
      entityType: 'holiday',
      outcome: 'success',
      requestId,
      details: { count: created.length },
    });
    return { count: created.length };
  });
}
