'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DemoWaiterContent from '@/components/DemoWaiterContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function GarsonPanel() {
  const router = useRouter();
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];

    if (browserLang === 'tr') {
      router.replace('/tr/demo-paneller/garson');
    } else if (browserLang === 'de') {
      router.replace('/de/demo-paneller/garson');
    } else {
      // Default to English for other languages
      setLanguage('en');
    }
  }, [router, setLanguage]);

  return <DemoWaiterContent />;
}
