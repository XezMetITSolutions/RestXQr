'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PanelsContent from '@/components/PanelsContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function InternalPanelsPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    // Internal route - only accessible via direct link
    // Set language if not set
    if (!language) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'de') {
        setLanguage('de');
      } else if (browserLang === 'en') {
        setLanguage('en');
      } else {
        setLanguage('tr');
      }
    }
  }, [router, language, setLanguage]);

  return <PanelsContent />;
}
