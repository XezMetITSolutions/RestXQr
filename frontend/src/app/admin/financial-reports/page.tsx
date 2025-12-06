'use client';

import AdminLayout from '@/components/admin/AdminLayout';

export default function FinancialReportsPage() {
  return (
    <AdminLayout title="Mali Raporlar" description="Finansal raporlar ve analizler">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Reports</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Financial reports will be implemented here.</p>
        </div>
      </div>
    </AdminLayout>
  );
}