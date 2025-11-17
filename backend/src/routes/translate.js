const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// OpenAI client oluştur
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

// Translate endpoint
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

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
    if (!process.env.OPENAI_API_KEY && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return res.status(200).json({
        translatedText: text,
        error: 'API key not configured'
      });
    }

    // OpenAI ile çeviri yap
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text to ${targetLanguage}. Only return the translated text, nothing else. Maintain the original formatting and tone. If the text is already in ${targetLanguage}, return it as is.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0]?.message?.content || text;

    return res.json({
      translatedText: translatedText.trim()
    });
  } catch (error) {
    console.error('Translation API error:', error);
    // Hata durumunda orijinal metni döndür
    return res.status(200).json({
      translatedText: req.body.text || '',
      error: 'Translation service unavailable'
    });
  }
});

module.exports = router;

