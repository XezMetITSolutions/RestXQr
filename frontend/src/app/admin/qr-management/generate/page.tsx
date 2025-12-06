'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaQrcode, FaCheck } from 'react-icons/fa';

export default function AdminQRGenerate() {
  const [tableCount, setTableCount] = useState(10);
  const [generated, setGenerated] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setGenerated(true);
    setTimeout(() => router.push('/admin/qr-management'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center"><FaQrcode className="mr-2"/> QR Oluştur</h1>
          <Link href="/admin/qr-management" className="text-sm text-blue-600 hover:underline">QR Yönetimine Dön</Link>
        </div>
        {generated ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <FaCheck className="mr-2"/> QR kodları oluşturuldu. Yönlendiriliyorsunuz...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Masa Sayısı</label>
              <input type="number" min={1} value={tableCount} onChange={(e) => setTableCount(parseInt(e.target.value || '1', 10))} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Oluştur</button>
          </div>
        )}
      </div>
    </div>
  );
}


