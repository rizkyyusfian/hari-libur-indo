import { Holiday } from './date-utils';

export const mockHolidays: Holiday[] = [
  // 2026 National Holidays
  { id: '1', date: new Date(2026, 0, 1), name: 'Tahun Baru', type: 'national' },
  { id: '2', date: new Date(2026, 1, 28), name: 'Isra & Mi\'raj', type: 'national' },
  { id: '3', date: new Date(2026, 2, 30), name: 'Hari Raya Idul Fitri', type: 'national', isCutiBersama: true },
  { id: '4', date: new Date(2026, 3, 1), name: 'Cuti Bersama Idul Fitri', type: 'national', isCutiBersama: true },
  { id: '5', date: new Date(2026, 3, 2), name: 'Cuti Bersama Idul Fitri', type: 'national', isCutiBersama: true },
  { id: '6', date: new Date(2026, 3, 8), name: 'Hari Raya Idul Adha', type: 'national' },
  { id: '7', date: new Date(2026, 3, 28), name: 'Tahun Baru Hijriah', type: 'national' },
  { id: '8', date: new Date(2026, 4, 1), name: 'Hari Buruh', type: 'national' },
  { id: '9', date: new Date(2026, 4, 21), name: 'Mawlid Nabi Muhammad', type: 'national' },
  { id: '10', date: new Date(2026, 4, 29), name: 'Kenaikan Isa Almasih', type: 'national' },
  { id: '11', date: new Date(2026, 5, 1), name: 'Hari Pancasila', type: 'national' },
  { id: '12', date: new Date(2026, 7, 17), name: 'Hari Kemerdekaan', type: 'national' },
  { id: '13', date: new Date(2026, 11, 25), name: 'Hari Natal', type: 'national' },
  { id: '14', date: new Date(2026, 11, 26), name: 'Cuti Bersama Natal', type: 'national', isCutiBersama: true },

  // Papua Barat Daya Regional Holidays
  { id: '100', date: new Date(2026, 6, 2), name: 'Hari Jadi Papua Barat Daya', type: 'regional', region: 'papua_barat_daya' },
];

export const getRoastMessage = (daysUntil: number, todayIsHoliday: boolean): string => {
  if (todayIsHoliday) {
    return 'Selamat liburan! Nikmati harimu!';
  }

  if (daysUntil === 0) {
    return 'Libur mulai sekarang! Jangan lupa nyalain alarm untuk besok.';
  }

  if (daysUntil === 1) {
    return 'Besok libur! Persiapkan diri sekarang.';
  }

  if (daysUntil <= 3) {
    return `Sebentar lagi libur (${daysUntil} hari lagi), tahan ya!`;
  }

  if (daysUntil <= 7) {
    return `Libur dalam ${daysUntil} hari. Semangat bekerja!`;
  }

  if (daysUntil <= 14) {
    return `${daysUntil} hari lagi libur. Tetap fokus!`;
  }

  if (daysUntil <= 30) {
    return `Masih lama ${daysUntil} hari. Jangan cepat lelah!`;
  }

  return 'Kerja dulu, libur nanti.';
};

export const getCutiAdvice = (cutiDays: number): string[] => {
  if (cutiDays <= 0) return ['Tidak perlu cuti kali ini.'];

  const advices = [
    `Dengan ${cutiDays} hari cuti, kamu bisa maksimalkan waktu libur!`,
    'Gunakan cuti untuk menjembatani hari libur dan akhir pekan.',
    'Strategi: ambil cuti setelah atau sebelum hari libur untuk long weekend!',
    'Tips: periksa kalender untuk memilih waktu cuti yang paling menguntungkan.',
  ];

  return advices;
};
