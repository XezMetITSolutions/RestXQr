'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';

export default function Admin2FADebug() {
  const router = useRouter();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiTests, setApiTests] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [codeTestResult, setCodeTestResult] = useState<any>(null);

  const API_URL = 'https://masapp-backend.onrender.com';

  useEffect(() => {
    loadTokenInfo();
  }, []);

  const loadTokenInfo = () => {
    const token = localStorage.getItem('admin_access_token');
    const user = localStorage.getItem('admin_user');
    const refreshToken = localStorage.getItem('admin_refresh_token');

    setTokenInfo({
      hasToken: !!token,
      token: token || 'Token yok',
      tokenLength: token?.length || 0,
      hasUser: !!user,
      user: user ? JSON.parse(user) : null,
      hasRefreshToken: !!refreshToken
    });
  };

  const testAPI = async (endpoint: string, method: string = 'GET') => {
    setLoading(true);
    const token = localStorage.getItem('admin_access_token');

    try {
      const options: any = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (method === 'POST') {
        options.body = JSON.stringify({});
      }

      const response = await fetch(`${API_URL}${endpoint}`, options);
      const data = await response.json();

      setApiTests((prev: any) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          ok: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error: any) {
      setApiTests((prev: any) => ({
        ...prev,
        [endpoint]: {
          status: 'ERROR',
          ok: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearStorage = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_refresh_token');
    loadTokenInfo();
    setApiTests({});
  };

  const testAuthCode = async () => {
    if (!authCode || authCode.length !== 6) {
      setCodeTestResult({ success: false, message: '6 haneli kod girin' });
      return;
    }

    setLoading(true);
    setCodeTestResult(null);

    try {
      const user = tokenInfo?.user;
      if (!user?.id) {
        setCodeTestResult({ success: false, message: 'Kullanıcı bilgisi bulunamadı' });
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          token: authCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCodeTestResult({
          success: true,
          message: '✅ Kod doğru! Authenticator düzgün çalışıyor.',
          data: data
        });
      } else {
        setCodeTestResult({
          success: false,
          message: `❌ Kod yanlış: ${data.message || 'Bilinmeyen hata'}`,
          error: data.error,
          data: data
        });
      }
    } catch (error: any) {
      setCodeTestResult({
        success: false,
        message: '❌ Bağlantı hatası',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <button onClick={() => router.push('/admin/settings')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaShieldAlt className="mr-3 text-blue-600" />
                2FA Debug Panel
              </h1>
              <p className="text-gray-600">Authentication ve 2FA test araçları</p>
            </div>
          </div>

          {/* Token Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">LocalStorage Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Access Token</span>
                  {tokenInfo?.hasToken ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaTimesCircle className="text-red-600" />
                  )}
                </div>
                {tokenInfo?.hasToken && (
                  <>
                    <div className="text-xs font-mono bg-white p-2 rounded border mb-2 break-all">
                      {tokenInfo.token.substring(0, 50)}...
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(tokenInfo.token)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        <FaCopy className="inline mr-1" />
                        Kopyala
                      </button>
                      <span className="text-xs text-gray-600">Uzunluk: {tokenInfo.tokenLength}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">User Data</span>
                  {tokenInfo?.hasUser ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaTimesCircle className="text-red-600" />
                  )}
                </div>
                {tokenInfo?.hasUser && (
                  <div className="text-xs">
                    <div><strong>ID:</strong> {tokenInfo.user?.id}</div>
                    <div><strong>Username:</strong> {tokenInfo.user?.username}</div>
                    <div><strong>Email:</strong> {tokenInfo.user?.email}</div>
                    <div><strong>Role:</strong> {tokenInfo.user?.role}</div>
                    <div><strong>2FA:</strong> {tokenInfo.user?.twoFactorEnabled ? 'Aktif' : 'Pasif'}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={loadTokenInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Yenile
              </button>
              <button
                onClick={clearStorage}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                LocalStorage Temizle
              </button>
            </div>
          </div>

          {/* Authenticator Code Test */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Authenticator Kod Testi</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-gray-700 mb-4">
                Google Authenticator'daki 6 haneli kodu girin ve doğru olup olmadığını test edin.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 border rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
                <button
                  onClick={testAuthCode}
                  disabled={loading || authCode.length !== 6}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Test Ediliyor...' : 'Kodu Test Et'}
                </button>
              </div>
              
              {codeTestResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  codeTestResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start">
                    {codeTestResult.success ? (
                      <FaCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-xl mr-3 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        codeTestResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {codeTestResult.message}
                      </p>
                      {codeTestResult.error && (
                        <p className="text-sm text-red-700 mt-2">
                          <strong>Hata:</strong> {codeTestResult.error}
                        </p>
                      )}
                      {codeTestResult.data && (
                        <details className="mt-2">
                          <summary className="text-sm cursor-pointer text-gray-600 hover:text-gray-800">
                            Detaylı Response
                          </summary>
                          <pre className="text-xs bg-white p-2 rounded border mt-2 overflow-auto max-h-32">
                            {JSON.stringify(codeTestResult.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">API Test Araçları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => testAPI('/api/admin/2fa/status', 'GET')}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Test: GET /api/admin/2fa/status
              </button>
              <button
                onClick={() => testAPI('/api/admin/2fa/setup', 'POST')}
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Test: POST /api/admin/2fa/setup
              </button>
              <button
                onClick={() => testAPI('/api/admin/dashboard/stats', 'GET')}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test: GET /api/admin/dashboard/stats
              </button>
              <button
                onClick={() => testAPI('/api/admin/auth/me', 'GET')}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test: GET /api/admin/auth/me
              </button>
            </div>
          </div>

          {/* API Results */}
          {Object.keys(apiTests).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">API Test Sonuçları</h2>
              <div className="space-y-4">
                {Object.entries(apiTests).map(([endpoint, result]: [string, any]) => (
                  <div key={endpoint} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold font-mono text-sm">{endpoint}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="text-xs overflow-auto max-h-64">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Kullanım Talimatları</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>LocalStorage Bilgileri:</strong> Tarayıcıda saklanan token ve kullanıcı bilgilerini gösterir</li>
              <li>• <strong>API Test Araçları:</strong> Backend endpoint'lerini test eder ve yanıtları gösterir</li>
              <li>• <strong>401 Hatası:</strong> Token geçersiz veya süresi dolmuş - Tekrar login yapın</li>
              <li>• <strong>403 Hatası:</strong> Yetki yok - Kullanıcı rolü kontrol edin</li>
              <li>• <strong>500 Hatası:</strong> Backend hatası - Server loglarını kontrol edin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
