const DEEPL_API_KEY = process.env.NEXT_PUBLIC_DEEPL_API_KEY || '';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Özel çeviriler - DeepL'in döndürdüğü çevirileri override eder
const customTranslations: { [key: string]: { [key: string]: string } } = {
  'DE': { // Almanca için özel çeviriler
    'İstasyon': 'Station',
    'İstasyonu': 'Station',
    'İstasyonlar': 'Stationen',
    'İstasyonları': 'Stationen',
    'Mutfak İstasyonu': 'Küchen-Station',
    'Mutfak İstasyonları': 'Küchen-Stationen',
    'Tatlı İstasyonu': 'Dessert-Station',
    'Soğuk İstasyon': 'Kalte Station',
    'Makarna İstasyonu': 'Pasta-Station',
    'Izgara İstasyonu': 'Grill-Station',
    'Mantı İstasyonu': 'Manti-Station',
    'Ramen İstasyonu': 'Ramen-Station',
    'Kavurma İstasyonu': 'Kavurma-Station',
    'Tüm İstasyonlar': 'Alle Stationen',
    'Yeni İstasyon': 'Neue Station',
    'İstasyon Ekle': 'Station hinzufügen',
    'İstasyon Adı': 'Station Name',
    'İstasyon Seçin': 'Station wählen',
    'Panel Yönetimi ve Yetkilendirme': 'Panel-Verwaltung & Berechtigungen',
    'Personel Yönetimi': 'Personalverwaltung',
    'Yetkilendirme Ayarları': 'Berechtigungseinstellungen',
    'Personel Listesi': 'Personalliste',
    'Personel Ekle': 'Mitarbeiter hinzufügen',
    'Yetki Ayarları': 'Berechtigungen',
    'Garson Paneli': 'Kellner-Panel',
    'Kasa Paneli': 'Kassen-Panel',
    'Mutfak Paneli': 'Küchen-Panel',
    'Yönetim Paneli': 'Management-Panel',
    'Admin Paneli': 'Admin-Panel'
  }
};

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Map language names to DeepL language codes
  const langMap: { [key: string]: string } = {
    'English': 'EN',
    'German': 'DE',
    'Turkish': 'TR',
    'Arabic': 'AR',
    'Russian': 'RU',
    'French': 'FR',
    'Spanish': 'ES',
    'Italian': 'IT'
  };

  const targetLangCode = langMap[targetLanguage];
  if (!targetLangCode) {
    console.warn(`Unsupported language for DeepL: ${targetLanguage}`);
    return text;
  }

  // Önce custom translations sözlüğüne bak
  if (customTranslations[targetLangCode] && customTranslations[targetLangCode][text]) {
    console.log(`✅ Custom translation used for "${text}": ${customTranslations[targetLangCode][text]}`);
    return customTranslations[targetLangCode][text];
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage: targetLangCode,
        sourceLanguage: 'TR' // Assuming source is usually Turkish in this app context, or let API auto-detect if omitted
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    }

    // API response format mismatch fallback
    return data.translatedText || text;

  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
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
