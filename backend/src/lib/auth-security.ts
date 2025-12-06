import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT güvenlik ayarları
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Güvenli token oluşturma
export function createSecureToken(payload: any): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    { 
      ...payload, 
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID() // Unique token ID
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    }
  );

  const refreshToken = jwt.sign(
    { 
      userId: payload.userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID()
    },
    JWT_SECRET,
    { 
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256'
    }
  );

  return { accessToken, refreshToken };
}

// Token doğrulama
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Token yenileme
export function refreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
  const decoded = verifyToken(refreshToken);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return createSecureToken({ userId: decoded.userId });
}

// Token blacklist (logout için)
const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  const decoded = jwt.decode(token) as any;
  if (decoded?.jti) {
    tokenBlacklist.add(decoded.jti);
  }
}

export function isTokenBlacklisted(token: string): boolean {
  const decoded = jwt.decode(token) as any;
  return decoded?.jti ? tokenBlacklist.has(decoded.jti) : false;
}

// Güvenli şifre hash'leme
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Şifre doğrulama
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
}

// Rate limiting için IP tracking
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Güvenli random string oluşturma
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// CSRF token oluşturma
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF token doğrulama
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
}
