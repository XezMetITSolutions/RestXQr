'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useLanguageStore from '@/store/useLanguageStore';

export default function PanelsPage() {
  const router = useRouter();
  const { language } = useLanguageStore();

  useEffect(() => {
    // First check if user has selected a language
    if (language) {
      router.push(`/${language}/panels`);
    } else {
      // Fall back to browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'de') {
        router.push('/de/panels');
      } else if (browserLang === 'en') {
        router.push('/en/panels');
      } else {
        router.push('/tr/panels'); // Default to Turkish
      }
    }
  }, [router, language]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}