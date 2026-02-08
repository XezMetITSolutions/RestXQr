'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /admin/restaurants/add -> /admin/restaurants/create yönlendirmesi.
 * Ana sayfadaki link add kullandığı için bu route 404 vermesin diye eklendi.
 */
export default function AdminRestaurantsAddPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/restaurants/create');
  }, [router]);
  return (
    <div className="min-h-[200px] flex items-center justify-center text-gray-500">
      Yönlendiriliyor...
    </div>
  );
}
