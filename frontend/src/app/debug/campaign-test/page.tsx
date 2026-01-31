'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export default function CampaignDebugPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [targetItem, setTargetItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string>('');

    // Test Data
    const itemSearchName = "Tavuk Etli Rojamo";
    const testDiscountPrice = 178;
    const testStartDate = "2026-02-01T00:00:00.000Z";
    const testEndDate = "2026-02-28T23:59:59.000Z";

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', data?: any) => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            data
        }, ...prev]);
    };

    const findTargetItem = async () => {
        setLoading(true);
        try {
            // 1. Get Kroren Restaurant ID
            addLog("Resolving 'kroren' restaurant...", 'info');
            const resRest = await apiService.getRestaurantByUsername('kroren-levent'); // Assuming kroren-levent based on context

            if (!resRest.success || !resRest.data) {
                // Try fallback
                const resRest2 = await apiService.getRestaurantByUsername('kroren');
                if (!resRest2.success || !resRest2.data) {
                    throw new Error("Kroren restaurant not found");
                }
                setRestaurantId(resRest2.data.id);
                addLog(`Found Kroren (fallback): ${resRest2.data.id}`, 'success');
            } else {
                setRestaurantId(resRest.data.id);
                addLog(`Found Kroren-Levent: ${resRest.data.id}`, 'success');
            }

            const rId = resRest.data?.id || '';

            // 2. Search for the Item in the Menu
            addLog(`Searching for item: ${itemSearchName}...`, 'info');
            const resMenu = await apiService.getRestaurantMenu(rId);

            let foundItem = null;
            if (resMenu.success) {
                // Flatten categories to find item
                const allItems = resMenu.data.categories.flatMap((c: any) => c.items || []);
                foundItem = allItems.find((i: any) => i.name.toLowerCase().includes(itemSearchName.toLowerCase()));

                // Try to find in standalone items list if provided structure differs
                if (!foundItem && resMenu.data.items) {
                    foundItem = resMenu.data.items.find((i: any) => i.name.toLowerCase().includes(itemSearchName.toLowerCase()));
                }
            }

            if (foundItem) {
                setTargetItem(foundItem);
                addLog(`✅ Item Found: ${foundItem.name} (ID: ${foundItem.id})`, 'success', foundItem);
            } else {
                addLog(`❌ Item '${itemSearchName}' not found in menu.`, 'error');
            }

        } catch (e: any) {
            addLog(`Error finding item: ${e.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const runUpdateTest = async () => {
        if (!targetItem || !restaurantId) {
            addLog("Cannot run test: No target item or restaurant ID.", 'error');
            return;
        }

        setLoading(true);

        // Prepare Payload
        const updatePayload = {
            name: targetItem.name, // Required fields often needed for full update
            price: targetItem.price,
            categoryId: targetItem.categoryId,
            discountedPrice: testDiscountPrice,
            discountPercentage: null, // Ensure we clear percentage if setting fixed price
            discountStartDate: testStartDate,
            discountEndDate: testEndDate
        };

        addLog("🚀 Sending Update Request...", 'info', updatePayload);

        try {
            // Direct API call to verify if the issue is in the Store or the API/Backend
            const response = await apiService.updateMenuItem(restaurantId, targetItem.id, updatePayload);

            addLog("Update Response Received", 'info', response);

            if (response.success) {
                addLog("✅ Update reported success by backend.", 'success');

                // Verify by fetching again
                addLog("🔍 Verifying by re-fetching item...", 'info');
                // Wait a moment for DB commit
                await new Promise(r => setTimeout(r, 1000));

                const resMenu = await apiService.getRestaurantMenu(restaurantId);
                const allItems = resMenu.data.categories.flatMap((c: any) => c.items || []);
                const freshItem = allItems.find((i: any) => i.id === targetItem.id);

                if (freshItem) {
                    const matches =
                        freshItem.discountedPrice == testDiscountPrice &&
                        freshItem.discountStartDate === testStartDate &&
                        freshItem.discountEndDate === testEndDate;

                    if (matches) {
                        addLog("🎉 VERIFICATION SUCCESS: Data saved correctly!", 'success', freshItem);
                    } else {
                        addLog("❌ VERIFICATION FAILED: Data mismatch in fetched item.", 'error', {
                            expected: {
                                discountedPrice: testDiscountPrice,
                                start: testStartDate,
                                end: testEndDate
                            },
                            received: {
                                discountedPrice: freshItem.discountedPrice,
                                start: freshItem.discountStartDate,
                                end: freshItem.discountEndDate
                            }
                        });
                    }
                } else {
                    addLog("❌ Could not find item after update to verify.", 'error');
                }

            } else {
                addLog(`❌ Update Request Failed: ${response.message}`, 'error');
            }

        } catch (e: any) {
            addLog(`💥 Exception during update: ${e.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const runDbFix = async () => {
        setLoading(true);
        addLog("🔧 Requesting Database Schema Fix...", 'info');
        try {
            // Using direct fetch since this is a specialized admin route not in standard service
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const res = await fetch(`${API_URL}/admin-fix/apply-campaigns`);
            const data = await res.json();

            if (data.success) {
                addLog("✅ Database Schema Fixed/Verified!", 'success', data.logs);
            } else {
                addLog("❌ DB Fix Failed", 'error', data);
            }
        } catch (e: any) {
            addLog(`💥 DB Fix Exception: ${e.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-mono">
            <h1 className="text-2xl font-bold mb-6 text-orange-400">Campaign Data Debugger</h1>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
                        <h2 className="text-lg font-bold mb-4 border-b border-slate-600 pb-2">Target Info</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Item:</strong> {itemSearchName}</p>
                            <p><strong>Restaurant:</strong> Kroren / Kroren-Levent</p>
                            <div className="p-3 bg-slate-900 rounded mt-2">
                                <p className="text-green-400">Current Price: {targetItem ? `${targetItem.price} TL` : '...'}</p>
                                <p className="text-yellow-400">Target Discount: {testDiscountPrice} TL</p>
                                <p className="text-blue-400">Date Range: Feb 1 - Feb 28, 2026</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6 flex-wrap">
                            <button
                                onClick={findTargetItem}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition-colors disabled:opacity-50"
                            >
                                1. Find Item
                            </button>
                            <button
                                onClick={runDbFix}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold transition-colors disabled:opacity-50"
                            >
                                2. Fix DB Schema
                            </button>
                            <button
                                onClick={runUpdateTest}
                                disabled={loading || !targetItem}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold transition-colors disabled:opacity-50"
                            >
                                3. Run Update Test
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-black border border-slate-700 rounded-xl p-4 h-[600px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-black pb-2 border-b border-slate-800">
                        <span className="text-xs text-slate-500">Execution Log</span>
                        <button onClick={() => setLogs([])} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                    </div>
                    {logs.map(log => (
                        <div key={log.id} className="mb-3 font-mono text-xs border-l-2 pl-2 border-slate-700">
                            <div className="flex gap-2">
                                <span className="text-slate-500">[{log.timestamp}]</span>
                                <span className={
                                    log.type === 'error' ? 'text-red-400 font-bold' :
                                        log.type === 'success' ? 'text-green-400 font-bold' :
                                            log.type === 'warning' ? 'text-yellow-400' : 'text-blue-300'
                                }>{log.message}</span>
                            </div>
                            {log.data && (
                                <pre className="mt-1 text-slate-500 overflow-x-auto p-1 bg-slate-900 rounded">
                                    {JSON.stringify(log.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
