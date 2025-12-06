// Translation service using OpenAI API

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Geçici olarak çeviri API'sini devre dışı bırakıyoruz
  // API endpoint'i henüz oluşturulmadı
  console.log('Translation disabled - API endpoint not available');
  return text; // Orijinal metni döndür
}

export async function detectLanguageFromLocation(countryCode: string): Promise<string> {
  const languageMap: { [key: string]: string } = {
    'TR': 'Turkish',
    'AT': 'German',
    'DE': 'German',
    'CH': 'German',
    'US': 'English',
    'GB': 'English',
    'CA': 'English',
    'AU': 'English',
    'SA': 'Arabic',
    'AE': 'Arabic',
    'EG': 'Arabic',
    'RU': 'Russian',
    'BY': 'Russian',
    'KZ': 'Russian',
  };

  return languageMap[countryCode] || 'English';
}

export const supportedLanguages = {
  'Turkish': { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  'German': { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  'English': { code: 'en', name: 'English', flag: '🇺🇸' },
  'Arabic': { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  'Russian': { code: 'ru', name: 'Русский', flag: '🇷🇺' },
};
