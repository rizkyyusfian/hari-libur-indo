import { parse } from 'date-fns';
import type { Holiday as HolidayRecord } from '@/domain/models';
import type { Holiday as CalendarHoliday } from '@/lib/date-utils';

export interface CalendarHolidaySourceSnapshot {
  id: string;
  title: string;
  fileUrl: string;
  type: 'national' | 'regional';
  documentKind: 'original' | 'revision' | 'addendum' | 'cancellation';
}

export interface CalendarHolidaySnapshot {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'regional';
  region?: string;
  description?: string;
  isCutiBersama: boolean;
  sourceDocuments: CalendarHolidaySourceSnapshot[];
}

export interface HolidaySummary {
  year: number;
  total: number;
  national: number;
  regional: number;
  cutiBersama: number;
  latestUpdatedAt?: string;
}

export function toCalendarHolidaySnapshots(
  rows: readonly HolidayRecord[],
): CalendarHolidaySnapshot[] {
  return rows.map((holiday) => ({
    id: holiday.id,
    date: holiday.date,
    name: holiday.name,
    type: holiday.type,
    region: holiday.region?.code,
    description: holiday.description,
    isCutiBersama: holiday.is_cuti_bersama,
    sourceDocuments:
      holiday.holiday_documents?.flatMap(({ document }) =>
        document?.file_url
          ? [
              {
                id: document.id,
                title: document.title,
                fileUrl: document.file_url,
                type: document.type,
                documentKind: document.document_kind,
              },
            ]
          : [],
      ) ?? [],
  }));
}

export function toCalendarHolidays(
  rows: readonly CalendarHolidaySnapshot[],
): CalendarHoliday[] {
  return rows.map((holiday) => ({
    ...holiday,
    date: parse(holiday.date, 'yyyy-MM-dd', new Date()),
    sourceDocuments: holiday.sourceDocuments.map((document) => ({ ...document })),
  }));
}

export function summarizeHolidays(
  rows: readonly HolidayRecord[],
  year: number,
): HolidaySummary {
  const yearPrefix = `${year}-`;
  const inYear = rows.filter((holiday) => holiday.date.startsWith(yearPrefix));
  const latestUpdatedAt = inYear.reduce<string | undefined>(
    (latest, holiday) =>
      !latest || holiday.updated_at > latest ? holiday.updated_at : latest,
    undefined,
  );

  return {
    year,
    total: inYear.length,
    national: inYear.filter((holiday) => holiday.type === 'national').length,
    regional: inYear.filter((holiday) => holiday.type === 'regional').length,
    cutiBersama: inYear.filter((holiday) => holiday.is_cuti_bersama).length,
    latestUpdatedAt,
  };
}
