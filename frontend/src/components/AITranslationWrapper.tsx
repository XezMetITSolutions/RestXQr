'use client';

import { useState, useEffect } from 'react';
import useLanguageStore from '@/store/useLanguageStore';

interface AITranslationWrapperProps {
  children: (translatedText: string, isTranslating: boolean) => React.ReactNode;
  text: string;
  context?: string;
  fallback?: string;
}

export default function AITranslationWrapper({ 
  children, 
  text, 
  context, 
  fallback 
}: AITranslationWrapperProps) {
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const { language, tAI } = useLanguageStore();

  useEffect(() => {
    const translateText = async () => {
      if (!text || text.trim() === '') {
        setTranslatedText(fallback || text);
        return;
      }

      // Eğer zaten hedef dilde ise çeviri yapma
      if (language === 'en' && /^[a-zA-Z\s.,!?]+$/.test(text)) {
        setTranslatedText(text);
        return;
      }
      if (language === 'tr' && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s.,!?]+$/.test(text)) {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      
      try {
        const result = await tAI(text, context);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, language, context, fallback, tAI]);

  return <>{children(translatedText, isTranslating)}</>;
}

// Hook versiyonu
export const useAITranslation = (text: string, context?: string, fallback?: string) => {
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const { language, tAI } = useLanguageStore();

  useEffect(() => {
    const translateText = async () => {
      if (!text || text.trim() === '') {
        setTranslatedText(fallback || text);
        return;
      }

      // Eğer zaten hedef dilde ise çeviri yapma
      if (language === 'en' && /^[a-zA-Z\s.,!?]+$/.test(text)) {
        setTranslatedText(text);
        return;
      }
      if (language === 'tr' && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s.,!?]+$/.test(text)) {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      
      try {
        const result = await tAI(text, context);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, language, context, fallback, tAI]);

  return { translatedText, isTranslating };
};
