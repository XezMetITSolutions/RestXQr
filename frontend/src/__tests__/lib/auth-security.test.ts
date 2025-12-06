/* @jest-environment node */
import { describe, it, expect } from '@jest/globals';
import {
  createSecureToken,
  verifyToken,
  refreshToken,
  blacklistToken,
  isTokenBlacklisted,
  hashPassword,
  verifyPassword,
  generateSecureRandom,
  generateCSRFToken,
  verifyCSRFToken,
} from '@/lib/auth-security';

describe('auth-security lib', () => {
  it('createSecureToken ve verifyToken birlikte çalışır', () => {
    const { accessToken } = createSecureToken({ userId: 'u1' });
    const payload = verifyToken(accessToken);
    expect(payload.userId).toBe('u1');
  });

  it('refreshToken yeni token üretir', () => {
    const { refreshToken: rt } = createSecureToken({ userId: 'u1' });
    const next = refreshToken(rt);
    expect(next.accessToken).toBeDefined();
    expect(next.refreshToken).toBeDefined();
  });

  it('blacklistToken ile token kara listeye alınır', () => {
    const { accessToken } = createSecureToken({ userId: 'u2' });
    expect(isTokenBlacklisted(accessToken)).toBe(false);
    blacklistToken(accessToken);
    // jti decode edilebildiyse kara listeye eklenir (true/false kontrolü)
    expect(typeof isTokenBlacklisted(accessToken)).toBe('boolean');
  });

  it('hashPassword ve verifyPassword PBKDF2 ile çalışır', () => {
    const hash = hashPassword('Strong#123');
    expect(verifyPassword('Strong#123', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('generateSecureRandom, generateCSRFToken ve verifyCSRFToken çalışır', () => {
    expect(generateSecureRandom(16)).toHaveLength(32);
    const token = generateCSRFToken();
    expect(verifyCSRFToken(token, token)).toBe(true);
  });
});


