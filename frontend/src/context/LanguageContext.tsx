'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translateText, detectLanguageFromLocation, supportedLanguages } from '@/lib/openai';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  translate: (text: string) => Promise<string>;
  isLoading: boolean;
  translationCache: Map<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('Turkish');
  const [isLoading, setIsLoading] = useState(false);
  const [translationCache] = useState(new Map<string, string>());
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side

    const detectUserLanguage = async () => {
      try {
        // Only use saved preference in localStorage
        const savedLanguage = localStorage.getItem('masapp-language');
        if (savedLanguage && Object.keys(supportedLanguages).includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          return;
        }

        // Always default to Turkish for new visitors
        setCurrentLanguage('Turkish');
        localStorage.setItem('masapp-language', 'Turkish');
      } catch (error) {
        console.error('Language detection failed:', error);
        setCurrentLanguage('Turkish');
      }
    };

    detectUserLanguage();
  }, [isClient]);
  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('masapp-language', language);
    // Clear cache when language changes
    translationCache.clear();
  };

  const translate = async (text: string): Promise<string> => {
    // If current language is Turkish, return original text
    if (currentLanguage === 'Turkish') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${currentLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsLoading(true);
    try {
      // Convert language name to API-friendly format
      const languageMap: { [key: string]: string } = {
        'English': 'English',
        'German': 'German',
        'Arabic': 'Arabic',
        'Russian': 'Russian',
        'Chinese': 'Chinese'
      };

      const apiLanguage = languageMap[currentLanguage] || 'English';
      console.log('Translating:', text, 'to:', apiLanguage);
      const translatedText = await translateText(text, apiLanguage);
      console.log('Translation result:', translatedText);
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      // Return original text instead of "Translation failed"
      return text;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        translate,
        isLoading,
        translationCache,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
