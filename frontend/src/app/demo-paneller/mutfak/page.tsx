'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DemoKitchenContent from '@/components/DemoKitchenContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function MutfakPanel() {
  const router = useRouter();
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];

    if (browserLang === 'tr') {
      router.replace('/tr/demo-paneller/mutfak');
    } else if (browserLang === 'de') {
      router.replace('/de/demo-paneller/mutfak');
    } else {
      // Default to English for other languages
      setLanguage('en');
    }
  }, [router, setLanguage]);

  return <DemoKitchenContent />;
}