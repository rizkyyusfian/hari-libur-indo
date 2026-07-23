import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const holidayInputSchema = z
  .object({
    date: z.iso.date(),
    name: z.string().trim().min(1).max(200),
    type: z.enum(['national', 'regional']),
    region_id: z.preprocess(emptyToUndefined, z.uuid().optional()),
    description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
    is_cuti_bersama: z.boolean().default(false),
    document_ids: z.array(z.uuid()).default([]),
    updated_at: z.iso.datetime({ offset: true }).optional(),
  })
  .superRefine((value, context) => {
    if (value.type === 'regional' && !value.region_id) {
      context.addIssue({
        code: 'custom',
        path: ['region_id'],
        message: 'Wilayah wajib dipilih untuk hari libur regional.',
      });
    }
    if (value.type === 'national' && value.region_id) {
      context.addIssue({
        code: 'custom',
        path: ['region_id'],
        message: 'Hari libur nasional tidak boleh memiliki wilayah.',
      });
    }
  });

export type HolidayInput = z.infer<typeof holidayInputSchema>;

export const documentMetadataSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    year: z.number().int().min(2020).max(2100),
    type: z.enum(['national', 'regional']),
    region_id: z.preprocess(emptyToUndefined, z.uuid().optional()),
    document_kind: z.enum(['original', 'revision', 'addendum', 'cancellation']),
    published_date: z.preprocess(emptyToUndefined, z.iso.date().optional()),
    summary: z.preprocess(emptyToUndefined, z.string().trim().max(4000).optional()),
    supersedes_document_id: z.preprocess(emptyToUndefined, z.uuid().optional()),
  })
  .superRefine((value, context) => {
    if (value.type === 'regional' && !value.region_id) {
      context.addIssue({ code: 'custom', path: ['region_id'], message: 'Wilayah wajib dipilih.' });
    }
    if (value.type === 'national' && value.region_id) {
      context.addIssue({
        code: 'custom',
        path: ['region_id'],
        message: 'Dokumen nasional tidak boleh memiliki wilayah.',
      });
    }
  });
