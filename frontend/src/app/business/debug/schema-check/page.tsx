'use client';

import React, { useState, useEffect } from 'react';
import { FaDatabase, FaCheck, FaTimes, FaExclamationTriangle, FaTools, FaSync } from 'react-icons/fa';

// Expected Schema Definition
const EXPECTED_SCHEMA: Record<string, string[]> = {
    'menu_items': [
        'id', 'restaurantId', 'categoryId', 'name', 'description', 'price',
        'imageUrl', 'isAvailable', 'created_at', 'updated_at',
        // Recent Additions
        'variations', 'options', 'bundle_items', 'type', 'kitchen_station',
        'discount_percentage', 'discounted_price', 'discount_start_date', 'discount_end_date',
        'ingredients', 'allergens', 'is_popular', 'translations',
        'preparation_time', 'calories', 'subcategory', 'portion', 'portion_size'
    ],
    'menu_categories': [
        'id', 'restaurantId', 'name', 'description', 'order', 'isActive',
        // Recent Additions
        'discount_percentage', 'discount_start_date', 'discount_end_date', 'kitchen_station'
    ],
    'restaurants': [
        'id', 'name', 'slug', 'settings', 'kitchen_stations',
        'max_tables', 'max_menu_items', 'max_staff'
    ],
    'orders': [
        'id', 'restaurantId', 'tableId', 'status', 'totalAmount',
        // Recent Additions
        'approved', 'order_type', 'paid_amount', 'discount_amount'
    ]
};

interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
}

interface TableInfo {
    [tableName: string]: ColumnInfo[];
}

export default function SchemaCheckPage() {
    const [actualSchema, setActualSchema] = useState<TableInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [fixLoading, setFixLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fixResult, setFixResult] = useState<string[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const fetchSchema = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/admin-fix/table-info`);
            const data = await res.json();

            if (data.success && data.tables) {
                setActualSchema(data.tables);
            } else {
                setError(data.error || 'Failed to fetch schema info');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const runFix = async () => {
        setFixLoading(true);
        setFixResult([]);
        try {
            // Run both fixes sequentially
            const res1 = await fetch(`${API_URL}/admin-fix/fix-db-schema`);
            const data1 = await res1.json();

            const res2 = await fetch(`${API_URL}/admin-fix/apply-campaigns`);
            const data2 = await res2.json();

            const logs = [
                ...(data1.success ? ['Schema Fix: Success'] : ['Schema Fix: Failed']),
                ...(data2.success ? ['Campaign Fix: Success'] : ['Campaign Fix: Failed']),
                ...(data2.logs || [])
            ];

            setFixResult(logs);
            // Re-fetch schema after fix
            fetchSchema();
        } catch (err: any) {
            setFixResult([`Error: ${err.message}`]);
        } finally {
            setFixLoading(false);
        }
    };

    useEffect(() => {
        fetchSchema();
    }, []);

    const renderComparison = (tableName: string) => {
        const expectedCols = EXPECTED_SCHEMA[tableName] || [];
        const actualCols = actualSchema?.[tableName] || [];

        const actualColNames = actualCols.map(c => c.column_name);

        // Find missing
        const missing = expectedCols.filter(col => !actualColNames.includes(col));

        // Find extra (just for info)
        const extra = actualColNames.filter(col => !expectedCols.includes(col));

        const isGood = missing.length === 0;

        return (
            <div className={`mb-8 border rounded-xl overflow-hidden ${isGood ? 'border-green-200 bg-white' : 'border-red-200 bg-red-50'}`}>
                <div className={`px-6 py-4 flex justify-between items-center ${isGood ? 'bg-green-50' : 'bg-red-100'}`}>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FaDatabase className={isGood ? 'text-green-600' : 'text-red-600'} />
                        {tableName}
                        {isGood ?
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">OK</span> :
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">{missing.length} Missing</span>
                        }
                    </h3>
                    <div className="text-sm text-gray-500">
                        Total Columns: {actualCols.length}
                    </div>
                </div>

                <div className="p-6">
                    {/* Missing Columns Alert */}
                    {missing.length > 0 && (
                        <div className="mb-6 bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                            <h4 className="font-bold text-red-600 flex items-center gap-2 mb-2">
                                <FaExclamationTriangle /> Missing Columns (Action Required)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {missing.map(col => (
                                    <span key={col} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-mono border border-red-200">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expectedCols.map(col => {
                            const exists = actualColNames.includes(col);
                            const info = actualCols.find(c => c.column_name === col);

                            return (
                                <div key={col} className={`p-3 rounded border text-sm flex justify-between items-center ${exists ? 'bg-white border-gray-200' : 'bg-red-50 border-red-300'}`}>
                                    <div className="font-mono font-semibold">
                                        {col}
                                        {info && <span className="block text-xs text-gray-400 font-normal">{info.data_type}</span>}
                                    </div>
                                    <div>
                                        {exists ?
                                            <FaCheck className="text-green-500" /> :
                                            <FaTimes className="text-red-500" />
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Extra Columns */}
                    {extra.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Other Existing Columns</h5>
                            <div className="flex flex-wrap gap-2">
                                {extra.map(col => (
                                    <span key={col} className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FaTools className="text-blue-600" />
                            Database Schema Validator
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Compare actual database structure vs expected application requirements.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchSchema}
                            disabled={loading}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={runFix}
                            disabled={fixLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 font-bold"
                        >
                            {fixLoading ? 'Applying Fixes...' : 'Auto Fix All Issues'}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8">
                        <p className="font-bold">Error Fetching Schema</p>
                        <p>{error}</p>
                    </div>
                )}

                {fixResult.length > 0 && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-8 font-mono text-sm max-h-40 overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 text-gray-400 text-xs border-b border-gray-700 pb-1 mb-2">Fix Logs</div>
                        {fixResult.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                )}

                {loading && !actualSchema ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="animate-spin text-4xl mb-4 mx-auto w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
                        Loading Schema Information...
                    </div>
                ) : (
                    <div>
                        {Object.keys(EXPECTED_SCHEMA).map(tableName => renderComparison(tableName))}
                    </div>
                )}
            </div>
        </div>
    );
}
