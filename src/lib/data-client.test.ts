import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHolidays } from './data-client';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('public data retries', () => {
  it('retries one transient HTTP failure', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        Response.json([{ id: 'holiday-1', name: 'Tahun Baru' }]),
      );
    vi.stubGlobal('fetch', fetchMock);

    const request = getHolidays(2026);
    await vi.advanceTimersByTimeAsync(250);

    await expect(request).resolves.toEqual([
      { id: 'holiday-1', name: 'Tahun Baru' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns the second failure after a single retry', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        Response.json(
          { code: 'INFRASTRUCTURE', message: 'Layanan belum tersedia.' },
          { status: 503 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const request = getHolidays(2026);
    const rejection = expect(request).rejects.toMatchObject({
      status: 503,
      message: 'Layanan belum tersedia.',
    });
    await vi.advanceTimersByTimeAsync(250);

    await rejection;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
