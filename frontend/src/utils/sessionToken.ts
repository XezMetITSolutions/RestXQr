// Session token yönetimi - Her QR taraması için benzersiz token

export interface SessionToken {
  token: string;
  restaurantId: string;
  tableNumber: number;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
}

const TOKEN_VALIDITY_MINUTES = 30; // Token 30 dakika geçerli
const STORAGE_KEY = 'qr-session-token';

// Benzersiz token oluştur
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${random2}`;
}

// Token oluştur ve kaydet
export function createSessionToken(restaurantId: string, tableNumber: number): SessionToken {
  const now = Date.now();
  const token: SessionToken = {
    token: generateSessionToken(),
    restaurantId,
    tableNumber,
    createdAt: now,
    expiresAt: now + (TOKEN_VALIDITY_MINUTES * 60 * 1000),
    isUsed: false
  };
  
  // SessionStorage'a kaydet (tab kapanınca silinir)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token));
  
  return token;
}

// Token'ı getir
export function getSessionToken(): SessionToken | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as SessionToken;
  } catch {
    return null;
  }
}

// Token geçerliliğini kontrol et
export function validateToken(tokenString: string): { valid: boolean; reason?: string } {
  const storedToken = getSessionToken();
  
  if (!storedToken) {
    return { valid: false, reason: 'no_token' };
  }
  
  if (storedToken.token !== tokenString) {
    return { valid: false, reason: 'invalid_token' };
  }
  
  if (storedToken.isUsed) {
    return { valid: false, reason: 'token_used' };
  }
  
  const now = Date.now();
  if (now > storedToken.expiresAt) {
    return { valid: false, reason: 'token_expired' };
  }
  
  return { valid: true };
}

// Token'ı kullanıldı olarak işaretle (sipariş verildiğinde)
export function markTokenAsUsed(): void {
  const token = getSessionToken();
  if (token) {
    token.isUsed = true;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token));
  }
}

// Token'ı temizle
export function clearSessionToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// Token kalan süresini getir (dakika cinsinden)
export function getRemainingTime(): number {
  const token = getSessionToken();
  if (!token) return 0;
  
  const now = Date.now();
  const remaining = Math.max(0, token.expiresAt - now);
  return Math.ceil(remaining / 60000); // Dakika cinsinden
}
