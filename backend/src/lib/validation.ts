import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// XSS koruması için HTML temizleme
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

// SQL injection koruması için string temizleme
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML karakterleri
    .replace(/['"]/g, '') // SQL injection karakterleri
    .replace(/[;\\]/g, '') // Komut karakterleri
    .trim();
}

// Email validasyonu
export const emailSchema = z.string()
  .trim()
  .email('Geçerli bir email adresi giriniz')
  .max(255, 'Email adresi çok uzun')
  .transform(email => email.toLowerCase());

// Şifre validasyonu
export const passwordSchema = z.string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(128, 'Şifre çok uzun')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Şifre en az bir küçük harf, bir büyük harf, bir rakam ve bir özel karakter içermelidir');

// Kullanıcı kayıt validasyonu
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim çok uzun')
    .transform(name => sanitizeString(name)),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  role: z.enum(['admin', 'manager', 'staff', 'customer'])
    .default('customer')
});

// Kullanıcı güncelleme validasyonu
export const userUpdateSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim çok uzun')
    .transform(name => sanitizeString(name))
    .optional(),
  email: emailSchema.optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  role: z.enum(['admin', 'manager', 'staff', 'customer'])
    .optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
    .optional()
});

// Restoran validasyonu
export const restaurantSchema = z.object({
  name: z.string()
    .min(2, 'Restoran adı en az 2 karakter olmalıdır')
    .max(100, 'Restoran adı çok uzun')
    .transform(name => sanitizeString(name)),
  category: z.string()
    .min(2, 'Kategori en az 2 karakter olmalıdır')
    .max(50, 'Kategori çok uzun')
    .transform(category => sanitizeString(category)),
  address: z.string()
    .min(10, 'Adres en az 10 karakter olmalıdır')
    .max(500, 'Adres çok uzun')
    .transform(address => sanitizeString(address)),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası giriniz'),
  email: emailSchema,
  description: z.string()
    .max(1000, 'Açıklama çok uzun')
    .transform(desc => sanitizeHtml(desc))
    .optional(),
  ownerId: z.string().uuid('Geçerli bir sahip ID giriniz')
});

// Bildirim validasyonu
export const notificationSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success', 'system']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string()
    .min(1, 'Başlık gereklidir')
    .max(200, 'Başlık çok uzun')
    .transform(title => sanitizeString(title)),
  message: z.string()
    .min(1, 'Mesaj gereklidir')
    .max(1000, 'Mesaj çok uzun')
    .transform(message => sanitizeHtml(message)),
  recipientType: z.enum(['all', 'admin', 'restaurant', 'user']),
  recipientId: z.string().uuid().optional(),
  channel: z.enum(['email', 'sms', 'push', 'in_app']),
  scheduledAt: z.string().datetime().optional()
});

// Sistem ayarı validasyonu
export const systemSettingSchema = z.object({
  key: z.string()
    .min(1, 'Ayar anahtarı gereklidir')
    .max(100, 'Ayar anahtarı çok uzun')
    .regex(/^[A-Z_]+$/, 'Ayar anahtarı sadece büyük harf ve alt çizgi içerebilir'),
  value: z.string()
    .max(1000, 'Ayar değeri çok uzun'),
  category: z.enum(['general', 'security', 'email', 'payment', 'notification', 'api']),
  sensitive: z.boolean().default(false)
});

// Arama validasyonu
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Arama terimi gereklidir')
    .max(100, 'Arama terimi çok uzun')
    .transform(query => sanitizeString(query)),
  type: z.enum(['all', 'users', 'restaurants', 'orders', 'notifications']).optional(),
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

// ID validasyonu
export const idSchema = z.string().uuid('Geçerli bir ID giriniz');

// Pagination validasyonu
export const paginationSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Güvenli validasyon wrapper
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { 
      success: false, 
      error: 'Validation error' 
    };
  }
}

// API response wrapper
export function createSecureResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, code?: string) {
  return {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  };
}
