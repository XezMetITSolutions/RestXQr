'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import apiService from '@/services/api';

export default function QRDebugPage() {
  const { authenticatedRestaurant, isAuthenticated, initializeAuth } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState(1);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authenticatedRestaurant) {
      loadDebugInfo();
    }
  }, [authenticatedRestaurant]);

  const loadDebugInfo = async () => {
    if (!authenticatedRestaurant?.id) return;

    setLoading(true);
    try {
      // Restaurant bilgilerini backend'den çek
      const restaurantResponse = await apiService.getRestaurantById(authenticatedRestaurant.id);
      
      // Mevcut QR tokenları çek
      let qrTokensResponse = null;
      try {
        qrTokensResponse = await apiService.getRestaurantQRTokens(authenticatedRestaurant.id);
      } catch (e) {
        console.error('QR tokens error:', e);
      }

      setDebugInfo({
        authenticatedRestaurant,
        backendRestaurant: restaurantResponse?.data || null,
        qrTokens: qrTokensResponse?.data || null,
        timestamp: new Date().toISOString(),
        windowLocation: typeof window !== 'undefined' ? {
          hostname: window.location.hostname,
          origin: window.location.origin,
          href: window.location.href,
          subdomain: window.location.hostname.split('.')[0]
        } : null
      });
    } catch (error) {
      console.error('Load debug info error:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        authenticatedRestaurant
      });
    } finally {
      setLoading(false);
    }
  };

  const testQRGeneration = async () => {
    if (!authenticatedRestaurant?.id) {
      alert('Restoran bilgisi bulunamadı!');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing QR generation:', {
        restaurantId: authenticatedRestaurant.id,
        restaurantName: authenticatedRestaurant.name,
        restaurantUsername: authenticatedRestaurant.username,
        tableNumber
      });

      const response = await apiService.generateQRToken({
        restaurantId: authenticatedRestaurant.id,
        tableNumber: tableNumber,
        duration: 24
      });

      console.log('📦 Backend response:', response);

      setTestResult({
        success: response.success,
        data: response.data,
        fullResponse: response,
        timestamp: new Date().toISOString(),
        expectedUrl: authenticatedRestaurant.username 
          ? `https://${authenticatedRestaurant.username}.restxqr.com/menu/?t=${response.data?.token}&table=${tableNumber}`
          : 'N/A (no username)',
        actualUrl: response.data?.qrUrl || 'N/A'
      });

      // Debug info'yu yenile
      await loadDebugInfo();
    } catch (error) {
      console.error('❌ Test QR generation error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lütfen önce giriş yapın</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔍 QR Kod Debug Sayfası
          </h1>

          {/* Restaurant Bilgileri */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Restoran Bilgileri</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Frontend Store (authenticatedRestaurant):</p>
                  <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                    {JSON.stringify(authenticatedRestaurant, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Backend Response:</p>
                  <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                    {debugInfo?.backendRestaurant 
                      ? JSON.stringify(debugInfo.backendRestaurant, null, 2)
                      : 'Yükleniyor...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Window Location */}
          {debugInfo?.windowLocation && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">🌐 Window Location</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="p-3 bg-white rounded border text-xs overflow-auto">
                  {JSON.stringify(debugInfo.windowLocation, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Mevcut QR Tokenlar */}
          {debugInfo?.qrTokens && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">📱 Mevcut QR Tokenlar</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {Array.isArray(debugInfo.qrTokens) && debugInfo.qrTokens.length > 0 ? (
                    debugInfo.qrTokens.map((token: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Masa:</span> {token.tableNumber}
                          </div>
                          <div>
                            <span className="font-medium">Token:</span> {token.token?.substring(0, 20)}...
                          </div>
                          <div>
                            <span className="font-medium">QR URL:</span>
                            <div className="text-xs text-blue-600 break-all mt-1">
                              {token.qrUrl || 'N/A'}
                            </div>
                          </div>
                        </div>
                        {token.qrUrl && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Beklenen:</span>{' '}
                            <span className="text-green-600">
                              https://{authenticatedRestaurant?.username || 'N/A'}.restxqr.com/menu/?t={token.token}&table={token.tableNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Henüz QR token yok</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test QR Generation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🧪 QR Kod Oluşturma Testi</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-4 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masa Numarası
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={testQRGeneration}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Test Ediliyor...' : 'QR Kod Oluştur (Test)'}
                </button>
              </div>

              {testResult && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Test Sonucu:</h3>
                  <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Durum:</span>{' '}
                        <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                          {testResult.success ? '✅ Başarılı' : '❌ Başarısız'}
                        </span>
                      </div>
                      {testResult.error && (
                        <div>
                          <span className="font-medium">Hata:</span>{' '}
                          <span className="text-red-600">{testResult.error}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Beklenen URL:</span>
                        <div className="mt-1 p-2 bg-white rounded border text-xs break-all">
                          {testResult.expectedUrl}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Backend'den Gelen URL:</span>
                        <div className={`mt-1 p-2 bg-white rounded border text-xs break-all ${
                          testResult.expectedUrl === testResult.actualUrl ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResult.actualUrl}
                        </div>
                      </div>
                      {testResult.expectedUrl !== testResult.actualUrl && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          ⚠️ URL'ler eşleşmiyor! Backend yanlış subdomain kullanıyor olabilir.
                        </div>
                      )}
                      <div className="mt-4">
                        <span className="font-medium">Tam Response:</span>
                        <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                          {JSON.stringify(testResult.fullResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🔧 Tüm Debug Bilgileri</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <button
                onClick={loadDebugInfo}
                disabled={loading}
                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Yenileniyor...' : 'Yenile'}
              </button>
              <pre className="p-4 bg-white rounded border text-xs overflow-auto max-h-96">
                {debugInfo ? JSON.stringify(debugInfo, null, 2) : 'Yükleniyor...'}
              </pre>
            </div>
          </div>

          {/* Özet */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Kontrol Edilecekler:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Frontend store'daki <code>authenticatedRestaurant.username</code> değeri doğru mu?</li>
              <li>Backend'den gelen restaurant bilgisindeki <code>username</code> değeri doğru mu?</li>
              <li>Backend'den dönen <code>qrUrl</code> doğru subdomain'i kullanıyor mu?</li>
              <li>Window location'daki subdomain doğru mu?</li>
              <li>Test sonucunda beklenen ve gerçek URL'ler eşleşiyor mu?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
