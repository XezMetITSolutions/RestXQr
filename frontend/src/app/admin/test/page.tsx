'use client';

import AdminLayout from '@/components/admin/AdminLayout';

export default function TestPage() {
  return (
    <AdminLayout title="Test Sayfası" description="Admin paneli test sayfası">
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Test Sayfası</h1>
          <p className="text-gray-600">Bu sayfa çalışıyor! Admin paneli erişilebilir.</p>
          <a href="/admin" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}

