import { beforeEach, describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken } from './session';

describe('admin session token', () => {
  beforeEach(() => {
    process.env.PASSWORD = 'a secure shared password';
    process.env.ADMIN_SESSION_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  it('verifies a newly issued token', async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });

  it('expires after twelve hours', async () => {
    const now = new Date(Date.now() - 13 * 60 * 60 * 1000);
    const token = await createSessionToken(now);
    expect(
      await verifySessionToken(token),
    ).toBe(false);
  });

  it('invalidates a token when PASSWORD rotates', async () => {
    const token = await createSessionToken();
    process.env.PASSWORD = 'a different secure password';
    expect(await verifySessionToken(token)).toBe(false);
  });
});
