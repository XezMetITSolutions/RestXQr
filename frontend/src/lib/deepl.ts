const LANGUAGE_CODE_MAP: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
  ru: 'RU',
  ar: 'AR',
  zh: 'ZH'
};

interface TranslateOptions {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  apiKey?: string;
}

export async function translateWithDeepL({
  text,
  targetLanguage,
  sourceLanguage = 'tr',
  apiKey
}: TranslateOptions): Promise<string> {
  if (!text) return '';

  const deeplTarget = LANGUAGE_CODE_MAP[targetLanguage];

  if (!deeplTarget) {
    return text;
  }

  const sourceLangCode = sourceLanguage ? LANGUAGE_CODE_MAP[sourceLanguage] : undefined;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        targetLanguage: deeplTarget,
        sourceLanguage: sourceLangCode,
        apiKey
      })
    });

    if (!response.ok) {
      console.error('Translation proxy response error:', response.status);
      return text;
    }

    const data = await response.json();
    const translated = data?.translations?.[0]?.text;
    return translated || text;
  } catch (error) {
    console.error('DeepL translate error:', error);
    return text;
  }
}

export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CODE_MAP);
}

