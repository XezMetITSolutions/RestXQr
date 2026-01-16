'use client';

import { useState } from 'react';

export default function LoginDebugPage() {
  const [username, setUsername] = useState('xezmet');
  const [password, setPassword] = useState('01528797Mb##');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResults(null);

    const testResults: any = {
      timestamp: new Date().toISOString(),
      credentials: {
        username,
        password: password.substring(0, 3) + '***',
      },
      tests: []
    };

    try {
      // Test 1: 2FA Status kontrolü
      testResults.tests.push({
        name: '2FA Status API',
        status: 'testing...'
      });

      try {
        const statusResponse = await fetch('https://masapp-backend.onrender.com/api/admin/2fa/status');
        const statusData = await statusResponse.json();
        testResults.tests[0] = {
          name: '2FA Status API',
          status: statusResponse.ok ? 'success' : 'failed',
          statusCode: statusResponse.status,
          data: statusData
        };
      } catch (error) {
        testResults.tests[0] = {
          name: '2FA Status API',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 2: 2FA Login denemesi
      testResults.tests.push({
        name: '2FA Login API (with dummy token)',
        status: 'testing...'
      });

      try {
        const loginResponse = await fetch('https://masapp-backend.onrender.com/api/admin/2fa/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            token: '123456'
          }),
        });
        const loginData = await loginResponse.json();
        testResults.tests[1] = {
          name: '2FA Login API (with dummy token)',
          status: loginResponse.ok ? 'success' : 'failed',
          statusCode: loginResponse.status,
          data: loginData
        };
      } catch (error) {
        testResults.tests[1] = {
          name: '2FA Login API (with dummy token)',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 3: Backend health check
      testResults.tests.push({
        name: 'Backend Health Check',
        status: 'testing...'
      });

      try {
        const healthResponse = await fetch('https://masapp-backend.onrender.com/health');
        const healthData = await healthResponse.json();
        testResults.tests[2] = {
          name: 'Backend Health Check',
          status: healthResponse.ok ? 'success' : 'failed',
          statusCode: healthResponse.status,
          data: healthData
        };
      } catch (error) {
        testResults.tests[2] = {
          name: 'Backend Health Check',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 4: Credential validation (client-side)
      testResults.tests.push({
        name: 'Credential Validation (Client-Side)',
        status: username === 'xezmet' && password === '01528797Mb##' ? 'success' : 'failed',
        data: {
          usernameMatch: username === 'xezmet',
          passwordMatch: password === '01528797Mb##',
          usernameLength: username.length,
          passwordLength: password.length
        }
      });

    } catch (error) {
      testResults.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Login Debug Sayfası</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono"
              />
            </div>

            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Test Ediliyor...' : 'Testi Başlat'}
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Sonuçları</h2>
            
            <div className="mb-4 text-sm text-gray-400">
              <p>Zaman: {new Date(results.timestamp).toLocaleString('tr-TR')}</p>
            </div>

            <div className="space-y-4">
              {results.tests.map((test: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{test.name}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      test.status === 'success' ? 'bg-green-600' :
                      test.status === 'failed' ? 'bg-red-600' :
                      test.status === 'error' ? 'bg-orange-600' :
                      'bg-gray-600'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  
                  {test.statusCode && (
                    <p className="text-sm text-gray-400 mb-2">
                      HTTP Status: {test.statusCode}
                    </p>
                  )}
                  
                  {test.data && (
                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                  
                  {test.error && (
                    <div className="bg-red-900/30 border border-red-600 rounded p-3 mt-2">
                      <p className="text-red-400 text-sm">Error: {test.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {results.error && (
              <div className="mt-4 bg-red-900/30 border border-red-600 rounded p-4">
                <p className="text-red-400 font-semibold">Genel Hata:</p>
                <p className="text-red-300 text-sm mt-1">{results.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-900/30 border border-blue-600 rounded-lg p-4">
          <h3 className="font-semibold mb-2">ℹ️ Bilgi</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Bu sayfa login işlemini test etmek için oluşturulmuştur</li>
            <li>• Backend API: https://masapp-backend.onrender.com</li>
            <li>• Beklenen kullanıcı adı: xezmet</li>
            <li>• Beklenen şifre: 01528797Mb##</li>
            <li>• 2FA token (test): 123456</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/admin/login" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Normal Login Sayfasına Dön
          </a>
        </div>
      </div>
    </div>
  );
}
