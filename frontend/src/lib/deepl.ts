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
  sourceLanguage = 'TR',
  apiKey
}: TranslateOptions): Promise<string> {
  if (!text) return '';

  const deeplKey = apiKey || process.env.NEXT_PUBLIC_DEEPL_API_KEY;
  const deeplTarget = LANGUAGE_CODE_MAP[targetLanguage];

  if (!deeplKey || !deeplTarget) {
    return text;
  }

  try {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('target_lang', deeplTarget);
    if (sourceLanguage && LANGUAGE_CODE_MAP[sourceLanguage]) {
      params.append('source_lang', LANGUAGE_CODE_MAP[sourceLanguage]);
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `DeepL-Auth-Key ${deeplKey}`
      },
      body: params.toString()
    });

    if (!response.ok) {
      console.error('DeepL response error:', response.status, await response.text());
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

