'use client';

import React, { useEffect, useState } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import { FaGlobe, FaLanguage, FaUtensils } from 'react-icons/fa';

export default function MenuDetailsPage() {
    const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';
    const { menuItems, fetchRestaurantMenu, loading } = useRestaurantStore();
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        fetchRestaurantMenu(KROREN_RESTAURANT_ID);
    }, [fetchRestaurantMenu]);

    useEffect(() => {
        if (menuItems.length > 0) {
            setItems(menuItems.filter((i: any) => i.restaurantId === KROREN_RESTAURANT_ID));
        }
    }, [menuItems]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium animate-pulse">Menü Detayları Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900 flex items-center gap-3">
                            <FaUtensils className="text-indigo-600" />
                            Kroren Menü Detay Listesi
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Tüm dillerdeki isim ve açıklamaların toplu görünümü</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <FaGlobe className="text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-800">{items.length} Ürün Mevcut</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all group"
                        >
                            <div className="p-6 md:p-8">
                                {/* Item Index & Base Name */}
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-indigo-100 shadow-lg">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">
                                            {item.name}
                                        </h2>
                                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                            ID: {item.id.slice(0, 8)}
                                        </span>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-900 drop-shadow-sm">
                                        {item.price} <span className="text-sm font-bold">₺</span>
                                    </div>
                                </div>

                                {/* language Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Turkish */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-indigo-700">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">Türkçe</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.tr?.name || item.name}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.tr?.description || item.description || 'Açıklama yok'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* English */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-indigo-50/30 border border-indigo-50 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">English</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.en?.name || '---'}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.en?.description || '---'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chinese */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-red-50/30 border border-red-50 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">Çince (中文)</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.zh?.name || '---'}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.zh?.description || '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        :root {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
        </div>
    );
}
