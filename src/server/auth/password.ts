import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function verifyPassword(supplied: string, configured: string): boolean {
  return timingSafeEqual(digest(supplied), digest(configured));
}
