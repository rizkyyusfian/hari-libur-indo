'use client';

import { useState, useEffect } from 'react';
import { Holiday, detectLongWeekends, formatDateIndonesian, isHoliday, isWeekend, getDayNameIndonesian } from '@/lib/date-utils';
import { Calendar, ExternalLink } from 'lucide-react';
import { addDays } from 'date-fns';
import { getRegionalDocument, Document } from '@/lib/supabase-queries';

interface LongWeekendListProps {
  holidays: Holiday[];
  year?: number;
}

interface DayDetail {
  date: Date;
  dayName: string;
  info: string;
  isRegional?: boolean;
}

export function LongWeekendList({ holidays, year }: LongWeekendListProps) {
  const currentYear = year || new Date().getFullYear();
  const longWeekends = detectLongWeekends(holidays, currentYear);
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
      }
      
      days.push({
        date: new Date(current),
        dayName,
        info,
        isRegional
      });
      
      current = addDays(current, 1);
    }
    
    return days;
  };

  // PBD Badge component - clickable if regional doc exists
  const PBDBadge = () => {
    if (regionalDoc?.file_url) {
      return (
        <a
          href={regionalDoc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium hover:bg-[#003049]/20 dark:hover:bg-[#669bbc]/30 transition"
          title={regionalDoc.title}
        >
          PBD
          <ExternalLink size={8} />
        </a>
      );
    }
    return (
      <span className="text-[10px] px-1 py-0.5 bg-[#003049]/10 dark:bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc] rounded font-medium">
        PBD
      </span>
    );
  };

  if (longWeekends.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[#669bbc]" />
          <h3 className="font-semibold text-[#003049] dark:text-gray-100">Long Weekend</h3>
        </div>
        <p className="text-sm text-[#003049]/70 dark:text-gray-400 text-center py-8">
          Tidak ada long weekend di tahun ini
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
                            {day.isRegional && <PBDBadge />}
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
