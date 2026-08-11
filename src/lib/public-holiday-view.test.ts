import { describe, expect, it } from 'vitest';
import type { Holiday } from '@/domain/models';
import {
  summarizeHolidays,
  toCalendarHolidaySnapshots,
  toCalendarHolidays,
} from './public-holiday-view';

const holidays: Holiday[] = [
  {
    id: 'national-1',
    date: '2026-08-17',
    name: 'Proklamasi Kemerdekaan',
    type: 'national',
    description: 'Hari Kemerdekaan Republik Indonesia',
    is_cuti_bersama: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-02-01T00:00:00.000Z',
    holiday_documents: [
      {
        holiday_id: 'national-1',
        document_id: 'document-ready',
        relation_type: 'source',
        created_at: '2026-01-01T00:00:00.000Z',
        document: {
          id: 'document-ready',
          title: 'SKB Hari Libur Nasional 2026',
          year: 2026,
          type: 'national',
          document_kind: 'original',
          status: 'published',
          storage_status: 'ready',
          file_url: 'https://example.com/skb-2026.pdf',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-02T00:00:00.000Z',
        },
      },
      {
        holiday_id: 'national-1',
        document_id: 'document-without-file',
        relation_type: 'source',
        created_at: '2026-01-01T00:00:00.000Z',
        document: {
          id: 'document-without-file',
          title: 'Dokumen tanpa berkas',
          year: 2026,
          type: 'national',
          document_kind: 'original',
          status: 'draft',
          storage_status: 'missing',
          is_active: false,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      },
    ],
  },
  {
    id: 'regional-1',
    date: '2026-12-24',
    name: 'Libur Regional Papua Barat Daya',
    type: 'regional',
    region_id: 'region-pbd',
    region: {
      id: 'region-pbd',
      name: 'Papua Barat Daya',
      code: 'PBD',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    is_cuti_bersama: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'other-year',
    date: '2025-12-25',
    name: 'Natal 2025',
    type: 'national',
    is_cuti_bersama: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z',
  },
];

describe('public holiday view model', () => {
  it('maps API records to serializable calendar snapshots without mutating input', () => {
    const original = structuredClone(holidays);
    const snapshots = toCalendarHolidaySnapshots(holidays);

    expect(snapshots[0]).toMatchObject({
      date: '2026-08-17',
      name: 'Proklamasi Kemerdekaan',
      type: 'national',
      description: 'Hari Kemerdekaan Republik Indonesia',
      isCutiBersama: false,
      sourceDocuments: [
        {
          id: 'document-ready',
          title: 'SKB Hari Libur Nasional 2026',
          fileUrl: 'https://example.com/skb-2026.pdf',
          type: 'national',
          documentKind: 'original',
        },
      ],
    });
    expect(snapshots[1]).toMatchObject({
      type: 'regional',
      region: 'PBD',
      isCutiBersama: true,
    });
    expect(holidays).toEqual(original);
  });

  it('converts ISO-only dates into local calendar dates', () => {
    const calendarRows = toCalendarHolidays(
      toCalendarHolidaySnapshots(holidays.slice(0, 1)),
    );

    expect(calendarRows[0].date.getFullYear()).toBe(2026);
    expect(calendarRows[0].date.getMonth()).toBe(7);
    expect(calendarRows[0].date.getDate()).toBe(17);
  });

  it('summarizes only the requested year and finds the latest update', () => {
    expect(summarizeHolidays(holidays, 2026)).toEqual({
      year: 2026,
      total: 2,
      national: 1,
      regional: 1,
      cutiBersama: 1,
      latestUpdatedAt: '2026-03-01T00:00:00.000Z',
    });
  });

  it('returns no verification date when a year has no records', () => {
    expect(summarizeHolidays(holidays, 2024)).toEqual({
      year: 2024,
      total: 0,
      national: 0,
      regional: 0,
      cutiBersama: 0,
      latestUpdatedAt: undefined,
    });
  });
});
