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
        // TODO: Backend'den user preferences çek
        // const userPrefs = await apiService.getUserPreferences();
        // if (userPrefs.success && userPrefs.data.language) {
        //   setCurrentLanguage(userPrefs.data.language);
        //   return;
        // }

        // Geçici: localStorage fallback (TODO: remove when backend ready)
        const savedLanguage = localStorage.getItem('masapp-language');
        if (savedLanguage && Object.keys(supportedLanguages).includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          return;
        }

        // If no saved preference, detect from IP location
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const detectedLanguage = await detectLanguageFromLocation(data.country_code);
        
        setCurrentLanguage(detectedLanguage);
        // TODO: Backend'e kaydet
        // await apiService.updateUserPreferences({ language: detectedLanguage });
        localStorage.setItem('masapp-language', detectedLanguage); // Geçici fallback
      } catch (error) {
        console.error('Language detection failed:', error);
        // Fallback to Turkish
        setCurrentLanguage('Turkish');
        localStorage.setItem('masapp-language', 'Turkish'); // Geçici fallback
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
        'Russian': 'Russian'
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
