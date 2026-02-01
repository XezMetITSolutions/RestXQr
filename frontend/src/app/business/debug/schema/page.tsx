'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { FaDatabase, FaCheck, FaTimes, FaSync, FaExclamationTriangle, FaTools } from 'react-icons/fa';

const EXPECTED_COLUMNS = {
    restaurants: [
        'id', 'name', 'username', 'email', 'password', 'phone', 'address',
        'logo', 'banner', 'is_active', 'rating', 'review_count',
        'cuisine_types', 'features', 'business_hours', 'social_media',
        'location', 'settings', 'printer_config', 'kitchen_stations',
        'subscription_plan', 'subscription_status', 'max_tables', 'max_menu_items', 'max_staff',
        'qr_code_settings', 'created_at', 'updated_at'
    ],
    menu_items: [
        'id', 'restaurant_id', 'category_id', 'name', 'description', 'price',
        'image_url', 'video_url', 'video_thumbnail', 'video_duration',
        'is_available', 'is_popular', 'preparation_time', 'calories',
        'ingredients', 'allergens', 'portion_size', 'display_order',
        'subcategory', 'portion', 'kitchen_station', 'variations', 'options',
        'type', 'bundle_items', 'translations',
        'discounted_price', 'discount_percentage', 'discount_start_date', 'discount_end_date',
        'created_at', 'updated_at'
    ],
    menu_categories: [
        'id', 'restaurant_id', 'name', 'description', 'display_order',
        'is_active', 'kitchen_station',
        'discount_percentage', 'discount_start_date', 'discount_end_date',
        'created_at', 'updated_at'
    ],
    staff: [
        'id', 'restaurantId', 'name', 'email', 'username', 'password',
        'phone', 'role', 'status', 'permissions', 'createdAt', 'updatedAt'
    ],
    orders: [
        'id', 'restaurant_id', 'table_number', 'customer_name', 'status',
        'approved', 'total_amount', 'notes', 'order_type', 'paid_amount',
        'discount_amount', 'discount_reason', 'cashier_note', 'created_at', 'updated_at'
    ],
    order_items: [
        'id', 'order_id', 'menu_item_id', 'quantity', 'unit_price', 'total_price',
        'notes', 'created_at', 'updated_at'
    ],
    qr_tokens: [
        'id', 'restaurant_id', 'table_number', 'token', 'expires_at', 'is_active',
        'session_id', 'used_at', 'created_by', 'created_at', 'updated_at'
    ]
};

export default function SchemaDebugPage() {
    const [dbInfo, setDbInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fixing, setFixing] = useState(false);
    const [fixResult, setFixResult] = useState<any>(null);

    const fetchDbInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await apiService.getTableInfo();
            if (response.success) {
                setDbInfo(response.tables);
            } else {
                setError(response.message || 'Failed to fetch table info');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleFixSchema = async () => {
        if (!confirm('Veritabanı şemasını düzeltmek istediğinize emin misiniz? Bu işlem eksik sütunları ekleyecektir.')) return;

        setFixing(true);
        setFixResult(null);
        try {
            const response = await apiService.fixDbSchema();
            setFixResult(response);
            fetchDbInfo(); // Refresh after fix
        } catch (err: any) {
            setFixResult({ success: false, message: err.message });
        } finally {
            setFixing(false);
        }
    };

    useEffect(() => {
        fetchDbInfo();
    }, []);

    const renderComparison = (tableName: string) => {
        if (!dbInfo) return null;

        const existingColumns = dbInfo[tableName] || [];
        const existingColNames = existingColumns.map((c: any) => c.column_name);
        const expectedColNames = EXPECTED_COLUMNS[tableName as keyof typeof EXPECTED_COLUMNS] || [];

        const missingColumns = expectedColNames.filter(name => !existingColNames.includes(name));
        const extraColumns = existingColNames.filter((name: string) => !expectedColNames.includes(name));

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <FaDatabase className="text-blue-500" /> {tableName}
                    </h2>
                    <div className="flex gap-4 text-sm">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {existingColNames.length} Mevcut
                        </span>
                        {missingColumns.length > 0 && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                                {missingColumns.length} Eksik
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column Comparison List */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Sütun Durumu</h3>
                            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                                {expectedColNames.map(col => {
                                    const exists = existingColNames.includes(col);
                                    return (
                                        <div key={col} className={`flex items-center justify-between p-2 rounded text-sm font-mono ${exists ? 'bg-green-50' : 'bg-red-50 text-red-700'}`}>
                                            <span>{col}</span>
                                            {exists ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Extra Columns */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Ekstra Sütunlar (DB'de var, Modelde yok)</h3>
                            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                                {extraColumns.length > 0 ? (
                                    extraColumns.map((col: string) => (
                                        <div key={col} className="flex items-center justify-between p-2 rounded text-sm font-mono bg-yellow-50 text-yellow-700">
                                            <span>{col}</span>
                                            <FaExclamationTriangle className="text-yellow-500" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm italic py-4">Ekstra sütun bulunamadı.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Veritabanı Şema Analizi</h1>
                        <p className="text-gray-500 mt-2">Backend modelleri ile fiziksel PostgreSQL database tablolarının karşılaştırması.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchDbInfo}
                            className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm font-medium"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} /> Yenile
                        </button>
                        <button
                            onClick={handleFixSchema}
                            disabled={fixing}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md font-medium disabled:opacity-50"
                        >
                            <FaTools /> {fixing ? 'Düzeltiliyor...' : 'Şemayı Düzelt'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                        <div className="flex items-center">
                            <FaTimes className="text-red-500 mr-3" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {fixResult && (
                    <div className={`p-4 mb-8 rounded-lg border ${fixResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            {fixResult.success ? <FaCheck /> : <FaTimes />} Düzeltme İşlemi Sonucu
                        </h3>
                        <p>{fixResult.message || (fixResult.success ? 'Şema başarıyla güncellendi!' : 'Hata oluştu.')}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 animate-pulse">Veritabanı bilgileri alınıyor...</p>
                    </div>
                ) : (
                    <>
                        {Object.keys(EXPECTED_COLUMNS).map(tableName => renderComparison(tableName))}
                    </>
                )}
            </div>
        </div>
    );
}
