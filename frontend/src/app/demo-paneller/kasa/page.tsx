'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DemoCashierContent from '@/components/DemoCashierContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function KasaPanel() {
  const router = useRouter();
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];

    if (browserLang === 'tr') {
      router.replace('/tr/demo-paneller/kasa');
    } else if (browserLang === 'de') {
      router.replace('/de/demo-paneller/kasa');
    } else {
      // Default to English for other languages
      setLanguage('en');
    }
  }, [router, setLanguage]);

  return <DemoCashierContent />;
}
