'use client';

import { useState } from 'react';

export default function BackendAPIDebugPage() {
    const [restaurantId, setRestaurantId] = useState('37b0322a-e11f-4ef1-b108-83be310aaf4d');
    const [backendStatus, setBackendStatus] = useState<any>(null);
    const [checkingBackend, setCheckingBackend] = useState(false);
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const testEndpoint = async (name: string, url: string, options: RequestInit = {}) => {
        setLoading(name);
        try {
            const staffToken = localStorage.getItem('staff_token');
            const restaurantToken = localStorage.getItem('restaurant_token');
            const authToken = staffToken || restaurantToken;

            const headers: any = {
                'Content-Type': 'application/json',
                'X-Subdomain': window.location.hostname.split('.')[0]
            };

            if (authToken) {
                headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
            }

            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });

            let data;
            try {
                data = await response.json();
            } catch {
                data = await response.text();
            }

            setResults((prev: any) => ({
                ...prev,
                [name]: {
                    status: response.status,
                    ok: response.ok,
                    data,
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (error: any) {
            setResults((prev: any) => ({
                ...prev,
                [name]: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            }));
        } finally {
            setLoading(null);
        }
    };

    const tests = [
        {
            name: 'Get Restaurant by ID',
            url: `${API_URL}/restaurants/${restaurantId}`,
            method: 'GET'
        },
        {
            name: 'Get Restaurant Menu',
            url: `${API_URL}/restaurants/${restaurantId}/menu`,
            method: 'GET'
        },
        {
            name: 'Get Staff',
            url: `${API_URL}/staff/restaurant/${restaurantId}`,
            method: 'GET'
        },
        {
            name: 'Get All Restaurants',
            url: `${API_URL}/staff/restaurants`,
            method: 'GET'
        },
        {
            name: 'Get All Staff',
            url: `${API_URL}/staff/all`,
            method: 'GET'
        }
    ];

    const checkBackendConnection = async () => {
        setCheckingBackend(true);
        const startTime = Date.now();

        try {
            // Try to reach backend root
            const response = await fetch(API_URL.replace('/api', ''), {
                method: 'GET',
                mode: 'cors'
            });

            const responseTime = Date.now() - startTime;

            setBackendStatus({
                reachable: true,
                status: response.status,
                responseTime,
                url: API_URL,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            setBackendStatus({
                reachable: false,
                error: error.message,
                responseTime,
                url: API_URL,
                timestamp: new Date().toISOString()
            });
        } finally {
            setCheckingBackend(false);
        }
    };

    const runAllTests = async () => {
        for (const test of tests) {
            await testEndpoint(test.name, test.url, { method: test.method });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔧 Backend API Debug
                    </h1>
                    <p className="text-gray-600">Test backend API endpoints and see detailed responses</p>
                </div>

                {/* Backend Connection Status */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">🌐 Backend Bağlantısı</h2>
                        <button
                            onClick={checkBackendConnection}
                            disabled={checkingBackend}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                            {checkingBackend ? '⏳ Kontrol Ediliyor...' : '🔄 Bağlantıyı Test Et'}
                        </button>
                    </div>

                    <div className="mb-4">
                        <button
                            onClick={async () => {
                                if (!confirm('Veritabanı şemasını onarmak istiyor musunuz?')) return;
                                try {
                                    const res = await fetch(`${API_URL}/admin-fix/fix-db-schema`, { method: 'POST' });
                                    const data = await res.json();
                                    alert(JSON.stringify(data, null, 2));
                                } catch (e: any) {
                                    alert('Hata: ' + e.message);
                                }
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors mr-2"
                        >
                            🛠️ Fix Database Schema
                        </button>
                    </div>

                    {backendStatus && (
                        <div className={`rounded-lg p-4 ${backendStatus.reachable ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600">Durum</p>
                                    <p className="font-bold text-lg">
                                        {backendStatus.reachable ? '✅ Bağlı' : '❌ Bağlantı Yok'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Response Time</p>
                                    <p className="font-semibold">{backendStatus.responseTime}ms</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Status Code</p>
                                    <p className="font-semibold">{backendStatus.status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">URL</p>
                                    <p className="font-mono text-xs truncate">{backendStatus.url}</p>
                                </div>
                            </div>
                            {backendStatus.error && (
                                <div className="mt-3 bg-red-100 rounded p-3">
                                    <p className="text-red-800 text-sm font-semibold">Hata:</p>
                                    <p className="text-red-700 text-sm">{backendStatus.error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Restaurant ID Input */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant ID (Kroren)
                    </label>
                    <input
                        type="text"
                        value={restaurantId}
                        onChange={(e) => setRestaurantId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                </div>

                {/* Test Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 API Tests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {tests.map((test) => (
                            <button
                                key={test.name}
                                onClick={() => testEndpoint(test.name, test.url, { method: test.method })}
                                disabled={loading === test.name}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                            >
                                {loading === test.name ? '⏳ Testing...' : test.name}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={runAllTests}
                        disabled={loading !== null}
                        className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? '⏳ Running Tests...' : '🚀 Run All Tests'}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {Object.entries(results).map(([name, result]: [string, any]) => (
                        <div key={name} className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                                {result.error ? (
                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                        ❌ Error
                                    </span>
                                ) : result.ok ? (
                                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                                        ✅ {result.status}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                        ❌ {result.status}
                                    </span>
                                )}
                            </div>

                            {result.error ? (
                                <div className="bg-red-50 rounded-lg p-4">
                                    <p className="text-red-800 font-semibold mb-2">Error:</p>
                                    <p className="text-red-700 text-sm">{result.error}</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="text-xs text-gray-600">Status</p>
                                            <p className="font-semibold">{result.status}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="text-xs text-gray-600">Timestamp</p>
                                            <p className="font-mono text-xs">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>

                                    <details className="bg-gray-50 rounded-lg p-4">
                                        <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800">
                                            Show Response Data
                                        </summary>
                                        <pre className="mt-3 text-xs font-mono bg-white p-3 rounded border overflow-x-auto max-h-96 overflow-y-auto">
                                            {typeof result.data === 'string'
                                                ? result.data
                                                : JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-900">ℹ️ Debug Info</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• <strong>500 Error</strong> = Backend internal server error (check backend logs)</li>
                        <li>• <strong>401 Error</strong> = Authentication required or invalid token</li>
                        <li>• <strong>403 Error</strong> = Forbidden (token valid but no permission)</li>
                        <li>• <strong>404 Error</strong> = Resource not found</li>
                        <li>• Token Type: {typeof window !== 'undefined' ? (localStorage.getItem('staff_token') ? 'staff_token' : (localStorage.getItem('restaurant_token') ? 'restaurant_token' : 'none')) : 'server-side'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
