import { addDays, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { Holiday, isOffDay } from './date-utils';

export type CutiRecommendation = {
  dates: Date[];
  totalDaysOff: number;
  reason: string;
  startLongWeekend: Date;
  endLongWeekend: Date;
};

export const planCuti = (cutiDays: number, holidays: Holiday[], from?: Date, regionFilter?: string): CutiRecommendation[] => {
  if (cutiDays <= 0) return [];

  const startDate = from ? startOfDay(from) : startOfDay(new Date());
  const endDate = new Date(startDate.getFullYear(), 11, 31);
  const recommendations: CutiRecommendation[] = [];
  let used = 0;

  // Find gaps between holidays/weekends that can be bridged with cuti
  let date = new Date(startDate);

  while (used < cutiDays && isBefore(date, endDate)) {
    // Find sequences of off days
    const sequenceStart = new Date(date);
    let sequenceEnd = new Date(date);
    const gap = 0;

    while (gap < cutiDays - used && isBefore(sequenceEnd, endDate)) {
      const nextDay = addDays(sequenceEnd, 1);

      if (isOffDay(nextDay, holidays, regionFilter)) {
        sequenceEnd = nextDay;
      } else {
        break;
      }

      sequenceEnd = nextDay;
    }

    // Check if there's a gap we can bridge
    const gapStart = addDays(sequenceEnd, 1);
    let gapEnd = gapStart;
    let gapDays = 0;

    while (
      gapDays < 3 &&
      used < cutiDays &&
      isBefore(gapEnd, endDate) &&
      !isOffDay(gapEnd, holidays, regionFilter)
    ) {
      gapEnd = addDays(gapEnd, 1);
      gapDays++;
    }

    if (gapDays > 0 && gapDays <= Math.min(3, cutiDays - used)) {
      const recommendation: CutiRecommendation = {
        dates: [],
        totalDaysOff: 0,
        reason: '',
        startLongWeekend: sequenceStart,
        endLongWeekend: addDays(gapEnd, 1),
      };

      // Add cuti days
      for (let i = 0; i < gapDays && used < cutiDays; i++) {
        recommendation.dates.push(addDays(gapStart, i));
        used++;
      }

      // Calculate total days off
      let current = sequenceStart;
      while (isBefore(current, recommendation.endLongWeekend) || isSameDay(current, recommendation.endLongWeekend)) {
        if (isOffDay(current, holidays, regionFilter) || recommendation.dates.some(d => isSameDay(d, current))) {
          recommendation.totalDaysOff++;
        }
        current = addDays(current, 1);
      }

      recommendation.reason = `Ambil ${gapDays} hari cuti untuk mendapatkan ${recommendation.totalDaysOff} hari off`;

      recommendations.push(recommendation);
    }

    date = addDays(date, 1);
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};

export const estimateTotalDaysOff = (cutiDays: number, holidays: Holiday[], from?: Date, regionFilter?: string): number => {
  const recommendations = planCuti(cutiDays, holidays, from, regionFilter);
  return recommendations.reduce((sum, rec) => sum + rec.totalDaysOff, 0);
};
