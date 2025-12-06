'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageContext';

function RedirectContent() {
  const router = useRouter();

  useEffect(() => {
    // Tarayıcı dilini kontrol et
    const browserLang = navigator.language || navigator.languages[0];

    if (browserLang.startsWith('de')) {
      router.replace('/de');
    } else {
      router.replace('/tr');
    }
  }, [router]);

  // Yönlendirme sırasında boş bir sayfa veya yükleniyor göstergesi gösterilebilir
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <RedirectContent />
    </LanguageProvider>
  );
}