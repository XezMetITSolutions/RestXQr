'use client';

import { useState, useEffect } from 'react';
import { FaPrint, FaArrowLeft, FaReceipt, FaMobileAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function ReceiptPreviewPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/debug/font-test" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <FaArrowLeft /> Font Testine Dön
                    </Link>
                    <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1 rounded-full text-sm font-medium border border-indigo-500/20">
                        Fiş Önizleme Modu (Çok Büyük #5)
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Visual Preview */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FaReceipt className="text-indigo-400" /> Gerçek Çıktı Görünümü
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Yazıcıdan çıkacak fişin ölçeklendirilmiş simulasyonu aşağıdadır.
                        </p>

                        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-10 text-black font-mono w-full max-w-[380px] mx-auto border-t-[12px] border-indigo-500 relative">
                            {/* Paper Tear Effect Tip */}
                            <div className="absolute -bottom-3 left-0 right-0 h-6 bg-[url('https://www.transparenttextures.com/patterns/zig-zag.png')] opacity-10"></div>

                            {/* Receipt Content */}
                            <div className="flex flex-col items-center text-center">
                                {/* Table Number - VERY LARGE */}
                                <div className="text-[3.5rem] leading-none font-black mb-1 uppercase tracking-tighter">
                                    MASA 26
                                </div>
                                <div className="text-xs mb-4 text-gray-600">
                                    02/02/2026 00:41:28
                                </div>

                                <div className="w-full border-t border-dashed border-gray-400 my-4"></div>

                                {/* Items Container */}
                                <div className="w-full text-left space-y-6">
                                    {/* Item 1 */}
                                    <div>
                                        <div className="text-[1.8rem] leading-tight font-black uppercase tracking-tight">
                                            1 x Dana etli ramen
                                        </div>
                                        {/* Variation */}
                                        <div className="text-lg font-black mt-1 text-gray-800">
                                            * KÜÇÜK *
                                        </div>
                                        {/* Options */}
                                        <div className="text-sm mt-1 text-gray-700">
                                            + Ekstra Yumurta
                                        </div>
                                        {/* Chinese */}
                                        <div className="text-sm text-gray-500 mt-1">
                                            牛肉拉面 (Niúròu lāmiàn)
                                        </div>
                                        {/* Note */}
                                        <div className="text-md font-black mt-2 bg-gray-100 p-1 inline-block border-l-4 border-black">
                                            [ NOT: ACISIZ OLSUN ]
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div>
                                        <div className="text-[1.8rem] leading-tight font-black uppercase tracking-tight">
                                            2 x Adana Kebap
                                        </div>
                                        {/* Variation */}
                                        <div className="text-lg font-black mt-1 text-gray-800">
                                            * BÜYÜK PORSİYON *
                                        </div>
                                        {/* Chinese */}
                                        <div className="text-sm text-gray-500 mt-1">
                                            阿达纳烤肉
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full border-t border-dashed border-gray-400 my-6"></div>

                                <div className="text-lg font-black">AFIYET OLSUN!</div>
                                <div className="text-[10px] mt-2 text-gray-400 uppercase tracking-widest">RestXQR Local Bridge</div>
                            </div>
                        </div>
                    </div>

                    {/* Explanation Section */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6 self-stretch">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-300">
                            <FaMobileAlt /> Yapılandırma Detayları
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <div className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">Masa Numarası</div>
                                <p className="text-sm text-slate-300">
                                    Double Height + Double Width + Bold (En büyük ayar).
                                    <br />Mutfakta uzaktan okunabilirliği sağlar.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <div className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">Ürün İsimleri</div>
                                <p className="text-sm text-slate-300">
                                    Double Height + Double Width + Bold.
                                    <br />Kağıda sığacak şekilde optimize edildi.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <div className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">Varyasyon (Küçük/Büyük)</div>
                                <p className="text-sm text-slate-300">
                                    Gittiğimiz yeni ayar: <span className="text-white font-bold">* VARYASYON *</span> formatında ve Bold.
                                    Artık mutfakta ürünün boyutu gözden kaçmaz.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <div className="text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">Özel Notlar</div>
                                <p className="text-sm text-slate-300">
                                    Bold ve <span className="text-white font-bold">[ NOT: ... ]</span> köşeli parantez içinde.
                                    Hatalı sipariş hazırlığını önlemek için vurgulandı.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                <FaPrint className="inline-block mr-2" /> Canlı Çıktı Testini Başlat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
