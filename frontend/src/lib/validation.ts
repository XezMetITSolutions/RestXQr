// Bu dosya, external dependency'leri (zod, isomorphic-dompurify) kaldırmak için basitleştirilmiştir.
// Gerçek bir uygulamada daha kapsamlı validasyon ve sanitizasyon kütüphaneleri kullanılmalıdır.

// XSS koruması için basit HTML temizleme
export function sanitizeHtml(html: string): string {
  // Demo: Basit HTML temizleme (gerçek uygulamada DOMPurify gibi kütüphaneler kullanılmalı)
  return html.replace(/<[^>]*>?/gm, '');
}

// SQL injection koruması için basit string temizleme
export function sanitizeString(input: string): string {
  // Demo: Basit string temizleme
  return input.replace(/[<>'"`;\\]/g, '').trim();
}

// Demo amaçlı basit bir validasyon fonksiyonu
export function safeValidate<T>(schema: any, data: unknown): { success: boolean; data?: T; error?: string } {
  // Her zaman başarılı döndür (demo amaçlı)
  return { success: true, data: data as T };
}

// Demo email validasyonu
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Demo şifre validasyonu
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Şifre en az 6 karakter olmalıdır');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Demo telefon validasyonu
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Demo URL validasyonu
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Demo sayı validasyonu
export function validateNumber(value: string | number): boolean {
  return !isNaN(Number(value));
}

// Demo pozitif sayı validasyonu
export function validatePositiveNumber(value: string | number): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}