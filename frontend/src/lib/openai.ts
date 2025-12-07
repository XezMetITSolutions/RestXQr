const DEEPL_API_KEY = '57d297fb-b5e5-492d-bebc-6cca1dfb8fa6:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

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

  try {
    const params = new URLSearchParams();
    params.append('auth_key', DEEPL_API_KEY);
    params.append('text', text);
    params.append('target_lang', targetLangCode);

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    }

    return text;
  } catch (error) {
    console.error('DeepL translation failed:', error);
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
