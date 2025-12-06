interface TranslationCache {
  [key: string]: {
    translations: { [language: string]: string };
    timestamp: number;
  };
}

interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage: string;
  context?: string;
  useCache?: boolean;
}

class AITranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat
  private readonly API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('translation_cache');
        if (cached) {
          this.cache = JSON.parse(cached);
        }
      } catch (error) {
        console.error('Cache yüklenirken hata:', error);
      }
    }
  }

  private saveCache() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('translation_cache', JSON.stringify(this.cache));
      } catch (error) {
        console.error('Cache kaydedilirken hata:', error);
      }
    }
  }

  private generateCacheKey(text: string, targetLanguage: string, context?: string): string {
    return `${text}_${targetLanguage}_${context || ''}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async translate(
    text: string,
    options: TranslationOptions
  ): Promise<string> {
    const { targetLanguage, sourceLanguage = 'auto', context, useCache = true } = options;
    
    if (!text || !targetLanguage) {
      return text;
    }

    const cacheKey = this.generateCacheKey(text, targetLanguage, context);
    
    // Cache kontrolü
    if (useCache && this.cache[cacheKey] && this.isCacheValid(this.cache[cacheKey].timestamp)) {
      return this.cache[cacheKey].translations[targetLanguage] || text;
    }

    try {
      // Demo çeviri - gerçek API çağrısı yerine
      const translatedText = this.getDemoTranslation(text, targetLanguage, context);
      
      // Cache'e kaydet
      if (useCache) {
        this.cache[cacheKey] = {
          translations: {
            [targetLanguage]: translatedText
          },
          timestamp: Date.now()
        };
        this.saveCache();
      }

      return translatedText;
    } catch (error) {
      console.error('Çeviri hatası:', error);
      return text; // Hata durumunda orijinal metni döndür
    }
  }

  private getDemoTranslation(text: string, targetLanguage: string, context?: string): string {
    // Demo çeviri verileri
    const demoTranslations: { [key: string]: { [key: string]: string } } = {
      'Ana Sayfa': { en: 'Home', tr: 'Ana Sayfa' },
      'Menü': { en: 'Menu', tr: 'Menü' },
      'Siparişler': { en: 'Orders', tr: 'Siparişler' },
      'Garson Paneli': { en: 'Waiter Panel', tr: 'Garson Paneli' },
      'Kasa': { en: 'Cashier', tr: 'Kasa' },
      'Raporlar': { en: 'Reports', tr: 'Raporlar' },
      'Ayarlar': { en: 'Settings', tr: 'Ayarlar' },
      'Çıkış': { en: 'Logout', tr: 'Çıkış' },
      'Giriş': { en: 'Login', tr: 'Giriş' },
      'Kayıt Ol': { en: 'Register', tr: 'Kayıt Ol' },
      'E-posta': { en: 'Email', tr: 'E-posta' },
      'Şifre': { en: 'Password', tr: 'Şifre' },
      'Ad': { en: 'Name', tr: 'Ad' },
      'Soyad': { en: 'Surname', tr: 'Soyad' },
      'Telefon': { en: 'Phone', tr: 'Telefon' },
      'Adres': { en: 'Address', tr: 'Adres' },
      'Şehir': { en: 'City', tr: 'Şehir' },
      'Ülke': { en: 'Country', tr: 'Ülke' },
      'Posta Kodu': { en: 'Postal Code', tr: 'Posta Kodu' },
      'Kaydet': { en: 'Save', tr: 'Kaydet' },
      'İptal': { en: 'Cancel', tr: 'İptal' },
      'Sil': { en: 'Delete', tr: 'Sil' },
      'Düzenle': { en: 'Edit', tr: 'Düzenle' },
      'Ekle': { en: 'Add', tr: 'Ekle' },
      'Ara': { en: 'Search', tr: 'Ara' },
      'Filtrele': { en: 'Filter', tr: 'Filtrele' },
      'Sırala': { en: 'Sort', tr: 'Sırala' },
      'Yenile': { en: 'Refresh', tr: 'Yenile' },
      'Yükle': { en: 'Load', tr: 'Yükle' },
      'İndir': { en: 'Download', tr: 'İndir' },
      'Yazdır': { en: 'Print', tr: 'Yazdır' },
      'Paylaş': { en: 'Share', tr: 'Paylaş' },
      'Kopyala': { en: 'Copy', tr: 'Kopyala' },
      'Yapıştır': { en: 'Paste', tr: 'Yapıştır' },
      'Kes': { en: 'Cut', tr: 'Kes' },
      'Geri Al': { en: 'Undo', tr: 'Geri Al' },
      'Yinele': { en: 'Redo', tr: 'Yinele' },
      'Seç': { en: 'Select', tr: 'Seç' },
      'Seçili': { en: 'Selected', tr: 'Seçili' },
      'Tümünü Seç': { en: 'Select All', tr: 'Tümünü Seç' },
      'Seçimi Kaldır': { en: 'Deselect', tr: 'Seçimi Kaldır' },
      'Temizle': { en: 'Clear', tr: 'Temizle' },
      'Sıfırla': { en: 'Reset', tr: 'Sıfırla' },
      'Geri': { en: 'Back', tr: 'Geri' },
      'İleri': { en: 'Forward', tr: 'İleri' },
      'Yukarı': { en: 'Up', tr: 'Yukarı' },
      'Aşağı': { en: 'Down', tr: 'Aşağı' },
      'Sol': { en: 'Left', tr: 'Sol' },
      'Sağ': { en: 'Right', tr: 'Sağ' },
      'Başla': { en: 'Start', tr: 'Başla' },
      'Durdur': { en: 'Stop', tr: 'Durdur' },
      'Devam Et': { en: 'Continue', tr: 'Devam Et' },
      'Bitir': { en: 'Finish', tr: 'Bitir' },
      'Tamam': { en: 'OK', tr: 'Tamam' },
      'Evet': { en: 'Yes', tr: 'Evet' },
      'Hayır': { en: 'No', tr: 'Hayır' },
      'Onayla': { en: 'Confirm', tr: 'Onayla' },
      'Reddet': { en: 'Reject', tr: 'Reddet' },
      'Kabul Et': { en: 'Accept', tr: 'Kabul Et' },
      'Kabul Etme': { en: 'Decline', tr: 'Kabul Etme' },
      'Gönder': { en: 'Send', tr: 'Gönder' },
      'Al': { en: 'Receive', tr: 'Al' },
      'Göster': { en: 'Show', tr: 'Göster' },
      'Gizle': { en: 'Hide', tr: 'Gizle' },
      'Aç': { en: 'Open', tr: 'Aç' },
      'Kapat': { en: 'Close', tr: 'Kapat' },
      'Kilit': { en: 'Lock', tr: 'Kilit' },
      'Kilidi Aç': { en: 'Unlock', tr: 'Kilidi Aç' },
      'Bağlan': { en: 'Connect', tr: 'Bağlan' },
      'Bağlantıyı Kes': { en: 'Disconnect', tr: 'Bağlantıyı Kes' },
      'Başarılı': { en: 'Success', tr: 'Başarılı' },
      'Hata': { en: 'Error', tr: 'Hata' },
      'Uyarı': { en: 'Warning', tr: 'Uyarı' },
      'Bilgi': { en: 'Info', tr: 'Bilgi' },
      'Dikkat': { en: 'Attention', tr: 'Dikkat' },
      'Önemli': { en: 'Important', tr: 'Önemli' },
      'Acil': { en: 'Urgent', tr: 'Acil' },
      'Normal': { en: 'Normal', tr: 'Normal' },
      'Yüksek': { en: 'High', tr: 'Yüksek' },
      'Düşük': { en: 'Low', tr: 'Düşük' },
      'Orta': { en: 'Medium', tr: 'Orta' },
      'Küçük': { en: 'Small', tr: 'Küçük' },
      'Büyük': { en: 'Large', tr: 'Büyük' },
      'Geniş': { en: 'Wide', tr: 'Geniş' },
      'Dar': { en: 'Narrow', tr: 'Dar' },
      'Uzun': { en: 'Long', tr: 'Uzun' },
      'Kısa': { en: 'Short', tr: 'Kısa' },
      'Yeni': { en: 'New', tr: 'Yeni' },
      'Eski': { en: 'Old', tr: 'Eski' },
      'Güncel': { en: 'Current', tr: 'Güncel' },
      'Son': { en: 'Last', tr: 'Son' },
      'İlk': { en: 'First', tr: 'İlk' },
      'Sonraki': { en: 'Next', tr: 'Sonraki' },
      'Önceki': { en: 'Previous', tr: 'Önceki' },
      'Başlangıç': { en: 'Beginning', tr: 'Başlangıç' },
      'Bitiş': { en: 'End', tr: 'Bitiş' },
      'Merkez': { en: 'Center', tr: 'Merkez' },
      'Kenar': { en: 'Edge', tr: 'Kenar' },
      'Köşe': { en: 'Corner', tr: 'Köşe' },
      'Üst': { en: 'Top', tr: 'Üst' },
      'Alt': { en: 'Bottom', tr: 'Alt' },
      'İç': { en: 'Inside', tr: 'İç' },
      'Dış': { en: 'Outside', tr: 'Dış' },
      'Ön': { en: 'Front', tr: 'Ön' },
      'Arka': { en: 'Back', tr: 'Arka' },
      'Yan': { en: 'Side', tr: 'Yan' }
    };

    // Demo çeviri döndür
    if (demoTranslations[text]) {
      return demoTranslations[text][targetLanguage] || text;
    }

    // Basit çeviri simülasyonu
    if (targetLanguage === 'en') {
      return `${text} [EN]`;
    } else if (targetLanguage === 'tr') {
      return `${text} [TR]`;
    }

    return text;
  }

  clearCache() {
    this.cache = {};
    this.saveCache();
  }

  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }
}

export const aiTranslationService = new AITranslationService();
export default aiTranslationService;