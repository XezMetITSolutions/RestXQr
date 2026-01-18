'use client';

import { useState } from 'react';

export default function DeleteAllOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [confirmText, setConfirmText] = useState('');

  const deleteAllOrders = async () => {
    if (confirmText !== 'SIL') {
      alert('Lütfen onay için "SIL" yazın');
      return;
    }

    setLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('https://masapp-backend.onrender.com/api/debug/delete-all-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(JSON.stringify(data, null, 2));
        setConfirmText('');
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
        <h1 className="text-3xl font-bold mb-6 text-red-600">
          ⚠️ Tüm Siparişleri Sil
        </h1>
        
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-red-800 font-bold mb-2">
            DİKKAT: Bu işlem GERİ ALINAMAZ!
          </p>
          <p className="text-red-700 mb-2">
            Bu sayfa sistemdeki <strong>TÜM siparişleri</strong> silecek:
          </p>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            <li>Masalı siparişler</li>
            <li>Masasız siparişler</li>
            <li>Tüm sipariş itemları</li>
            <li>Pending, preparing, ready, completed - tüm durumlar</li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Onaylamak için "SIL" yazın:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="SIL"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg font-bold"
          />
        </div>

        <button
          onClick={deleteAllOrders}
          disabled={loading || confirmText !== 'SIL'}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-colors ${
            loading || confirmText !== 'SIL'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loading ? 'Siliniyor...' : 'TÜM SİPARİŞLERİ SİL'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Tamamlandı!</h2>
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
      </div>
    </div>
  );
}
