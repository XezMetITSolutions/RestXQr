'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function CheckTokensPage() {
    const { authenticatedRestaurant, authenticatedStaff, isAuthenticated } = useAuthStore();
    const [tokens, setTokens] = useState<any>({});
    const [testResult, setTestResult] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTokens({
                staff_token: localStorage.getItem('staff_token'),
                restaurant_token: localStorage.getItem('restaurant_token'),
                staff_user: localStorage.getItem('staff_user'),
                restaurant_user: localStorage.getItem('restaurant_user'),
            });
        }
    }, []);

    const testStaffAPI = async () => {
        if (!authenticatedRestaurant?.id) {
            alert('No authenticated restaurant found!');
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
        const url = `${API_URL}/staff/restaurant/${authenticatedRestaurant.id}`;

        const staffToken = localStorage.getItem('staff_token');
        const restaurantToken = localStorage.getItem('restaurant_token');
        const authToken = staffToken || restaurantToken;

        console.log('Testing staff API with:', {
            url,
            restaurantId: authenticatedRestaurant.id,
            hasStaffToken: !!staffToken,
            hasRestaurantToken: !!restaurantToken,
            usingToken: authToken ? (staffToken ? 'staff_token' : 'restaurant_token') : 'none'
        });

        if (!authToken) {
            setTestResult({ error: 'No authentication token found!' });
            return;
        }

        try {
            const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                    'X-Subdomain': window.location.hostname.split('.')[0]
                }
            });

            const data = await response.json();

            setTestResult({
                status: response.status,
                ok: response.ok,
                data: data,
                staffCount: data?.data?.length || 0
            });
        } catch (error: any) {
            setTestResult({ error: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔐 Token & Authentication Debug
                    </h1>
                    <p className="text-gray-600">Check authentication tokens and test staff API</p>
                </div>

                {/* Auth Store Status */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Auth Store Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg ${isAuthenticated() ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                            <p className="text-sm text-gray-600">Is Authenticated</p>
                            <p className="text-2xl font-bold">{isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${authenticatedRestaurant ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                            <p className="text-sm text-gray-600">Restaurant</p>
                            <p className="text-lg font-bold">{authenticatedRestaurant?.name || 'None'}</p>
                            {authenticatedRestaurant && (
                                <p className="text-xs text-gray-600 font-mono">ID: {authenticatedRestaurant.id}</p>
                            )}
                        </div>
                        <div className={`p-4 rounded-lg ${authenticatedStaff ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                            <p className="text-sm text-gray-600">Staff</p>
                            <p className="text-lg font-bold">{authenticatedStaff?.name || 'None'}</p>
                        </div>
                    </div>
                </div>

                {/* LocalStorage Tokens */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 LocalStorage Tokens</h2>
                    <div className="space-y-3">
                        {Object.entries(tokens).map(([key, value]) => (
                            <div key={key} className={`p-4 rounded-lg ${value ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-800">{key}</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${value ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
                                        {value ? '✅ Present' : '❌ Missing'}
                                    </span>
                                </div>
                                {value && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-blue-600">Show Value</summary>
                                        <pre className="mt-2 text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Test Staff API */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Test Staff API</h2>
                    <button
                        onClick={testStaffAPI}
                        disabled={!authenticatedRestaurant}
                        className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {authenticatedRestaurant ? '🚀 Test API Call' : '❌ No Restaurant (Login First)'}
                    </button>

                    {testResult && (
                        <div className={`mt-4 p-4 rounded-lg ${testResult.error ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                            <h3 className="font-bold text-lg mb-2">Test Result:</h3>
                            {testResult.error ? (
                                <p className="text-red-800">❌ Error: {testResult.error}</p>
                            ) : (
                                <div>
                                    <p className="text-green-800 mb-2">✅ Status: {testResult.status} ({testResult.ok ? 'OK' : 'Error'})</p>
                                    <p className="text-green-800 mb-2">📊 Staff Count: {testResult.staffCount}</p>
                                    <details>
                                        <summary className="cursor-pointer text-sm text-blue-600">Show Full Response</summary>
                                        <pre className="mt-2 text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                                            {JSON.stringify(testResult.data, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-900">💡 Troubleshooting</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• <strong>No tokens?</strong> Login at <code className="bg-white px-2 py-1 rounded">/login</code></li>
                        <li>• <strong>staff_token missing?</strong> Business dashboard should use restaurant_token</li>
                        <li>• <strong>API fails?</strong> Check if backend is running and tokens are valid</li>
                        <li>• <strong>Staff count is 0?</strong> Use <code className="bg-white px-2 py-1 rounded">/debug/create-kroren-staff</code> to create staff</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
