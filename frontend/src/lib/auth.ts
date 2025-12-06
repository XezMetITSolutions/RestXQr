export function verifyToken(token: string): any {
  // Simple token verification for demo purposes
  if (token === 'demo-token' || token === 'demo-access-token') {
    return { role: 'super_admin', id: 'demo-user' };
  }
  return null;
}

export function generateToken(): string {
  return 'demo-token';
}

export function generateTokens(user?: any): { accessToken: string; refreshToken: string } {
  return {
    accessToken: 'demo-access-token',
    refreshToken: 'demo-refresh-token'
  };
}

export function hashPassword(password: string): string {
  // Simple password hashing for demo purposes
  return btoa(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  // Simple password strength check for demo purposes
  return password.length >= 6;
}