import { describe, expect, it } from 'vitest';
import { verifyPassword } from './password';

describe('verifyPassword', () => {
  it('accepts the exact configured password', () => {
    expect(verifyPassword('correct horse battery staple', 'correct horse battery staple')).toBe(true);
  });

  it('rejects a different password without depending on input length', () => {
    expect(verifyPassword('wrong', 'correct horse battery staple')).toBe(false);
  });
});
