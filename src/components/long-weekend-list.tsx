'use client';

import { useState, useEffect } from 'react';
import { Holiday, detectLongWeekends, formatDateIndonesian, isHoliday, isWeekend, getDayNameIndonesian } from '@/lib/date-utils';
import { Calendar, ExternalLink } from 'lucide-react';
import { addDays } from 'date-fns';
import { getRegionalDocument, Document } from '@/lib/supabase-queries';

interface LongWeekendListProps {
  holidays: Holiday[];
  viewMode: 'month' | 'year';
  focusDate: Date;
  includeFridayInLongWeekend: boolean;
  onIncludeFridayInLongWeekendChange: (enabled: boolean) => void;
}

interface DayDetail {
  date: Date;
  dayName: string;
  info: string;
  isRegional?: boolean;
  sourceDocuments?: Holiday['sourceDocuments'];
}

export function LongWeekendList({
  holidays,
  viewMode,
  focusDate,
  includeFridayInLongWeekend,
  onIncludeFridayInLongWeekendChange,
}: LongWeekendListProps) {
  const currentYear = focusDate.getFullYear();
  const allLongWeekends = detectLongWeekends(holidays, currentYear, undefined, {
    includeFridayAsOffDay: includeFridayInLongWeekend,
  });
  const monthStart = new Date(currentYear, focusDate.getMonth(), 1);
  const monthEnd = new Date(currentYear, focusDate.getMonth() + 1, 0);
  const longWeekends = viewMode === 'month'
    ? allLongWeekends.filter(lw => lw.start <= monthEnd && lw.end >= monthStart)
    : allLongWeekends;
  const [regionalDoc, setRegionalDoc] = useState<Document | null>(null);

  useEffect(() => {
    loadRegionalDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);

  const loadRegionalDoc = async () => {
    try {
      const doc = await getRegionalDocument(currentYear, 'papua_barat_daya');
      if (!doc) {
        console.warn('[LongWeekendList] Regional document not found for year:', currentYear);
      } else if (!doc.file_url) {
        console.warn('[LongWeekendList] Regional document found but file_url is missing:', doc);
      }
      setRegionalDoc(doc);
    } catch (error) {
      console.error('[LongWeekendList] Error loading regional document:', error);
    }
  };

  // Get all days in a long weekend period with details
  const getDaysInPeriod = (start: Date, end: Date): DayDetail[] => {
    const days: DayDetail[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      const holiday = isHoliday(current, holidays);
      const weekend = isWeekend(current);
      const dayName = getDayNameIndonesian(current);
      
      let info = '';
      let isRegional = false;
      if (holiday) {
        info = holiday.name;
        isRegional = holiday.type === 'regional';
      } else if (weekend) {
        info = current.getDay() === 0 ? 'Minggu' : 'Sabtu';
      } else if (includeFridayInLongWeekend && current.getDay() === 5) {
        info = 'Jumat';
      }
      
      days.push({
        date: new Date(current),
        dayName,
        info,
        isRegional,
        sourceDocuments: holiday?.sourceDocuments,
      });
      
      current = addDays(current, 1);
    }
    
    return days;
  };

  const getPrimaryRegionalSource = (documents?: Holiday['sourceDocuments']) =>
    documents?.find(d => d.documentKind === 'addendum') ||
    documents?.find(d => d.documentKind === 'revision') ||
    documents?.find(d => d.documentKind === 'cancellation') ||
    documents?.[0];

  const PBDBadge = ({ day }: { day: DayDetail }) => {
    if (!day.isRegional) {
      return null;
    }

    const source = getPrimaryRegionalSource(day.sourceDocuments);
    const label =
      source?.documentKind === 'addendum'
        ? 'Tambahan'
        : source?.documentKind === 'revision'
          ? 'Revisi'
          : source?.documentKind === 'cancellation'
            ? 'Pembatalan'
            : 'PBD';
    const href = source?.fileUrl || regionalDoc?.file_url;
    const title = source?.title || regionalDoc?.title || 'Dokumen PBD';

    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium hover:bg-[#003049]/20 dark:hover:bg-[#669bbc]/30 transition"
          title={title}
        >
          {label}
          <ExternalLink size={8} />
        </a>
      );
    }

    return (
      <span className="text-[10px] px-1 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium">
        {label}
      </span>
    );
  };

  if (longWeekends.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[#669bbc]" />
          <h3 className="font-semibold text-[#003049] dark:text-gray-100">Long Weekend</h3>
          <button
            onClick={() => onIncludeFridayInLongWeekendChange(!includeFridayInLongWeekend)}
            className={`ml-auto px-2 py-1 text-xs rounded-md border transition ${
              includeFridayInLongWeekend
                ? 'bg-[#669bbc]/20 border-[#669bbc]/50 text-[#003049] dark:text-[#669bbc]'
                : 'bg-white dark:bg-slate-800 border-[#003049]/20 dark:border-slate-700 text-[#003049]/70 dark:text-gray-300'
            }`}
          >
            Include Friday: {includeFridayInLongWeekend ? 'On' : 'Off'}
          </button>
        </div>
        <p className="text-sm text-[#003049]/70 dark:text-gray-400 text-center py-8">
          {viewMode === 'month'
            ? 'Tidak ada long weekend di bulan ini'
            : 'Tidak ada long weekend di tahun ini'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-[#669bbc]" />
        <h3 className="font-semibold text-[#003049] dark:text-gray-100">
          Long Weekend ({longWeekends.length})
        </h3>
        <button
          onClick={() => onIncludeFridayInLongWeekendChange(!includeFridayInLongWeekend)}
          className={`ml-auto px-2 py-1 text-xs rounded-md border transition ${
            includeFridayInLongWeekend
              ? 'bg-[#669bbc]/20 border-[#669bbc]/50 text-[#003049] dark:text-[#669bbc]'
              : 'bg-white dark:bg-slate-800 border-[#003049]/20 dark:border-slate-700 text-[#003049]/70 dark:text-gray-300'
          }`}
        >
          Hitung Hari Jumat: {includeFridayInLongWeekend ? 'On' : 'Off'}
        </button>
      </div>

      <div className="space-y-6">
        {longWeekends.map((lw, idx) => {
          const days = getDaysInPeriod(lw.start, lw.end);
          const monthYear = lw.start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          
          return (
            <div key={idx} className="border border-[#003049]/10 dark:border-slate-700 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-[#003049] dark:bg-[#669bbc]/20 px-3 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white dark:text-[#669bbc]">
                    {monthYear}
                  </span>
                  <span className="text-xs bg-white dark:bg-slate-800 text-[#003049] dark:text-[#669bbc] px-2 py-1 rounded font-medium">
                    {lw.length} hari
                  </span>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[#003049] dark:text-gray-300 w-28">Tanggal</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[#003049] dark:text-gray-300 w-24">Hari</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[#003049] dark:text-gray-300">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIdx) => (
                      <tr 
                        key={dayIdx} 
                        className={`border-t border-[#003049]/10 dark:border-slate-700 ${
                          isHoliday(day.date, holidays) 
                            ? 'bg-[#c1121f]/5 dark:bg-[#c1121f]/10' 
                            : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-[#003049] dark:text-gray-100">
                          {formatDateIndonesian(day.date)}
                        </td>
                        <td className="px-3 py-2 text-[#003049] dark:text-gray-100">
                          {day.dayName}
                        </td>
                        <td className={`px-3 py-2 ${
                          isHoliday(day.date, holidays) 
                            ? 'text-[#c1121f] dark:text-[#c1121f] font-medium' 
                            : 'text-[#003049]/70 dark:text-gray-400'
                        }`}>
                          <span className="flex items-center gap-1.5">
                            {day.info}
                            <PBDBadge day={day} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#003049]/60 dark:text-gray-500 mt-4 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
        Manfaatkan long weekend untuk istirahat atau liburan!
      </p>
    </div>
  );
}
