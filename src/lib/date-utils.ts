import { format, isWeekend as dfIsWeekend, isSameDay, addDays, isAfter, isBefore, startOfDay, isWithinInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export type Holiday = {
  id: string;
  date: Date;
  name: string;
  type: 'national' | 'regional';
  region?: string;
  description?: string;
  isCutiBersama?: boolean;
};

export type LongWeekend = {
  start: Date;
  end: Date;
  length: number;
  reason: string[];
};

type OffDayOptions = {
  includeFridayAsOffDay?: boolean;
};

// Re-export date-fns utilities
export const isWeekend = dfIsWeekend;

// Format date to YYYY-MM-DD
export const formatDateISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format date to Indonesian format (e.g., "18 Maret 2026")
export const formatDateIndonesian = (date: Date): string => {
  return format(date, 'd MMMM yyyy', { locale: idLocale });
};

// Get day name in Indonesian
export const getDayNameIndonesian = (date: Date): string => {
  return format(date, 'EEEE', { locale: idLocale });
};

// Check if date is a holiday
export const isHoliday = (date: Date, holidays: Holiday[], regionFilter?: string): Holiday | null => {
  const dateStart = startOfDay(date);
  const found = holidays.find(h => isSameDay(h.date, dateStart) && (!regionFilter || h.type === 'national' || h.region === regionFilter));
  return found || null;
};

// Check if date is weekend or holiday
export const isOffDay = (date: Date, holidays: Holiday[], regionFilter?: string, options?: OffDayOptions): boolean => {
  const fridayAsOffDay = options?.includeFridayAsOffDay && date.getDay() === 5;
  return dfIsWeekend(date) || fridayAsOffDay || !!isHoliday(date, holidays, regionFilter);
};

// Get all weekends in a month
export const getWeekendsInMonth = (year: number, month: number): Date[] => {
  const weekends = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    if (dfIsWeekend(date)) {
      weekends.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return weekends;
};

// Detect long weekends (3+ consecutive off days)
export const detectLongWeekends = (holidays: Holiday[], year?: number, regionFilter?: string, options?: OffDayOptions): LongWeekend[] => {
  const startDate = new Date(year || new Date().getFullYear(), 0, 1);
  const endDate = new Date(year || new Date().getFullYear(), 11, 31);
  const longWeekends: LongWeekend[] = [];

  let currentStart: Date | null = null;
  let currentEnd: Date | null = null;
  let reasons: string[] = [];

  const date = new Date(startDate);
  while (isBefore(date, endDate) || isSameDay(date, endDate)) {
    const offDay = isOffDay(date, holidays, regionFilter, options);
    const holiday = isHoliday(date, holidays, regionFilter);
    const weekend = dfIsWeekend(date);
    const fridayAsOffDay = options?.includeFridayAsOffDay && date.getDay() === 5;

    if (offDay) {
      if (!currentStart) {
        currentStart = new Date(date);
        currentEnd = new Date(date);
        reasons = [];
      } else {
        currentEnd = new Date(date);
      }

      if (holiday) {
        reasons.push(holiday.name);
      } else if (fridayAsOffDay) {
        reasons.push('Jumat');
      } else if (weekend) {
        reasons.push(getDayNameIndonesian(date));
      }
    } else {
      if (currentStart && currentEnd) {
        const length = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (length >= 3) {
          longWeekends.push({
            start: currentStart,
            end: currentEnd,
            length,
            reason: [...new Set(reasons)],
          });
        }
      }
      currentStart = null;
      currentEnd = null;
      reasons = [];
    }

    date.setDate(date.getDate() + 1);
  }

  if (currentStart && currentEnd) {
    const length = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (length >= 3) {
      longWeekends.push({
        start: currentStart,
        end: currentEnd,
        length,
        reason: [...new Set(reasons)],
      });
    }
  }

  return longWeekends;
};

// Get next holiday or long weekend
export const getNextOffPeriod = (from: Date, holidays: Holiday[], regionFilter?: string): { type: 'holiday' | 'long-weekend'; date?: Date; daysUntil: number; details?: Holiday | LongWeekend } | null => {
  const nextHoliday = holidays.find(h => isAfter(h.date, from) && (!regionFilter || h.type === 'national' || h.region === regionFilter));
  const longWeekends = detectLongWeekends(holidays, from.getFullYear(), regionFilter);
  const nextLongWeekend = longWeekends.find(lw => isAfter(lw.start, from));

  if (nextHoliday && (!nextLongWeekend || isBefore(nextHoliday.date, nextLongWeekend.start))) {
    const daysUntil = Math.floor((nextHoliday.date.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return { type: 'holiday', date: nextHoliday.date, daysUntil, details: nextHoliday };
  }

  if (nextLongWeekend) {
    const daysUntil = Math.floor((nextLongWeekend.start.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return { type: 'long-weekend', date: nextLongWeekend.start, daysUntil, details: nextLongWeekend };
  }

  return null;
};

// Get days until next off day
export const getDaysUntilNextOffDay = (from: Date, holidays: Holiday[], regionFilter?: string): number => {
  const date = new Date(from);
  date.setDate(date.getDate() + 1);

  for (let i = 0; i < 365; i++) {
    if (isOffDay(date, holidays, regionFilter)) {
      return i + 1;
    }
    date.setDate(date.getDate() + 1);
  }
  return -1;
};
