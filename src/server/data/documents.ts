import 'server-only';

import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/db/client';
import { adminAuditLog, documents } from '@/db/schema';
import { AppError } from '@/domain/errors';
import { documentMetadataSchema } from '@/domain/validation';
import { mapDocument } from './mappers';
import { deleteObject } from '@/server/storage/r2';

const withRelations = { region: true, supersedes: true } as const;

export async function listDocuments(publicOnly = false, year?: number) {
  const predicates = [];
  if (publicOnly) {
    predicates.push(eq(documents.publicationStatus, 'published'));
    predicates.push(eq(documents.storageStatus, 'ready'));
  }
  if (year) predicates.push(eq(documents.year, year));
  const rows = await getDb().query.documents.findMany({
    where: predicates.length ? and(...predicates) : undefined,
    orderBy: (table, { desc, asc }) => [
      desc(table.year),
      asc(table.type),
      asc(table.publishedDate),
      asc(table.createdAt),
    ],
    with: withRelations,
  });
  return rows.map(mapDocument);
}

export async function findDocument(id: string) {
  const row = await getDb().query.documents.findFirst({
    where: eq(documents.id, id),
    with: withRelations,
  });
  return row ? mapDocument(row) : null;
}

export async function createDocument(input: unknown) {
  const parsed = documentMetadataSchema.parse(input);
  const requestId = randomUUID();
  const [created] = await getDb().transaction(async (tx) => {
    const rows = await tx
      .insert(documents)
      .values({
        title: parsed.title,
        year: parsed.year,
        type: parsed.type,
        regionId: parsed.region_id,
        kind: parsed.document_kind,
        publishedDate: parsed.published_date,
        summary: parsed.summary,
        supersedesDocumentId: parsed.supersedes_document_id,
        publicationStatus: 'draft',
        storageStatus: 'missing',
      })
      .returning();
    await tx.insert(adminAuditLog).values({
      action: 'document.create',
      entityType: 'document',
      entityId: rows[0].id,
      outcome: 'success',
      requestId,
    });
    return rows;
  });
  return findDocument(created.id);
}

export async function updateDocument(id: string, input: unknown) {
  const parsed = documentMetadataSchema.partial().parse(input);
  const requestId = randomUUID();
  const [updated] = await getDb()
    .update(documents)
    .set({
      title: parsed.title,
      year: parsed.year,
      type: parsed.type,
      regionId: parsed.region_id,
      kind: parsed.document_kind,
      publishedDate: parsed.published_date,
      summary: parsed.summary,
      supersedesDocumentId: parsed.supersedes_document_id,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning({ id: documents.id });
  if (!updated) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
  await getDb().insert(adminAuditLog).values({
    action: 'document.update',
    entityType: 'document',
    entityId: id,
    outcome: 'success',
    requestId,
  });
  return findDocument(id);
}

export async function publishDocument(id: string) {
  const current = await findDocument(id);
  if (!current) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
  if (current.storage_status !== 'ready') {
    throw new AppError('STORAGE_STATE', 'Unggah dan verifikasi PDF sebelum publikasi.');
  }
  const requestId = randomUUID();
  await getDb().transaction(async (tx) => {
    await tx
      .update(documents)
      .set({ publicationStatus: 'published', updatedAt: new Date() })
      .where(eq(documents.id, id));
    if (current.supersedes_document_id) {
      await tx
        .update(documents)
        .set({ publicationStatus: 'superseded', updatedAt: new Date() })
        .where(eq(documents.id, current.supersedes_document_id));
    }
    await tx.insert(adminAuditLog).values({
      action: 'document.publish',
      entityType: 'document',
      entityId: id,
      outcome: 'success',
      requestId,
    });
  });
}

export async function archiveDocument(id: string) {
  const requestId = randomUUID();
  await getDb().transaction(async (tx) => {
    const [updated] = await tx
      .update(documents)
      .set({ publicationStatus: 'archived', updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning({ id: documents.id });
    if (!updated) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
    await tx.insert(adminAuditLog).values({
      action: 'document.archive',
      entityType: 'document',
      entityId: id,
      outcome: 'success',
      requestId,
    });
  });
}

export async function deleteDocumentMetadata(id: string) {
  const current = await findDocument(id);
  if (!current) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
  if (current.object_key) {
    await getDb()
      .update(documents)
      .set({ storageStatus: 'deleting', updatedAt: new Date() })
      .where(eq(documents.id, id));
    try {
      await deleteObject(current.object_key);
    } catch {
      await getDb()
        .update(documents)
        .set({
          storageStatus: 'error',
          storageError: 'R2 gagal menghapus objek. Coba lagi.',
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id));
      throw new AppError('INFRASTRUCTURE', 'R2 gagal menghapus objek; metadata dipertahankan.');
    }
  }
  const requestId = randomUUID();
  await getDb().transaction(async (tx) => {
    const [deleted] = await tx
      .delete(documents)
      .where(eq(documents.id, id))
      .returning({ id: documents.id });
    if (!deleted) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
    await tx.insert(adminAuditLog).values({
      action: 'document.delete',
      entityType: 'document',
      entityId: id,
      outcome: 'success',
      requestId,
    });
  });
}
