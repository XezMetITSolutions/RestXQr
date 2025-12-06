import { describe, it, expect } from '@jest/globals';
import {
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
  isAdmin,
  isRestaurantUser,
  isValidEmail,
  isStrongPassword,
} from '@/lib/auth';

describe('auth lib', () => {
  const user = {
    id: 'u1',
    email: 'admin@test.com',
    role: 'super_admin',
  } as any;

  it('generateTokens ve verifyToken birlikte çalışır', () => {
    const { accessToken } = generateTokens(user);
    const payload = verifyToken(accessToken);
    expect(payload?.email).toBe('admin@test.com');
  });

  it('hashPassword ve verifyPassword birlikte çalışır', async () => {
    const hash = await hashPassword('Aa1!aaaa');
    const ok = await verifyPassword('Aa1!aaaa', hash);
    expect(ok).toBe(true);
  });

  it('isAdmin ve isRestaurantUser doğru rol kontrolü yapar', () => {
    expect(isAdmin('super_admin' as any)).toBe(true);
    expect(isRestaurantUser('restaurant_admin' as any)).toBe(true);
    expect(isRestaurantUser('customer' as any)).toBe(false);
  });

  it('isValidEmail ve isStrongPassword doğru çalışır', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isStrongPassword('Aa1!aaaa')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });
});


