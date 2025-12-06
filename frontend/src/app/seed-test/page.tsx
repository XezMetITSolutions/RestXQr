'use client';

import { useState } from 'react';

export default function SeedTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedMenu = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://masapp-backend.onrender.com/api/admin/seed-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantUsername: 'aksaray'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Bilinmeyen hata');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🌱 Menü Verilerini Ekle
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Bu sayfa Aksaray restoranı için menü verilerini ekler:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>8 kategori (Çorbalar, Ana Yemekler, Izgara, Pizza, Salatalar, İçecekler, Tatlılar, Kahvaltı)</li>
            <li>Her kategoride 3-4 ürün</li>
            <li>Toplam 25+ ürün</li>
            <li>Her ürüne resim ve detaylı bilgi</li>
          </ul>
        </div>

        <button
          onClick={handleSeedMenu}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '⏳ Veriler ekleniyor...' : '🌱 Menü Verilerini Ekle'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-semibold mb-2">✅ Başarılı!</h3>
            <p className="text-green-700">
              {result.message}
            </p>
            <div className="mt-2 text-sm text-green-600">
              <p>Kategoriler: {result.data?.categories}</p>
              <p>Ürünler: {result.data?.items}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">❌ Hata!</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-semibold mb-2">📝 Not:</h3>
          <p className="text-blue-700 text-sm">
            Bu işlem mevcut menü verilerini siler ve yeni veriler ekler. 
            İşlem tamamlandıktan sonra menü sayfasını yenileyerek sonuçları görebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
