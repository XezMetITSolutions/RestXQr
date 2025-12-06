import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@/types';
import { ENV_CONFIG } from '@/config/env';

const JWT_SECRET = ENV_CONFIG.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
  iat: number;
  exp: number;
}

// JWT Token oluşturma
export function generateTokens(user: User): AuthTokens {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  return { accessToken, refreshToken };
}

// JWT Token doğrulama
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Şifre hashleme
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Şifre doğrulama
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Token'dan kullanıcı bilgilerini çıkarma
export function getUserFromToken(token: string): JWTPayload | null {
  return verifyToken(token);
}

// Rol kontrolü
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Admin rolü kontrolü
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

// Restoran sahibi/admin kontrolü
export function isRestaurantUser(userRole: UserRole): boolean {
  return ['restaurant_owner', 'restaurant_admin'].includes(userRole);
}

// Token süresi kontrolü
export function isTokenExpired(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

// Güvenli şifre oluşturma
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// 2FA kod oluşturma
export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email doğrulama
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Güçlü şifre kontrolü
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}
