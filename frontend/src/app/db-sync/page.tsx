'use client';

import { useState } from 'react';

export default function DBSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const syncDatabase = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('https://masapp-backend.onrender.com/api/debug/sync-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(JSON.stringify(data, null, 2));
      } else {
        setError(`Hata: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setError(`Bağlantı hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Veritabanı Senkronizasyonu
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Bu sayfa veritabanı şemasını güncelleyerek eksik kolonları ekler.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            <strong>Not:</strong> Bu işlem <code className="bg-gray-100 px-2 py-1 rounded">approved</code> kolonunu orders tablosuna ekleyecek.
          </p>
        </div>

        <button
          onClick={syncDatabase}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Güncelleniyor...' : 'Veritabanını Güncelle'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Başarılı!</h2>
            <pre className="text-sm text-green-700 overflow-auto">
              {result}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Hata!</h2>
            <pre className="text-sm text-red-700 overflow-auto whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Alternatif Yöntem</h3>
          <p className="text-sm text-yellow-700">
            Eğer bu sayfa çalışmazsa, Render dashboard'dan backend servisini manuel restart edin.
          </p>
        </div>
      </div>
    </div>
  );
}
