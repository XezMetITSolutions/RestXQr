import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return NextResponse.json({ 
        translatedText: text, 
        error: 'API key not configured' 
      }, { status: 200 });
    }

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

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation API error:', error);
    // Return original text instead of "Translation failed"
    return NextResponse.json({ 
      translatedText: text, 
      error: 'Translation service unavailable' 
    }, { status: 200 });
  }
}
