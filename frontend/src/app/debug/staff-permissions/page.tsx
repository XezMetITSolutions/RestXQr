'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { FaUser, FaShieldAlt, FaSync, FaExclamationTriangle, FaCheckCircle, FaLock } from 'react-icons/fa';

export default function StaffPermissionsDebug() {
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'error' | 'success' }[]>([]);
    const [diagInfo, setDiagInfo] = useState<any>({});
    const [staff, setStaff] = useState<any[]>([]);

    const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev]);
    };

    const runDiagnostics = () => {
        const info = {
            localStorage_Keys: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
            Tokens: {
                restaurant_token: typeof window !== 'undefined' ? (localStorage.getItem('restaurant_token') ? 'PRESENT (starts with ' + localStorage.getItem('restaurant_token')?.substring(0, 10) + '...)' : 'MISSING') : 'N/A',
                staff_token: typeof window !== 'undefined' ? (localStorage.getItem('staff_token') ? 'PRESENT (starts with ' + localStorage.getItem('staff_token')?.substring(0, 10) + '...)' : 'MISSING') : 'N/A',
                business_token: typeof window !== 'undefined' ? (localStorage.getItem('business_token') ? 'PRESENT (starts with ' + localStorage.getItem('business_token')?.substring(0, 10) + '...)' : 'MISSING') : 'N/A',
            },
            authStore: {
                restaurantId: authenticatedRestaurant?.id,
                restaurantName: authenticatedRestaurant?.name,
            },
            browser: {
                hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
                subdomain: typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'N/A',
            }
        };
        setDiagInfo(info);
        addLog('Diagnostics run complete', 'info');
    };

    useEffect(() => {
        initializeAuth();
        runDiagnostics();
    }, []);

    const fetchStaff = async () => {
        if (!authenticatedRestaurant?.id) {
            addLog('No restaurant ID found in store. Trying initializeAuth...', 'error');
            initializeAuth();
            if (!authenticatedRestaurant?.id) {
                setError('Restaurant ID missing from store even after init');
                return;
            }
        }

        setLoading(true);
        setError(null);
        addLog(`Fetching staff for restaurant: ${authenticatedRestaurant.id}`, 'info');

        try {
            const response = await apiService.getStaff(authenticatedRestaurant.id);
            addLog(`API Response success: ${response.success}`, response.success ? 'success' : 'error');

            if (response.success) {
                setStaff(response.data || []);
                addLog(`Found ${response.data?.length || 0} staff members`, 'success');
            } else {
                setError(response.message || 'Failed to fetch staff');
            }
        } catch (err: any) {
            const msg = err.message || 'Unknown error';
            setError(msg);
            addLog(`Fetch error: ${msg}`, 'error');
            console.error('Debug Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const testPermissionsRoute = async () => {
        if (!authenticatedRestaurant?.id) return addLog('Missing restaurant ID', 'error');

        addLog(`Testing GET /permissions/${authenticatedRestaurant.id}`, 'info');
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const subdomain = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'kroren';

            const r_token = localStorage.getItem('restaurant_token');
            const s_token = localStorage.getItem('staff_token');
            const b_token = localStorage.getItem('business_token');
            const token = s_token || r_token || b_token;

            if (!token) {
                addLog('No token found in localStorage (tried staff, restaurant, business)', 'error');
                return;
            }

            addLog(`Selected token type: ${s_token ? 'STAFF' : (r_token ? 'RESTAURANT' : 'BUSINESS')}`, 'info');

            const response = await fetch(`${API_URL}/permissions/${authenticatedRestaurant.id}`, {
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
                    'X-Subdomain': subdomain
                }
            });

            addLog(`Response Status: ${response.status}`, response.ok ? 'success' : 'error');
            const data = await response.json();
            addLog(`Success: ${data.success}`, data.success ? 'success' : 'error');
            if (!data.success) addLog(`Message: ${data.message}`, 'error');
        } catch (err: any) {
            addLog(`Error: ${err.message}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3 text-purple-400">
                            <FaShieldAlt /> STAFF AUTH DEBUGGER
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={runDiagnostics} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition-colors">DIAGNOSTICS</button>
                        <button onClick={fetchStaff} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition-colors">TEST LOAD STAFF</button>
                        <button onClick={testPermissionsRoute} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 transition-colors">TEST PERMISSIONS API</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <section className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
                            <h2 className="text-lg font-bold mb-4 text-yellow-500 underline">SYSTEM STATE</h2>
                            {Object.entries(diagInfo).map(([key, val]: [string, any]) => (
                                <div key={key} className="mb-4">
                                    <h3 className="text-gray-500 text-xs mb-1">[{key}]</h3>
                                    <pre className="bg-black p-2 rounded text-xs text-green-400 overflow-x-auto">
                                        {JSON.stringify(val, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-gray-900 border border-gray-800 p-6 rounded-lg h-[600px] flex flex-col">
                            <h2 className="text-lg font-bold mb-4 text-blue-400 underline">EXECUTION LOGS</h2>
                            <div className="flex-1 overflow-y-auto space-y-1 text-[11px]">
                                {logs.map((log, i) => (
                                    <div key={i} className={`p-1 ${log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-green-400' :
                                                'text-gray-400'
                                        }`}>
                                        <span className="opacity-30">{log.time}</span> {log.msg}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
