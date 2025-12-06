'use client';

import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDocumentation() {
  return (
    <AdminLayout title="Dokümantasyon" description="Sistem dokümantasyonu">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dokümantasyon</h1>
        <p className="text-gray-600">Yönetici kılavuzları ve kullanım dokümanları burada yer alacak.</p>
      </div>
    </AdminLayout>
  );
}


