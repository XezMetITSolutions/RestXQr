interface TranslationCache {
  [key: string]: {
    [language: string]: string;
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
      const cached = localStorage.getItem('ai-translation-cache');
      if (cached) {
        try {
          this.cache = JSON.parse(cached);
        } catch (error) {
          console.warn('Translation cache load error:', error);
          this.cache = {};
        }
      }
    }
  }

  private saveCache() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-translation-cache', JSON.stringify(this.cache));
    }
  }

  private getCacheKey(text: string, targetLanguage: string, context?: string): string {
    return `${text}_${targetLanguage}_${context || 'default'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private async callOpenAI(text: string, options: TranslationOptions): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = `Sen bir profesyonel çevirmensin. Restoran/cafe uygulaması için metinleri çeviriyorsun.

Kurallar:
1. Sadece çeviriyi döndür, açıklama yapma
2. Restoran terminolojisini doğru kullan
3. Kısa ve net çeviriler yap
4. Türkçe karakterleri doğru kullan
5. Menü öğeleri için uygun terminoloji kullan

${options.context ? `Bağlam: ${options.context}` : ''}`;

    const userPrompt = `Metni "${options.targetLanguage}" diline çevir: "${text}"`;

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || text;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async translate(
    text: string, 
    options: TranslationOptions
  ): Promise<string> {
    if (!text || text.trim() === '') return text;

    const cacheKey = this.getCacheKey(text, options.targetLanguage, options.context);
    const cached = this.cache[cacheKey];

    // Cache kontrolü
    if (options.useCache !== false && cached && this.isCacheValid(cached.timestamp)) {
      return cached[options.targetLanguage] || text;
    }

    try {
      const translatedText = await this.callOpenAI(text, options);
      
      // Cache'e kaydet
      this.cache[cacheKey] = {
        [options.targetLanguage]: translatedText,
        timestamp: Date.now()
      };
      this.saveCache();

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback: Basit kelime çevirileri
      return this.fallbackTranslation(text, options.targetLanguage);
    }
  }

  private fallbackTranslation(text: string, targetLanguage: string): string {
    // Basit fallback çevirileri
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'Menu': { tr: 'Menü', en: 'Menu' },
      'Cart': { tr: 'Sepet', en: 'Cart' },
      'Order': { tr: 'Sipariş', en: 'Order' },
      'Table': { tr: 'Masa', en: 'Table' },
      'Waiter': { tr: 'Garson', en: 'Waiter' },
      'Total': { tr: 'Toplam', en: 'Total' },
      'Price': { tr: 'Fiyat', en: 'Price' },
      'Add to Cart': { tr: 'Sepete Ekle', en: 'Add to Cart' },
      'Call Waiter': { tr: 'Garson Çağır', en: 'Call Waiter' },
      'Payment': { tr: 'Ödeme', en: 'Payment' },
      'Bill': { tr: 'Hesap', en: 'Bill' },
      'Water': { tr: 'Su', en: 'Water' },
      'Clean': { tr: 'Temizle', en: 'Clean' },
      'Help': { tr: 'Yardım', en: 'Help' },
      'Settings': { tr: 'Ayarlar', en: 'Settings' },
      'Dashboard': { tr: 'Panel', en: 'Dashboard' },
      'Login': { tr: 'Giriş', en: 'Login' },
      'Logout': { tr: 'Çıkış', en: 'Logout' },
      'Save': { tr: 'Kaydet', en: 'Save' },
      'Cancel': { tr: 'İptal', en: 'Cancel' },
      'Delete': { tr: 'Sil', en: 'Delete' },
      'Edit': { tr: 'Düzenle', en: 'Edit' },
      'Add': { tr: 'Ekle', en: 'Add' },
      'Remove': { tr: 'Kaldır', en: 'Remove' },
      'Search': { tr: 'Ara', en: 'Search' },
      'Filter': { tr: 'Filtrele', en: 'Filter' },
      'Sort': { tr: 'Sırala', en: 'Sort' },
      'Loading': { tr: 'Yükleniyor', en: 'Loading' },
      'Error': { tr: 'Hata', en: 'Error' },
      'Success': { tr: 'Başarılı', en: 'Success' },
      'Warning': { tr: 'Uyarı', en: 'Warning' },
      'Info': { tr: 'Bilgi', en: 'Info' },
      'Yes': { tr: 'Evet', en: 'Yes' },
      'No': { tr: 'Hayır', en: 'No' },
      'OK': { tr: 'Tamam', en: 'OK' },
      'Close': { tr: 'Kapat', en: 'Close' },
      'Open': { tr: 'Aç', en: 'Open' },
      'Next': { tr: 'İleri', en: 'Next' },
      'Previous': { tr: 'Geri', en: 'Previous' },
      'Continue': { tr: 'Devam Et', en: 'Continue' },
      'Back': { tr: 'Geri', en: 'Back' },
      'Home': { tr: 'Ana Sayfa', en: 'Home' },
      'Profile': { tr: 'Profil', en: 'Profile' },
      'Account': { tr: 'Hesap', en: 'Account' },
      'User': { tr: 'Kullanıcı', en: 'User' },
      'Admin': { tr: 'Yönetici', en: 'Admin' },
      'Staff': { tr: 'Personel', en: 'Staff' },
      'Customer': { tr: 'Müşteri', en: 'Customer' },
      'Guest': { tr: 'Misafir', en: 'Guest' },
      'Welcome': { tr: 'Hoş Geldiniz', en: 'Welcome' },
      'Thank you': { tr: 'Teşekkürler', en: 'Thank you' },
      'Please': { tr: 'Lütfen', en: 'Please' },
      'Sorry': { tr: 'Özür dilerim', en: 'Sorry' },
      'Excuse me': { tr: 'Pardon', en: 'Excuse me' },
      'Good morning': { tr: 'Günaydın', en: 'Good morning' },
      'Good afternoon': { tr: 'İyi öğleden sonra', en: 'Good afternoon' },
      'Good evening': { tr: 'İyi akşamlar', en: 'Good evening' },
      'Good night': { tr: 'İyi geceler', en: 'Good night' },
    };

    const lowerText = text.toLowerCase().trim();
    const translation = fallbackTranslations[text] || fallbackTranslations[lowerText];
    
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }

    // Eğer fallback'te de yoksa orijinal metni döndür
    return text;
  }

  // Toplu çeviri için
  async translateBatch(
    texts: string[], 
    options: TranslationOptions
  ): Promise<string[]> {
    const promises = texts.map(text => this.translate(text, options));
    return Promise.all(promises);
  }

  // Cache temizleme
  clearCache(): void {
    this.cache = {};
    this.saveCache();
  }

  // Cache istatistikleri
  getCacheStats(): { totalEntries: number; memoryUsage: string } {
    const totalEntries = Object.keys(this.cache).length;
    const memoryUsage = (JSON.stringify(this.cache).length / 1024).toFixed(2) + ' KB';
    return { totalEntries, memoryUsage };
  }
}

// Singleton instance
export const aiTranslationService = new AITranslationService();

// Hook benzeri kullanım için
export const useAITranslation = () => {
  return {
    translate: aiTranslationService.translate.bind(aiTranslationService),
    translateBatch: aiTranslationService.translateBatch.bind(aiTranslationService),
    clearCache: aiTranslationService.clearCache.bind(aiTranslationService),
    getCacheStats: aiTranslationService.getCacheStats.bind(aiTranslationService),
  };
};

export default aiTranslationService;
