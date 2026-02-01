'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaDatabase, FaSave, FaSync, FaExclamationTriangle, FaCheckCircle, FaTrash } from 'react-icons/fa';

export default function MenuEditFixPage() {
    const [restaurantId, setRestaurantId] = useState('37b0322a-e11f-4ef1-b108-83be310aaf4d');
    const [itemId, setItemId] = useState('b0dd8a42-027b-4ef9-8baa-1379ba9d1c8e');
    const [item, setItem] = useState<any>(null);
    const [dbSchema, setDbSchema] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [testResult, setTestResult] = useState<any>(null);
    const [recentItems, setRecentItems] = useState<any[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const addLog = (msg: string) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev]);
        console.log(`[DEBUG] ${msg}`);
    };

    const fetchItem = async () => {
        if (!restaurantId || !itemId) return;
        setLoading(true);
        addLog(`Fetching item ${itemId}...`);
        try {
            const res = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items/${itemId}`);
            const data = await res.json();
            if (data.success) {
                setItem(data.data);
                addLog('Item fetched successfully.');
            } else {
                addLog(`Failed to fetch item: ${data.message}`);
                // Try searching if not found directly
                addLog(`Trying search fallback...`);
                const searchRes = await fetch(`${API_URL}/admin-fix/debug-item-search?query=${itemId}`);
                const searchData = await searchRes.json();
                if (searchData.success && searchData.items.length > 0) {
                    setItem(searchData.items[0]);
                    addLog('Item found via search fallback.');
                }
            }
        } catch (err: any) {
            addLog(`Error fetching item: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchema = async () => {
        setLoading(true);
        addLog('Fetching DB schema info...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/table-info`);
            const data = await res.json();
            if (data.success) {
                setDbSchema(data.tables);
                addLog('Schema info fetched.');
            }
        } catch (err: any) {
            addLog(`Error fetching schema: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const runFixSchema = async () => {
        setLoading(true);
        addLog('Running fix-db-schema...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/fix-db-schema`);
            const data = await res.json();
            addLog(`Result: ${data.message || 'Done'}`);
            fetchSchema();
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const runApplyCampaigns = async () => {
        setLoading(true);
        addLog('Running apply-campaigns...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/apply-campaigns`);
            const data = await res.json();
            addLog(`Result: ${JSON.stringify(data.logs || data)}`);
            fetchSchema();
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testUpdate = async (payload: any) => {
        setLoading(true);
        setTestResult(null);
        addLog(`Testing update with payload: ${JSON.stringify(payload)}`);
        try {
            const res = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setTestResult({ status: res.status, data });
            if (res.ok) {
                addLog('✅ Update SUCCESSFUL!');
            } else {
                addLog(`❌ Update FAILED with status ${res.status}: ${data.message || 'Unknown error'}`);
            }
        } catch (err: any) {
            addLog(`💥 Request Error: ${err.message}`);
            setTestResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const testAllFieldsOneByOne = async () => {
        addLog('Starting diagnosis sequence...');

        const testPayloads = [
            { name: 'Basic (Name Only)', payload: { name: 'Diagnosis Test Item' } },
            { name: 'Campaign (Discount %)', payload: { discountPercentage: 10 } },
            { name: 'Campaign (Discount Price)', payload: { discountedPrice: 99.99 } },
            { name: 'Campaign (Dates)', payload: { discountStartDate: new Date().toISOString() } },
            { name: 'JSON (Variations)', payload: { variations: [] } },
            { name: 'JSON (Options)', payload: { options: [] } },
            { name: 'JSON (Allergens)', payload: { allergens: [] } },
            { name: 'Kitchen Station', payload: { kitchenStation: 'test_station' } },
            { name: 'Type', payload: { type: 'single' } },
            { name: 'Description (Text)', payload: { description: 'test description' } }
        ];

        for (const test of testPayloads) {
            addLog(`🧪 Testing: ${test.name}`);
            await testUpdate(test.payload);
            await new Promise(r => setTimeout(r, 800));
        }
        addLog('Diagnosis sequence completed.');
    };

    const fixEverything = async () => {
        setLoading(true);
        addLog('🚀 CRITICAL FIX: Running all database migrations...');
        try {
            addLog('Step 1: fix-db-schema...');
            const res1 = await fetch(`${API_URL}/admin-fix/fix-db-schema`);
            const data1 = await res1.json();
            addLog(`Step 1 Result: ${data1.message}`);

            addLog('Step 2: apply-campaigns...');
            const res2 = await fetch(`${API_URL}/admin-fix/apply-campaigns`);
            const data2 = await res2.json();
            addLog(`Step 2 Result: ${data2.success ? 'Success' : 'Failed'}`);

            addLog('Step 3: apply-variants...');
            const res3 = await fetch(`${API_URL}/admin-fix/apply-variants`);
            const data3 = await res3.json();
            addLog(`Step 3 Result: ${data3.error ? 'Error' : 'Success'}`);

            addLog('✅ All migrations attempted. Refreshing schema...');
            await fetchSchema();
        } catch (err: any) {
            addLog(`💥 Migration Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    const fetchRecentItems = async () => {
        setLoading(true);
        addLog('Fetching latest items from database for reference...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/debug-items`);
            const data = await res.json();
            if (data.success) {
                setRecentItems(data.items);
                addLog(`Found ${data.items.length} recent items.`);
            }
        } catch (err: any) {
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchema();
        fetchRecentItems();
    }, []);

    const expectedColumns = [
        'id', 'restaurant_id', 'category_id', 'name', 'description', 'price',
        'image_url', 'is_available', 'is_popular', 'preparation_time', 'calories',
        'ingredients', 'allergens', 'portion_size', 'display_order', 'subcategory',
        'portion', 'kitchen_station', 'variations', 'options', 'type', 'bundle_items',
        'translations', 'discounted_price', 'discount_percentage', 'discount_start_date', 'discount_end_date'
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3">
                            <FaBug className="text-red-500" />
                            Menu Item Edit Debugger
                        </h1>
                        <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-bold">Diagnose and Fix 500 Errors</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchSchema} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-700 transition-all">
                            REFRESH SCHEMA
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Config & Item Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h2 className="font-black text-sm uppercase text-gray-500 mb-4 tracking-tighter">Configuration</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Restaurant ID</label>
                                    <input
                                        value={restaurantId}
                                        onChange={e => setRestaurantId(e.target.value)}
                                        className="w-full p-2 border rounded-lg text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Item ID</label>
                                    <input
                                        value={itemId}
                                        onChange={e => setItemId(e.target.value)}
                                        className="w-full p-2 border rounded-lg text-sm font-mono"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={fetchItem}
                                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                                    >
                                        FETCH ITEM DATA
                                    </button>
                                    <button
                                        onClick={fetchRecentItems}
                                        title="Reload Database Items"
                                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border border-gray-200"
                                    >
                                        <FaSync className={loading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                            <h2 className="font-black text-sm uppercase text-purple-600 mb-4 tracking-tighter">Latest Database Items</h2>
                            <div className="space-y-2">
                                {recentItems.map(i => (
                                    <button
                                        key={i.id}
                                        onClick={() => {
                                            setRestaurantId(i.restaurantId);
                                            setItemId(i.id);
                                            setItem(i);
                                            addLog(`Selected: ${i.name}`);
                                        }}
                                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${itemId === i.id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-bold truncate">{i.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono truncate">{i.id}</div>
                                        <div className="text-[10px] text-blue-500 mt-1">{i.restaurant?.name || 'Unknown Rest.'}</div>
                                    </button>
                                ))}
                                {recentItems.length === 0 && <p className="text-gray-400 italic text-xs">No items found yet...</p>}
                            </div>
                        </div>

                        {item && (
                            <div className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-sm">
                                <h2 className="font-black text-sm uppercase text-green-600 mb-4 tracking-tighter">Item Preview</h2>
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-gray-900">{item.name}</p>
                                    <p className="text-sm font-bold text-gray-500">{item.price}₺</p>
                                    <div className="text-[10px] font-mono bg-gray-50 p-2 rounded max-h-40 overflow-auto">
                                        <pre>{JSON.stringify(item, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Middle Column: Schema & Tests */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <h2 className="font-black text-sm uppercase text-blue-600 mb-4 tracking-tighter">Schema Verification</h2>

                            {dbSchema?.menu_items ? (
                                <div className="space-y-1">
                                    {expectedColumns.map(col => {
                                        const exists = dbSchema.menu_items.some((c: any) => c.column_name === col);
                                        return (
                                            <div key={col} className={`flex justify-between items-center text-xs p-1 px-3 rounded ${exists ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 font-bold border border-red-200'}`}>
                                                <span>{col}</span>
                                                {exists ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-sm">Loading schema info...</p>
                            )}

                            <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                                <button onClick={runFixSchema} className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                    RUN FIX-DB-SCHEMA
                                </button>
                                <button onClick={runApplyCampaigns} className="w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">
                                    RUN APPLY-CAMPAIGNS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Execution & Logs */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex flex-col h-[400px]">
                            <h2 className="font-black text-sm uppercase text-gray-400 mb-4 tracking-tighter">Debug Console</h2>
                            <div className="flex-1 overflow-auto font-mono text-[10px] space-y-1 custom-scrollbar">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="border-b border-gray-800 pb-1">{log}</div>
                                ))}
                                {logs.length === 0 && <div className="text-gray-700 italic">No logs yet...</div>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-br from-white to-red-50">
                            <h2 className="font-black text-sm uppercase text-red-600 mb-4 tracking-tighter">Emergency Actions</h2>
                            <button
                                onClick={fixEverything}
                                disabled={loading}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mb-4 animate-pulse shadow-lg"
                            >
                                <FaSync /> FIX ALL DATABASE ISSUES
                            </button>

                            <h2 className="font-black text-sm uppercase text-orange-600 mb-4 tracking-tighter">Interactive Test</h2>
                            <p className="text-xs text-gray-500 mb-4">Run automated sequential field updates to find the exact column causing the 500 error.</p>
                            <button
                                onClick={testAllFieldsOneByOne}
                                disabled={loading}
                                className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-sm hover:bg-orange-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                            >
                                <FaBug /> START FULL DIAGNOSIS
                            </button>
                        </div>

                        {testResult && (
                            <div className={`p-4 rounded-xl border-2 ${testResult.status === 200 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <h3 className="font-bold text-sm mb-2">Test Result: {testResult.status}</h3>
                                <pre className="text-[10px] overflow-auto max-h-32">
                                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .bg-gray-900.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}
