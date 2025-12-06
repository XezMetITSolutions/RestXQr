'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelsPage() {
  const router = useRouter();

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de') {
      router.push('/de/panels');
    } else {
      router.push('/tr/panels'); // Default to Turkish
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}