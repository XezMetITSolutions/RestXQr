const express = require('express');
const router = express.Router();

// DeepL dil kodları mapping
const languageToDeepLCode = {
  'English': 'EN',
  'Turkish': 'TR',
  'German': 'DE',
  'French': 'FR',
  'Spanish': 'ES',
  'Italian': 'IT',
  'Russian': 'RU',
  'Arabic': 'AR',
  'Portuguese': 'PT',
  'Dutch': 'NL',
  'Polish': 'PL',
  'Japanese': 'JA',
  'Chinese': 'ZH'
};

// Translate endpoint - DeepL API kullanıyor
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    console.log('🔍 Translate request:', { text: text?.substring(0, 50), targetLanguage });

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Metin gerekli'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Hedef dil gerekli'
      });
    }

    // API key kontrolü
    const deeplApiKey = process.env.DEEPL_API_KEY || process.env.NEXT_PUBLIC_DEEPL_API_KEY;
    if (!deeplApiKey) {
      console.error('❌ DeepL API key not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DEEPL')));
      return res.status(200).json({
        translatedText: text,
        error: 'API key not configured'
      });
    }

    console.log('✅ DeepL API key found:', deeplApiKey.substring(0, 10) + '...');

    // DeepL dil kodunu al
    const targetLangCode = languageToDeepLCode[targetLanguage] || 'EN';
    console.log('🌍 Target language:', targetLanguage, '->', targetLangCode);
    
    // DeepL API endpoint (free plan ':fx' ile biter, pro plan normal key)
    const isFree = deeplApiKey.endsWith(':fx');
    const apiUrl = isFree 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    console.log('📡 DeepL API URL:', apiUrl, '(Free:', isFree + ')');

    // DeepL API'ye istek gönder
    const formData = new URLSearchParams();
    formData.append('auth_key', deeplApiKey);
    formData.append('text', text);
    formData.append('target_lang', targetLangCode);
    // source_lang belirtmezsek DeepL otomatik algılar

    console.log('📤 Sending request to DeepL...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    console.log('📥 DeepL response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepL API error:', response.status, errorText);
      return res.status(200).json({
        translatedText: text,
        error: `DeepL API error: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json();
    console.log('📊 DeepL response data:', JSON.stringify(data).substring(0, 200));
    
    const translatedText = data.translations?.[0]?.text || text;
    console.log('✅ Translation result:', translatedText.substring(0, 50) + '...');

    return res.json({
      translatedText: translatedText.trim()
    });
  } catch (error) {
    console.error('❌ Translation API error:', error);
    console.error('Error stack:', error.stack);
    // Hata durumunda orijinal metni döndür
    return res.status(200).json({
      translatedText: req.body?.text || '',
      error: `Translation service unavailable: ${error.message}`
    });
  }
});

module.exports = router;

