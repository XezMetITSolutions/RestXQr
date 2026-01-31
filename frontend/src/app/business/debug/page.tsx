'use client';

import React, { useState, useEffect } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import { apiService } from '@/services/api';

export default function DebugPage() {
    const { currentRestaurant } = useRestaurantStore();
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dbFixResult, setDbFixResult] = useState<any>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const checkMenu = async () => {
        if (!currentRestaurant?.id) {
            addLog('❌ Current Restaurant ID missing. Cannot test.');
            return;
        }
        setLoading(true);

        // 1. Test fetchRestaurantByUsername
        addLog(`1. Testing /restaurants/username/${currentRestaurant.username || '...'}`);
        try {
            // We can't use apiService.request directly for this easily as it returns internal types
            // So we fetch directly
            const userUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/username/${currentRestaurant.username}`;
            const resStart = Date.now();
            const res = await fetch(userUrl);
            const dur = Date.now() - resStart;

            if (res.ok) {
                addLog(`✅ Username Fetch OK (${dur}ms)`);
            } else {
                addLog(`❌ Username Fetch Failed (${res.status}): ${res.statusText}`);
                const text = await res.text();
                addLog(`   Error: ${text.substring(0, 200)}`);
            }
        } catch (e: any) {
            addLog(`❌ Username Fetch Network Error: ${e.message}`);
        }

        // 2. Test getRestaurantMenu
        addLog(`2. Testing /restaurants/${currentRestaurant.id}/menu`);
        try {
            const data = await apiService.getRestaurantMenu(currentRestaurant.id);
            addLog(`Menu fetched. Success: ${data.success}`);
            if (data.success) {
                addLog(`Items: ${data.data?.items?.length || 0}`);
                addLog(`Categories: ${data.data?.categories?.length || 0}`);

                // Detailed Column Check
                const firstItem = data.data?.items?.[0];
                if (firstItem) {
                    addLog('--- Item Data Check ---');
                    addLog(`ID: ${firstItem.id}`);
                    addLog(`discountPercentage: ${firstItem.discountPercentage} (${typeof firstItem.discountPercentage})`);
                    addLog(`discountedPrice: ${firstItem.discountedPrice} (${typeof firstItem.discountedPrice})`);
                    addLog(`discountStartDate: ${firstItem.discountStartDate}`);
                } else {
                    addLog('⚠️ No items found to check columns.');
                }
            } else {
                addLog(`❌ API returned success:false`);
                addLog(`Message: ${data.message}`);
            }
        } catch (e: any) {
            addLog(`❌ Menu Fetch Error: ${e.message}`);
            // Check if we can get body
            if (e.response) {
                addLog(`Status: ${e.response.status}`);
                const errText = await e.response.text();
                addLog(`Body: ${errText}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyCampaignFix = async () => {
        setLoading(true);
        addLog('🚀 Applying Database Fix (Campaign Columns)...');
        try {
            // Note: using fetch directly as this endpoint might not be in apiService
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
            // Ensure no double slash if baseUrl ends with / and endpoint starts with /
            const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

            const res = await fetch(`${cleanBase}/admin-fix/apply-campaigns`);
            const data = await res.json();
            setDbFixResult(data);
            addLog(`Result: ${data.success ? 'Success' : 'Failed'}`);
            if (data.logs) {
                data.logs.forEach((l: string) => addLog(`[DB] ${l}`));
            }
        } catch (e: any) {
            addLog(`❌ Fix Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Menu Debug & Fix</h1>

            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Diagnostic Tools</h2>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={checkMenu}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Test Menu Fetch (Check Columns)
                    </button>

                    <button
                        onClick={applyCampaignFix}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Fix Database (Add Campaign Columns)
                    </button>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                    {logs.length === 0 ? <span className="text-gray-500">// Logs will appear here...</span> : logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="font-bold text-yellow-800">Note:</p>
                <p className="text-sm text-yellow-700">If you see "Internal Server Error" when accessing the menu, click the <b>Red Button</b> above to ensure all necessary database columns exist.</p>
            </div>
        </div>
    );
}
