export type TimezoneCode = 'WIB' | 'WITA' | 'WIT' | 'UTC';

export interface TimezoneInfo {
  code: TimezoneCode;
  name: string;
  offset: number;
  provinces: string[];
}

export const timezones: TimezoneInfo[] = [
  {
    code: 'WIB',
    name: 'Western Indonesia Time',
    offset: 7,
    provinces: ['Aceh', 'North Sumatra', 'Riau', 'West Sumatra', 'Jambi', 'South Sumatra', 'Bangka Belitung', 'Jakarta', 'Banten', 'West Java', 'Central Java', 'Yogyakarta', 'East Java'],
  },
  {
    code: 'WITA',
    name: 'Central Indonesia Time',
    offset: 8,
    provinces: ['South Kalimantan', 'East Kalimantan', 'North Kalimantan', 'West Kalimantan', 'Central Kalimantan', 'South Sulawesi', 'Central Sulawesi', 'North Sulawesi', 'Gorontalo', 'West Nusa Tenggara', 'East Nusa Tenggara', 'Bali'],
  },
  {
    code: 'WIT',
    name: 'Eastern Indonesia Time',
    offset: 9,
    provinces: ['Papua', 'West Papua', 'North Maluku', 'Maluku'],
  },
];

export const getTimezoneByProvinceOrCoords = (province?: string): TimezoneInfo => {
  if (province) {
    const tz = timezones.find(t => t.provinces.some(p => p.toLowerCase().includes(province.toLowerCase())));
    if (tz) return tz;
  }

  // Papua Barat Daya is in WIT
  if (province?.toLowerCase().includes('papua')) {
    return timezones.find(t => t.code === 'WIT') || timezones[0];
  }

  // Default to WIB
  return timezones[0];
};

export const getCurrentTimezone = (): TimezoneInfo => {
  const now = new Date();
  const offset = -now.getTimezoneOffset() / 60;

  // Check against Indonesia timezones
  const tz = timezones.find(t => t.offset === offset);
  if (tz) return tz;

  // Default to WIB
  return timezones[0];
};

export const formatTimeWithTimezone = (date: Date, timezone: TimezoneInfo): string => {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: getTimezoneString(timezone.offset),
  });

  return `${formatter.format(date)} ${timezone.code}`;
};

export const getTimezoneString = (offset: number): string => {
  if (offset === 7) return 'Asia/Jakarta';
  if (offset === 8) return 'Asia/Makassar';
  if (offset === 9) return 'Asia/Jayapura';
  return 'UTC';
};
