'use client';

import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPerformance() {
  return (
    <AdminLayout title="Performans" description="Sistem performans metrikleri">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Performans</h1>
        <p className="text-gray-600">Sistem performans metrikleri ve optimizasyon önerileri yakında.</p>
      </div>
    </AdminLayout>
  );
}


