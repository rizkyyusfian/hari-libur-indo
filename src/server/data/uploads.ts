import 'server-only';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { documents } from '@/db/schema';
import { AppError } from '@/domain/errors';
import { createPresignedPdfPut, deleteObject, inspectObject } from '@/server/storage/r2';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function authorizeDocumentUpload(
  documentId: string,
  input: { filename?: unknown; contentType?: unknown; size?: unknown },
) {
  const filename = typeof input.filename === 'string' ? input.filename.trim() : '';
  const contentType = input.contentType;
  const size = Number(input.size);
  if (!filename || contentType !== 'application/pdf' || !Number.isInteger(size) || size <= 0 || size > MAX_PDF_BYTES) {
    throw new AppError('VALIDATION', 'PDF wajib valid dan berukuran maksimal 10 MiB.');
  }
  const [document] = await getDb()
    .select({ id: documents.id, year: documents.year })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!document) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');

  const objectKey = `documents/${document.year}/${document.id}/${randomUUID()}.pdf`;
  await getDb()
    .update(documents)
    .set({
      storageStatus: 'pending',
      objectKey,
      originalFilename: filename,
      mimeType: null,
      byteSize: null,
      etag: null,
      uploadedAt: null,
      storageError: null,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));

  return {
    uploadUrl: await createPresignedPdfPut(objectKey),
    headers: { 'Content-Type': 'application/pdf' },
    expiresIn: 300,
  };
}

export async function finalizeDocumentUpload(documentId: string) {
  const [document] = await getDb()
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!document) throw new AppError('NOT_FOUND', 'Dokumen tidak ditemukan.');
  if (document.storageStatus !== 'pending' || !document.objectKey) {
    throw new AppError('STORAGE_STATE', 'Dokumen tidak sedang menunggu upload.');
  }

  try {
    const inspected = await inspectObject(document.objectKey);
    const valid =
      inspected.contentType === 'application/pdf' &&
      typeof inspected.size === 'number' &&
      inspected.size > 0 &&
      inspected.size <= MAX_PDF_BYTES &&
      inspected.prefix === '%PDF-';
    if (!valid) {
      await deleteObject(document.objectKey);
      await getDb()
        .update(documents)
        .set({
          storageStatus: 'error',
          objectKey: null,
          storageError: 'File gagal verifikasi PDF.',
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
      throw new AppError('VALIDATION', 'File yang diunggah bukan PDF yang valid.');
    }

    await getDb()
      .update(documents)
      .set({
        storageStatus: 'ready',
        mimeType: 'application/pdf',
        byteSize: inspected.size,
        etag: inspected.etag,
        uploadedAt: new Date(),
        storageError: null,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  } catch (error) {
    if (error instanceof AppError) throw error;
    await getDb()
      .update(documents)
      .set({
        storageStatus: 'error',
        storageError: 'R2 tidak dapat memverifikasi objek.',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
    throw new AppError('INFRASTRUCTURE', 'R2 tidak dapat memverifikasi upload.');
  }
}
