'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { FaPercent, FaCheck, FaTimes, FaSync, FaExclamationTriangle, FaTools, FaDatabase } from 'react-icons/fa';

/**
 * Kampanya Özelliği Hata Ayıklama Sayfası
 * 500 Internal Server Error hatalarını çözmek için tasarlanmıştır.
 */
export default function CampaignDebugPage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fixing, setFixing] = useState(false);
    const [fixResult, setFixResult] = useState<any>(null);

    const checkSchema = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await apiService.getTableInfo();
            if (response.success) {
                const menuItemsCols = response.tables.menu_items.map((c: any) => c.column_name);
                const menuCategoriesCols = response.tables.menu_categories.map((c: any) => c.column_name);

                const campaignCols = [
                    'discount_percentage',
                    'discounted_price',
                    'discount_start_date',
                    'discount_end_date'
                ];

                const missingInItems = campaignCols.filter(c => !menuItemsCols.includes(c));
                const missingInCategories = ['discount_percentage', 'discount_start_date', 'discount_end_date'].filter(c => !menuCategoriesCols.includes(c));

                setStatus({
                    items: {
                        total: menuItemsCols.length,
                        missing: missingInItems,
                        all: menuItemsCols
                    },
                    categories: {
                        total: menuCategoriesCols.length,
                        missing: missingInCategories,
                        all: menuCategoriesCols
                    }
                });
            } else {
                setError(response.message || 'Tablo bilgileri alınamadı');
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleFix = async () => {
        if (!confirm('Veritabanına eksik kampanya sütunlarını eklemek üzeresiniz. Devam edilsin mi?')) return;

        setFixing(true);
        try {
            const response = await apiService.fixDbSchema();
            setFixResult(response);
            await checkSchema();
        } catch (err: any) {
            setFixResult({ success: false, message: err.message });
        } finally {
            setFixing(false);
        }
    };

    useEffect(() => {
        checkSchema();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <FaPercent className="text-indigo-600" /> Kampanya Sistemi Debug
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Ürün düzenleme sırasında oluşan 500 hatalarını gidermek için veritabanı kontrolü.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={checkSchema}
                            disabled={loading}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} /> Yenile
                        </button>
                        <button
                            onClick={handleFix}
                            disabled={fixing || loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 hover:-translate-y-0.5"
                        >
                            <FaTools /> {fixing ? 'Düzeltiliyor...' : 'Hemen Düzelt'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800">Hata Oluştu</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {fixResult && (
                    <div className={`border rounded-xl p-4 mb-6 flex items-start gap-3 ${fixResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        {fixResult.success ? <FaCheck className="text-emerald-500 mt-1" /> : <FaTimes className="text-red-500 mt-1" />}
                        <div>
                            <h3 className={`font-bold ${fixResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                {fixResult.success ? 'İşlem Başarılı' : 'İşlem Başarısız'}
                            </h3>
                            <p className={`${fixResult.success ? 'text-emerald-700' : 'text-red-700'} text-sm`}>{fixResult.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Menu Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaDatabase className="text-indigo-400" /> menu_items
                            </h2>
                            {status?.items?.missing?.length === 0 ? (
                                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">SORUNSUZ</span>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-1 rounded-full">EKSİK VAR</span>
                            )}
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-4">Ürün tablosundaki kampanya sütunları:</p>
                            <div className="space-y-2">
                                {[
                                    'discount_percentage',
                                    'discounted_price',
                                    'discount_start_date',
                                    'discount_end_date'
                                ].map(col => {
                                    const exists = status?.items?.all?.includes(col);
                                    return (
                                        <div key={col} className={`flex items-center justify-between p-3 rounded-lg border ${exists ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                            <code className="text-sm font-semibold">{col}</code>
                                            {exists ? <FaCheck className="text-emerald-500" /> : <FaTimes className="text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Menu Categories Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaDatabase className="text-indigo-400" /> menu_categories
                            </h2>
                            {status?.categories?.missing?.length === 0 ? (
                                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">SORUNSUZ</span>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-1 rounded-full">EKSİK VAR</span>
                            )}
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-4">Kategori tablosundaki kampanya sütunları:</p>
                            <div className="space-y-2">
                                {[
                                    'discount_percentage',
                                    'discount_start_date',
                                    'discount_end_date'
                                ].map(col => {
                                    const exists = status?.categories?.all?.includes(col);
                                    return (
                                        <div key={col} className={`flex items-center justify-between p-3 rounded-lg border ${exists ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                            <code className="text-sm font-semibold">{col}</code>
                                            {exists ? <FaCheck className="text-emerald-500" /> : <FaTimes className="text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-2">
                        <FaTools className="text-indigo-600" /> Nasıl Çözülür?
                    </h3>
                    <p className="text-indigo-800 text-sm leading-relaxed">
                        Ürün düzenleme sayfasında Kaydet butonuna bastığınızda 500 hatası alıyorsanız, muhtemelen yukarıda kırmızı ile işaretlenen sütunlar veritabanınızda yoktur.
                        <strong>"Hemen Düzelt"</strong> butonuna basarak bu sütunları otomatik olarak ekleyebilirsiniz. Bu işlem mevcut verilerinize zarar vermez.
                    </p>
                </div>
            </div>
        </div>
    );
}
