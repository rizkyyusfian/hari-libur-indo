import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const holidayType = pgEnum('holiday_type', ['national', 'regional']);
export const documentKind = pgEnum('document_kind', ['original', 'revision', 'addendum', 'cancellation']);
export const publicationStatus = pgEnum('publication_status', [
  'draft',
  'published',
  'archived',
  'superseded',
]);
export const storageStatus = pgEnum('storage_status', [
  'missing',
  'pending',
  'ready',
  'deleting',
  'error',
]);
export const documentRelationType = pgEnum('document_relation_type', [
  'source',
  'adds',
  'revises',
  'cancels',
]);
export const auditOutcome = pgEnum('audit_outcome', ['success', 'failure']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const holidays = pgTable(
  'holidays',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    holidayDate: date('date', { mode: 'string' }).notNull(),
    name: text('name').notNull(),
    type: holidayType('type').notNull(),
    regionId: uuid('region_id').references(() => regions.id, { onDelete: 'restrict' }),
    description: text('description'),
    isCutiBersama: boolean('is_cuti_bersama').notNull().default(false),
    ...timestamps,
  },
  (table) => [
    check(
      'holidays_region_matches_type',
      sql`(${table.type} = 'national' AND ${table.regionId} IS NULL) OR (${table.type} = 'regional' AND ${table.regionId} IS NOT NULL)`,
    ),
    index('holidays_date_idx').on(table.holidayDate),
    index('holidays_type_idx').on(table.type),
    index('holidays_region_idx').on(table.regionId),
  ],
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    year: integer('year').notNull(),
    type: holidayType('type').notNull(),
    regionId: uuid('region_id').references(() => regions.id, { onDelete: 'restrict' }),
    kind: documentKind('document_kind').notNull().default('original'),
    publicationStatus: publicationStatus('publication_status').notNull().default('draft'),
    publishedDate: date('published_date', { mode: 'string' }),
    summary: text('summary'),
    supersedesDocumentId: uuid('supersedes_document_id').references(
      (): AnyPgColumn => documents.id,
      { onDelete: 'set null' },
    ),
    storageStatus: storageStatus('storage_status').notNull().default('missing'),
    objectKey: text('object_key'),
    originalFilename: text('original_filename'),
    mimeType: text('mime_type'),
    byteSize: integer('byte_size'),
    etag: text('etag'),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
    storageError: text('storage_error'),
    ...timestamps,
  },
  (table) => [
    check(
      'documents_region_matches_type',
      sql`(${table.type} = 'national' AND ${table.regionId} IS NULL) OR (${table.type} = 'regional' AND ${table.regionId} IS NOT NULL)`,
    ),
    check(
      'documents_ready_has_file',
      sql`${table.storageStatus} <> 'ready' OR (${table.objectKey} IS NOT NULL AND ${table.mimeType} = 'application/pdf' AND ${table.byteSize} > 0 AND ${table.uploadedAt} IS NOT NULL)`,
    ),
    check(
      'documents_published_is_ready',
      sql`${table.publicationStatus} <> 'published' OR ${table.storageStatus} = 'ready'`,
    ),
    check(
      'documents_not_self_superseding',
      sql`${table.supersedesDocumentId} IS NULL OR ${table.supersedesDocumentId} <> ${table.id}`,
    ),
    uniqueIndex('documents_object_key_idx').on(table.objectKey),
    index('documents_year_idx').on(table.year),
    index('documents_publication_idx').on(table.publicationStatus),
    index('documents_storage_idx').on(table.storageStatus),
  ],
);

export const holidayDocuments = pgTable(
  'holiday_documents',
  {
    holidayId: uuid('holiday_id')
      .notNull()
      .references(() => holidays.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    relationType: documentRelationType('relation_type').notNull().default('source'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.holidayId, table.documentId] }),
    index('holiday_documents_document_idx').on(table.documentId),
  ],
);

export const adminLoginAttempts = pgTable('admin_login_attempts', {
  fingerprintHash: text('fingerprint_hash').primaryKey(),
  windowStartedAt: timestamp('window_started_at', { withTimezone: true }).notNull(),
  failureCount: integer('failure_count').notNull().default(0),
  blockedUntil: timestamp('blocked_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminAuditLog = pgTable(
  'admin_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    outcome: auditOutcome('outcome').notNull(),
    requestId: text('request_id').notNull(),
    details: jsonb('details').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('admin_audit_created_idx').on(table.createdAt)],
);

export const regionsRelations = relations(regions, ({ many }) => ({
  holidays: many(holidays),
  documents: many(documents),
}));

export const holidaysRelations = relations(holidays, ({ one, many }) => ({
  region: one(regions, { fields: [holidays.regionId], references: [regions.id] }),
  documentLinks: many(holidayDocuments),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  region: one(regions, { fields: [documents.regionId], references: [regions.id] }),
  supersedes: one(documents, {
    fields: [documents.supersedesDocumentId],
    references: [documents.id],
    relationName: 'document_supersession',
  }),
  supersededBy: many(documents, { relationName: 'document_supersession' }),
  holidayLinks: many(holidayDocuments),
}));

export const holidayDocumentsRelations = relations(holidayDocuments, ({ one }) => ({
  holiday: one(holidays, { fields: [holidayDocuments.holidayId], references: [holidays.id] }),
  document: one(documents, { fields: [holidayDocuments.documentId], references: [documents.id] }),
}));
