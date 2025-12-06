'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Subdomain'den geliyorsa business login'e yönlendir
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    const mainDomains = ['localhost', 'www'];
    
    if (!mainDomains.includes(subdomain) && hostname.includes('.')) {
      // Subdomain varsa business login'e yönlendir
      router.replace('/isletme-giris');
    } else {
      // Ana domain ise business login'e yönlendir
      router.replace('/isletme-giris');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Yönlendiriliyor...</h2>
        <p className="text-gray-600">İşletme giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}
