import { ExternalLink, FileText, Info, ShieldCheck } from 'lucide-react';
import { format, parse } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Document, Holiday } from '@/domain/models';

interface PublicHolidayOverviewProps {
  year: number;
  holidays: Holiday[];
  documents: Document[];
}

const holidayTypeLabel = (holiday: Holiday) => {
  if (holiday.is_cuti_bersama) return 'Cuti bersama';
  if (holiday.type === 'regional') return holiday.region?.name || 'Libur regional';
  return 'Libur nasional';
};

const holidayDate = (value: string) =>
  format(parse(value, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', { locale: idLocale });

export function PublicHolidayOverview({
  year,
  holidays,
  documents,
}: PublicHolidayOverviewProps) {
  const national = holidays.filter((holiday) => holiday.type === 'national').length;
  const regional = holidays.filter((holiday) => holiday.type === 'regional').length;
  const jointLeave = holidays.filter((holiday) => holiday.is_cuti_bersama).length;
  const latestUpdate = holidays
    .map((holiday) => holiday.updated_at)
    .filter(Boolean)
    .sort()
    .at(-1);
  const verifiedLabel = latestUpdate
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jayapura',
      }).format(new Date(latestUpdate))
    : 'belum tersedia';

  return (
    <section
      aria-labelledby="ringkasan-hari-libur"
      className="mt-10 space-y-6 rounded-xl border border-[#003049]/10 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#58717b] dark:text-[#b7c9d0]">
          Ringkasan terverifikasi
        </p>
        <h2
          id="ringkasan-hari-libur"
          className="mt-1 text-2xl font-bold text-[#003049] dark:text-white"
        >
          Daftar Hari Libur Indonesia {year}
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-[#274b5a] dark:text-gray-300">
          Kalender ini memuat {holidays.length} tanggal untuk {year}: {national} libur
          nasional, {regional} libur regional, dan {jointLeave} tanggal cuti bersama.
          Fokus regionalnya adalah Papua Barat Daya, dengan tautan dokumen sumber yang
          tersedia pada setiap data.
        </p>
      </div>

      {holidays.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#003049]/10 dark:border-slate-700">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Daftar hari libur dan dokumen sumber tahun {year}</caption>
            <thead className="bg-[#003049] text-white dark:bg-[#274b5a]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                <th scope="col" className="px-4 py-3 font-semibold">Hari libur</th>
                <th scope="col" className="px-4 py-3 font-semibold">Jenis</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#003049]/10 dark:divide-slate-700">
              {holidays.map((holiday) => {
                const sources = holiday.holiday_documents
                  ?.map((link) => link.document)
                  .filter((document): document is Document => Boolean(document?.file_url));

                return (
                  <tr key={holiday.id} className="align-top odd:bg-slate-50 dark:odd:bg-slate-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-[#274b5a] dark:text-gray-200">
                      {holidayDate(holiday.date)}
                    </td>
                    <th scope="row" className="px-4 py-3 font-semibold text-[#003049] dark:text-white">
                      {holiday.name}
                    </th>
                    <td className="px-4 py-3 text-[#274b5a] dark:text-gray-200">
                      {holidayTypeLabel(holiday)}
                    </td>
                    <td className="px-4 py-3">
                      {sources?.length ? (
                        <div className="space-y-1">
                          {sources.map((source) => (
                            <a
                              key={source.id}
                              href={source.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1.5 font-medium text-[#005f73] underline-offset-4 hover:underline dark:text-[#8ecae6]"
                            >
                              <span>{source.title}</span>
                              <ExternalLink size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#58717b] dark:text-gray-400">Belum ditautkan</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Daftar hari libur {year} belum dapat ditampilkan. Kalender interaktif tetap dapat
          dicoba atau dimuat ulang.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
          <Info className="mb-2 text-[#005f73] dark:text-[#8ecae6]" size={20} aria-hidden="true" />
          <h3 className="font-semibold text-[#003049] dark:text-white">Cara membaca data</h3>
          <p className="mt-2 text-sm leading-6 text-[#274b5a] dark:text-gray-300">
            Libur nasional berlaku secara nasional. Libur regional mengikuti wilayah yang
            tercantum. Cuti bersama ditandai terpisah dari hari libur biasa.
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
          <ShieldCheck className="mb-2 text-[#005f73] dark:text-[#8ecae6]" size={20} aria-hidden="true" />
          <h3 className="font-semibold text-[#003049] dark:text-white">Metode long weekend</h3>
          <p className="mt-2 text-sm leading-6 text-[#274b5a] dark:text-gray-300">
            Long weekend dihitung dari sedikitnya tiga hari libur berurutan, termasuk Sabtu
            dan Minggu. Jumat hanya dihitung jika opsi pengguna diaktifkan.
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
          <FileText className="mb-2 text-[#005f73] dark:text-[#8ecae6]" size={20} aria-hidden="true" />
          <h3 className="font-semibold text-[#003049] dark:text-white">Sumber dan koreksi</h3>
          <p className="mt-2 text-sm leading-6 text-[#274b5a] dark:text-gray-300">
            Terakhir diverifikasi {verifiedLabel}. Situs ini alat perencanaan independen,
            bukan situs resmi pemerintah. Laporkan koreksi melalui{' '}
            <a
              href="https://github.com/rizkyyusfian/hari-libur-indo/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#005f73] underline underline-offset-4 dark:text-[#8ecae6]"
            >
              GitHub Issues
            </a>.
          </p>
        </div>
      </div>

      {documents.length > 0 && (
        <p className="text-sm text-[#58717b] dark:text-gray-400">
          {documents.length} dokumen publik aktif tersedia untuk tahun {year}. Hubungan sumber
          ditampilkan sesuai data tersimpan tanpa koreksi otomatis.
        </p>
      )}
    </section>
  );
}
