// Environment configuration
export const ENV_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'masapp-super-secret-key-change-in-production-2024-secure',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
} as const;

// Cookie configuration based on environment
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: ENV_CONFIG.IS_PRODUCTION,
  sameSite: ENV_CONFIG.IS_PRODUCTION ? 'strict' : 'lax' as const,
  path: '/',
} as const;
