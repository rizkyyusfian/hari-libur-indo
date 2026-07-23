import { describe, expect, it } from 'vitest';
import { holidayInputSchema } from './validation';

const national = {
  date: '2026-08-17',
  name: 'Hari Kemerdekaan',
  type: 'national' as const,
  is_cuti_bersama: false,
};

describe('holidayInputSchema', () => {
  it('accepts a national holiday without a region', () => {
    expect(holidayInputSchema.parse(national).document_ids).toEqual([]);
  });

  it('requires a region for regional holidays', () => {
    expect(() => holidayInputSchema.parse({ ...national, type: 'regional' })).toThrow(
      'Wilayah wajib dipilih',
    );
  });

  it('forbids a region on national holidays', () => {
    expect(() =>
      holidayInputSchema.parse({
        ...national,
        region_id: '5ba3cc19-19ed-4c71-9b4a-a3578a6c2594',
      }),
    ).toThrow('tidak boleh memiliki wilayah');
  });
});
