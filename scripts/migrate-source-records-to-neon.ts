import { writeFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';
import { z } from 'zod';

loadEnvConfig(process.cwd());

const uuid = z.uuid();
const sourceStatus = z.enum(['draft', 'published', 'archived', 'superseded']);
const holidayType = z.enum(['national', 'regional']);
const documentKind = z.enum(['original', 'revision', 'addendum', 'cancellation']);
const relationType = z.enum(['source', 'adds', 'revises', 'cancels']);

const apply = process.argv.includes('--apply');
const sourceUrl = z.string().startsWith('postgresql://').parse(process.env.SOURCE_DATABASE_URL);
const targetUrl = z
  .string()
  .startsWith('postgresql://')
  .parse(process.env.DATABASE_URL_UNPOOLED);

const source = new Client({ connectionString: sourceUrl });
const target = new Client({ connectionString: targetUrl });

type RecordRow = Record<string, unknown>;

function validateRelationships(
  regions: RecordRow[],
  documents: RecordRow[],
  holidays: RecordRow[],
  links: RecordRow[],
) {
  const regionIds = new Set(regions.map((row) => uuid.parse(row.id)));
  const documentIds = new Set(documents.map((row) => uuid.parse(row.id)));
  const holidayIds = new Set(holidays.map((row) => uuid.parse(row.id)));

  for (const row of holidays) {
    holidayType.parse(row.type);
    if (row.region_id && !regionIds.has(uuid.parse(row.region_id))) {
      throw new Error(`Holiday ${row.id} references a missing region`);
    }
  }
  for (const row of documents) {
    sourceStatus.parse(row.status);
    documentKind.parse(row.document_kind);
    if (row.region_id && !regionIds.has(uuid.parse(row.region_id))) {
      throw new Error(`Document ${row.id} references a missing region`);
    }
    if (row.supersedes_document_id) {
      const supersedes = uuid.parse(row.supersedes_document_id);
      if (supersedes === row.id || !documentIds.has(supersedes)) {
        throw new Error(`Document ${row.id} has an invalid supersession reference`);
      }
    }
  }
  for (const row of links) {
    relationType.parse(row.relation_type);
    if (!holidayIds.has(uuid.parse(row.holiday_id))) {
      throw new Error(`Link references missing holiday ${row.holiday_id}`);
    }
    if (!documentIds.has(uuid.parse(row.document_id))) {
      throw new Error(`Link references missing document ${row.document_id}`);
    }
  }
}

async function main() {
  await source.connect();
  await target.connect();
  try {
    const targetCount = await target.query(
      `select
        (select count(*) from regions) +
        (select count(*) from holidays) +
        (select count(*) from documents) +
        (select count(*) from holiday_documents) as count`,
    );
    if (Number(targetCount.rows[0].count) !== 0) {
      throw new Error('Target application tables must be empty');
    }

    const [regionsResult, documentsResult, holidaysResult, linksResult] = await Promise.all([
      source.query('select id, name, code, created_at from regions order by created_at, id'),
      source.query(`select id, title, year, type, region_id, document_kind, status,
        published_date, summary, supersedes_document_id, created_at
        from documents order by created_at, id`),
      source.query(`select id, date, name, type, region_id, description,
        is_cuti_bersama, created_at, updated_at from holidays order by created_at, id`),
      source.query(`select holiday_id, document_id, relation_type, note, created_at
        from holiday_documents order by created_at, holiday_id, document_id`),
    ]);
    const regions = regionsResult.rows;
    const documents = documentsResult.rows;
    const holidays = holidaysResult.rows;
    const links = linksResult.rows;
    validateRelationships(regions, documents, holidays, links);

    const report = {
      mode: apply ? 'apply' : 'dry-run',
      generatedAt: new Date().toISOString(),
      counts: {
        regions: regions.length,
        documents: documents.length,
        holidays: holidays.length,
        holidayDocuments: links.length,
      },
      ids: {
        regions: regions.map((row) => row.id),
        documents: documents.map((row) => row.id),
        holidays: holidays.map((row) => row.id),
      },
      sourcePublishedMappedToDraft: documents
        .filter((row) => row.status === 'published')
        .map((row) => row.id),
    };

    if (apply) {
      await target.query('begin');
      try {
        for (const row of regions) {
          await target.query(
            'insert into regions (id, name, code, created_at) values ($1, $2, $3, $4)',
            [row.id, row.name, row.code, row.created_at],
          );
        }
        for (const row of documents) {
          const mappedStatus = row.status === 'published' ? 'draft' : row.status;
          await target.query(
            `insert into documents (
              id, title, year, type, region_id, document_kind, publication_status,
              storage_status, published_date, summary, supersedes_document_id,
              created_at, updated_at
            ) values ($1,$2,$3,$4,$5,$6,$7,'missing',$8,$9,null,$10,$10)`,
            [
              row.id,
              row.title,
              row.year,
              row.type,
              row.region_id,
              row.document_kind,
              mappedStatus,
              row.published_date,
              row.summary,
              row.created_at,
            ],
          );
        }
        for (const row of documents) {
          if (row.supersedes_document_id) {
            await target.query(
              'update documents set supersedes_document_id = $1 where id = $2',
              [row.supersedes_document_id, row.id],
            );
          }
        }
        for (const row of holidays) {
          await target.query(
            `insert into holidays (
              id, date, name, type, region_id, description, is_cuti_bersama,
              created_at, updated_at
            ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              row.id,
              row.date,
              row.name,
              row.type,
              row.region_id,
              row.description,
              row.is_cuti_bersama,
              row.created_at,
              row.updated_at,
            ],
          );
        }
        for (const row of links) {
          await target.query(
            `insert into holiday_documents (
              holiday_id, document_id, relation_type, note, created_at
            ) values ($1,$2,$3,$4,$5)`,
            [row.holiday_id, row.document_id, row.relation_type, row.note, row.created_at],
          );
        }
        const verification = await target.query(`select
          (select count(*)::int from regions) as regions,
          (select count(*)::int from documents) as documents,
          (select count(*)::int from holidays) as holidays,
          (select count(*)::int from holiday_documents) as holiday_documents,
          (select count(*)::int from holiday_documents hd
            left join holidays h on h.id = hd.holiday_id
            left join documents d on d.id = hd.document_id
            where h.id is null or d.id is null) as orphan_links`);
        const counts = verification.rows[0];
        if (
          counts.regions !== regions.length ||
          counts.documents !== documents.length ||
          counts.holidays !== holidays.length ||
          counts.holiday_documents !== links.length ||
          counts.orphan_links !== 0
        ) {
          throw new Error('Target reconciliation failed; transaction rolled back');
        }
        await target.query('commit');
      } catch (error) {
        await target.query('rollback');
        throw error;
      }
    }

    const reportPath = `migration-report-${Date.now()}.json`;
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
    console.log(`${apply ? 'Migration' : 'Dry run'} complete. Report: ${reportPath}`);
  } finally {
    await Promise.allSettled([source.end(), target.end()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exitCode = 1;
});
