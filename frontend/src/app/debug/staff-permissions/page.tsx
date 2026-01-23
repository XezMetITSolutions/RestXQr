'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { FaShieldAlt, FaKey, FaServer, FaDatabase, FaSync, FaCopy } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

interface LogEntry {
    time: string;
    msg: string;
    type: 'info' | 'error' | 'success' | 'warn';
    data?: any;
}

export default function StaffPermissionsDebug() {
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [tokenDetails, setTokenDetails] = useState<any>(null);
    const [rawResponse, setRawResponse] = useState<any>(null);

    const addLog = (msg: string, type: LogEntry['type'] = 'info', data?: any) => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type, data }, ...prev.slice(0, 50)]);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addLog('Copied to clipboard', 'success');
    };

    // Decode JWT without verification (for debugging)
    const decodeJWT = (token: string) => {
        try {
            const parts = token.replace('Bearer ', '').split('.');
            if (parts.length !== 3) return { error: 'Not a valid JWT format (expected 3 parts)' };

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));

            return {
                header,
                payload,
                isExpired: payload.exp ? payload.exp * 1000 < Date.now() : 'unknown',
                expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'unknown'
            };
        } catch (e: any) {
            return { error: e.message };
        }
    };

    const runDiagnostics = () => {
        addLog('=== RUNNING FULL DIAGNOSTICS ===', 'info');

        // Get all tokens
        const staffToken = localStorage.getItem('staff_token');
        const restaurantToken = localStorage.getItem('restaurant_token');
        const businessToken = localStorage.getItem('business_token');

        addLog(`staff_token: ${staffToken ? staffToken.substring(0, 50) + '...' : 'MISSING'}`, staffToken ? 'info' : 'warn');
        addLog(`restaurant_token: ${restaurantToken ? restaurantToken.substring(0, 50) + '...' : 'MISSING'}`, restaurantToken ? 'info' : 'warn');
        addLog(`business_token: ${businessToken ? businessToken.substring(0, 50) + '...' : 'MISSING'}`, businessToken ? 'info' : 'warn');

        // Try to decode each token
        const tokens = { staff_token: staffToken, restaurant_token: restaurantToken, business_token: businessToken };
        const decodedTokens: any = {};

        Object.entries(tokens).forEach(([name, token]) => {
            if (token) {
                const decoded = decodeJWT(token);
                decodedTokens[name] = decoded;
                if (decoded.error) {
                    addLog(`${name} decode FAILED: ${decoded.error}`, 'error');
                } else {
                    addLog(`${name} decoded: id=${decoded.payload?.id}, type=${decoded.payload?.type}, role=${decoded.payload?.role}`, 'success');
                    if (decoded.isExpired === true) {
                        addLog(`${name} is EXPIRED!`, 'error');
                    }
                }
            }
        });

        setTokenDetails({
            raw: tokens,
            decoded: decodedTokens,
            subdomain: window.location.hostname.split('.')[0],
            restaurantId: authenticatedRestaurant?.id
        });

        addLog('=== DIAGNOSTICS COMPLETE ===', 'info');
    };

    const testStaffLogin = async () => {
        addLog('=== TESTING STAFF LOGIN (RAW) ===', 'info');

        try {
            const subdomain = window.location.hostname.split('.')[0];

            // First, let's see what the login returns
            const response = await fetch(`${API_URL}/staff/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Subdomain': subdomain
                },
                body: JSON.stringify({
                    username: 'test',  // This will fail, but we want to see the response format
                    password: 'test',
                    subdomain
                })
            });

            const data = await response.json();
            addLog(`Login response status: ${response.status}`, response.ok ? 'success' : 'error');
            addLog(`Response body: ${JSON.stringify(data).substring(0, 200)}...`, 'info');

            setRawResponse({ endpoint: '/staff/login', status: response.status, data });
        } catch (e: any) {
            addLog(`Login test error: ${e.message}`, 'error');
        }
    };

    const testPermissionsAPI = async () => {
        if (!authenticatedRestaurant?.id) {
            addLog('No restaurant ID in auth store', 'error');
            return;
        }

        addLog('=== TESTING PERMISSIONS API ===', 'info');

        const staffToken = localStorage.getItem('staff_token');
        const restaurantToken = localStorage.getItem('restaurant_token');
        const businessToken = localStorage.getItem('business_token');
        const token = staffToken || restaurantToken || businessToken;

        if (!token) {
            addLog('No token found in any storage key', 'error');
            return;
        }

        addLog(`Using token type: ${staffToken ? 'staff' : (restaurantToken ? 'restaurant' : 'business')}`, 'info');
        addLog(`Token value (first 60 chars): ${token.substring(0, 60)}...`, 'info');

        // Decode to check validity BEFORE making request
        const decoded = decodeJWT(token);
        if (decoded.error) {
            addLog(`Token is NOT a valid JWT: ${decoded.error}`, 'error');
            addLog('This is likely the cause of the 401 error!', 'error');
            return;
        }

        addLog(`Token payload: ${JSON.stringify(decoded.payload)}`, 'info');

        try {
            const subdomain = window.location.hostname.split('.')[0];
            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            addLog(`Making request to: ${API_URL}/permissions/${authenticatedRestaurant.id}`, 'info');
            addLog(`Authorization header: ${authHeader.substring(0, 30)}...`, 'info');
            addLog(`X-Subdomain: ${subdomain}`, 'info');

            const response = await fetch(`${API_URL}/permissions/${authenticatedRestaurant.id}`, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'X-Subdomain': subdomain
                }
            });

            addLog(`Response status: ${response.status}`, response.ok ? 'success' : 'error');

            const data = await response.json();
            addLog(`Response success: ${data.success}`, data.success ? 'success' : 'error');

            if (!data.success) {
                addLog(`Error message: ${data.message}`, 'error');
                if (data.error) addLog(`Error details: ${data.error}`, 'error');
            }

            setRawResponse({ endpoint: '/permissions/:id', status: response.status, data });
        } catch (e: any) {
            addLog(`Request error: ${e.message}`, 'error');
        }
    };

    const testStaffAPI = async () => {
        if (!authenticatedRestaurant?.id) {
            addLog('No restaurant ID in auth store', 'error');
            return;
        }

        addLog('=== TESTING STAFF API ===', 'info');

        const staffToken = localStorage.getItem('staff_token');
        const restaurantToken = localStorage.getItem('restaurant_token');
        const businessToken = localStorage.getItem('business_token');
        const token = staffToken || restaurantToken || businessToken;

        if (!token) {
            addLog('No token found', 'error');
            return;
        }

        try {
            const subdomain = window.location.hostname.split('.')[0];
            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            addLog(`Making request to: ${API_URL}/staff/restaurant/${authenticatedRestaurant.id}`, 'info');

            const response = await fetch(`${API_URL}/staff/restaurant/${authenticatedRestaurant.id}`, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'X-Subdomain': subdomain
                }
            });

            addLog(`Response status: ${response.status}`, response.ok ? 'success' : 'error');

            const data = await response.json();
            addLog(`Response success: ${data.success}`, data.success ? 'success' : 'error');

            if (data.success) {
                addLog(`Found ${data.data?.length || 0} staff members`, 'success');
            } else {
                addLog(`Error: ${data.message}`, 'error');
            }

            setRawResponse({ endpoint: '/staff/restaurant/:id', status: response.status, data });
        } catch (e: any) {
            addLog(`Request error: ${e.message}`, 'error');
        }
    };

    const clearAllTokens = () => {
        localStorage.removeItem('staff_token');
        localStorage.removeItem('restaurant_token');
        localStorage.removeItem('business_token');
        addLog('All tokens cleared from localStorage', 'warn');
        runDiagnostics();
    };

    useEffect(() => {
        initializeAuth();
        runDiagnostics();
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 font-mono text-sm">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 border-b border-gray-800 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                        <FaShieldAlt /> STAFF AUTH DEBUGGER v2
                    </h1>
                    <p className="text-gray-500 text-xs mt-1">API: {API_URL}</p>
                </header>

                <div className="flex gap-2 mb-6 flex-wrap">
                    <button onClick={runDiagnostics} className="bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2">
                        <FaSync /> Run Diagnostics
                    </button>
                    <button onClick={testStaffLogin} className="bg-blue-700 px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
                        <FaKey /> Test Login Endpoint
                    </button>
                    <button onClick={testPermissionsAPI} className="bg-green-700 px-3 py-2 rounded hover:bg-green-600 flex items-center gap-2">
                        <FaDatabase /> Test Permissions API
                    </button>
                    <button onClick={testStaffAPI} className="bg-orange-700 px-3 py-2 rounded hover:bg-orange-600 flex items-center gap-2">
                        <FaServer /> Test Staff API
                    </button>
                    <button onClick={clearAllTokens} className="bg-red-700 px-3 py-2 rounded hover:bg-red-600">
                        Clear All Tokens
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Token Details */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h2 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                            <FaKey /> TOKEN ANALYSIS
                        </h2>
                        {tokenDetails ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Subdomain</div>
                                    <div className="text-green-400">{tokenDetails.subdomain}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Restaurant ID</div>
                                    <div className="text-green-400">{tokenDetails.restaurantId || 'MISSING'}</div>
                                </div>
                                {Object.entries(tokenDetails.decoded || {}).map(([name, decoded]: [string, any]) => (
                                    <div key={name} className="border-t border-gray-800 pt-2">
                                        <div className="text-gray-400 text-xs mb-1">{name}</div>
                                        {decoded.error ? (
                                            <div className="text-red-400 text-xs">{decoded.error}</div>
                                        ) : (
                                            <div className="text-xs space-y-1">
                                                <div>ID: <span className="text-blue-400">{decoded.payload?.id}</span></div>
                                                <div>Type: <span className="text-blue-400">{decoded.payload?.type}</span></div>
                                                <div>Role: <span className="text-blue-400">{decoded.payload?.role}</span></div>
                                                <div>Expires: <span className={decoded.isExpired ? 'text-red-400' : 'text-green-400'}>{decoded.expiresAt}</span></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500">Run diagnostics to see token details</div>
                        )}
                    </div>

                    {/* Raw Response */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <h2 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                            <FaServer /> RAW API RESPONSE
                        </h2>
                        {rawResponse ? (
                            <div>
                                <div className="text-gray-500 text-xs mb-1">Endpoint: {rawResponse.endpoint}</div>
                                <div className="text-gray-500 text-xs mb-2">Status: <span className={rawResponse.status < 400 ? 'text-green-400' : 'text-red-400'}>{rawResponse.status}</span></div>
                                <pre className="bg-black p-2 rounded text-xs overflow-auto max-h-64">
                                    {JSON.stringify(rawResponse.data, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="text-gray-500">Test an API endpoint to see response</div>
                        )}
                    </div>
                </div>

                {/* Logs */}
                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h2 className="text-purple-400 font-bold mb-3">EXECUTION LOG</h2>
                    <div className="h-64 overflow-y-auto space-y-1 text-xs">
                        {logs.map((log, i) => (
                            <div key={i} className={`font-mono ${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warn' ? 'text-yellow-400' :
                                            'text-gray-400'
                                }`}>
                                <span className="text-gray-600">{log.time}</span> {log.msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Info */}
                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs">
                    <h3 className="text-gray-400 font-bold mb-2">EXPECTED TOKEN FORMAT</h3>
                    <p className="text-gray-500">A valid JWT looks like: <code className="text-green-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ii4uLiJ9.xxx</code></p>
                    <p className="text-gray-500 mt-1">If staff_token starts with "Bearer " or "authentica...", it's NOT a valid JWT and will cause 401 errors.</p>
                </div>
            </div>
        </div>
    );
}
