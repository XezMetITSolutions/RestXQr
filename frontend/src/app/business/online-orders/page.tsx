'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';
import {
    FaGlobe,
    FaBars,
    FaCheckCircle,
    FaTimesCircle,
    FaCog,
    FaSave,
    FaExternalLinkAlt,
    FaQuestionCircle
} from 'react-icons/fa';

export default function OnlineOrdersPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated, logout, authenticatedRestaurant } = useAuthStore();
    const hasDeliveryIntegration = useFeature('delivery_integration');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Platform states
    const [platforms, setPlatforms] = useState([
        {
            id: 'getir',
            name: 'Getir Yemek',
            slug: 'getir-yemek',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Getir_logo.svg',
            connected: false,
            apiKey: '',
            apiSecret: '',
            storeId: '',
            autoAccept: true,
            status: 'inactive'
        },
        {
            id: 'yemeksepeti',
            name: 'Yemeksepeti',
            slug: 'yemeksepeti',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Yemeksepeti_logo.png',
            connected: false,
            apiKey: '',
            apiSecret: '',
            storeId: '',
            autoAccept: true,
            status: 'inactive'
        },
        {
            id: 'trendyol',
            name: 'Trendyol Yemek',
            slug: 'trendyol-yemek',
            logo: 'https://cdn.worldvectorlogo.com/logos/trendyol-yemek.svg',
            connected: false,
            apiKey: '',
            apiSecret: '',
            storeId: '',
            autoAccept: true,
            status: 'inactive'
        }
    ]);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/isletme-giris');
        }
    }, [isAuthenticated, router]);

    const handleToggleConnection = (id: string) => {
        setPlatforms(prev => prev.map(p =>
            p.id === id ? { ...p, connected: !p.connected, status: !p.connected ? 'active' : 'inactive' } : p
        ));
    };

    const handleUpdatePlatform = (id: string, updates: any) => {
        setPlatforms(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates } : p
        ));
    };

    const handleSave = async (id: string) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert(t('Yapılandırma başarıyla kaydedildi.'));
        }, 1000);
    };

    const handleLogout = () => {
        logout();
        router.push('/isletme-giris');
    };

    if (!hasDeliveryIntegration) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-[40px] shadow-2xl max-w-md border border-gray-100">
                    <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-500">
                        <FaGlobe size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase italic">ERİŞİM KISITLI</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Online sipariş entegrasyonu (Getir, Yemeksepeti, Trendyol) özelliğini kullanmak için planınızı yükseltmeniz gerekmektedir.
                    </p>
                    <button
                        onClick={() => router.push('/business/dashboard')}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl"
                    >
                        PLANLARI İNCELE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BusinessSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <div className="ml-0 lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 px-6 py-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-4 hover:bg-gray-100 rounded-2xl transition-all"
                            >
                                <FaBars className="text-xl text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent uppercase italic">
                                    ONLINE SİPARİŞ ENTEGRASYONU
                                </h1>
                                <p className="text-gray-500 font-bold mt-1">Platform bağlantılarını ve API ayarlarını yönetin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-12 space-y-8">
                    {/* Alerts/Status Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {platforms.map(p => (
                            <div key={p.id} className={`bg-white rounded-3xl p-6 border-2 transition-all ${p.connected ? 'border-green-500/20 bg-green-50/10' : 'border-gray-100 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 bg-white rounded-xl shadow-md p-2 flex items-center justify-center overflow-hidden border">
                                        <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {p.connected ? 'BAĞLI' : 'BAĞLI DEĞİL'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-800">{p.name}</h3>
                                <p className="text-sm text-gray-500 font-bold mt-1">
                                    {p.connected ? 'Siparişler otomatik alınıyor' : 'Yapılandırma gerekiyor'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Configuration Cards */}
                    <div className="space-y-8">
                        {platforms.map(p => (
                            <div key={p.id} className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
                                <div className="p-8 lg:p-10">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[30px] p-4 flex items-center justify-center shadow-lg border border-gray-100">
                                                <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div>
                                                <h2 className="text-4xl font-black text-gray-900 italic uppercase">{p.name} Ayarları</h2>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {p.connected ? <FaCheckCircle /> : <FaTimesCircle />}
                                                        {p.connected ? 'AKTİF' : 'PASİF'}
                                                    </span>
                                                    <button onClick={() => handleToggleConnection(p.id)} className="text-xs font-black text-orange-600 hover:underline">
                                                        {p.connected ? 'Bağlantıyı Kes' : 'Şimdi Bağla'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="flex items-center gap-3 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">
                                                <FaQuestionCircle />
                                                <span>KLAVUZ</span>
                                            </button>
                                            <button
                                                onClick={() => handleSave(p.id)}
                                                disabled={loading}
                                                className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                            >
                                                <FaSave />
                                                <span>KAYDET</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">API KEY (ANAHTAR)</label>
                                                <input
                                                    type="password"
                                                    value={p.apiKey}
                                                    onChange={(e) => handleUpdatePlatform(p.id, { apiKey: e.target.value })}
                                                    placeholder="Platformdan aldığınız API anahtarı"
                                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white transition-all font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">API SECRET (GİZLİ ŞİFRE)</label>
                                                <input
                                                    type="password"
                                                    value={p.apiSecret}
                                                    onChange={(e) => handleUpdatePlatform(p.id, { apiSecret: e.target.value })}
                                                    placeholder="Platformdan aldığınız gizli anahtar"
                                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white transition-all font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">MAĞAZA ID</label>
                                                <input
                                                    type="text"
                                                    value={p.storeId}
                                                    onChange={(e) => handleUpdatePlatform(p.id, { storeId: e.target.value })}
                                                    placeholder="Platformdaki işletme numaranız"
                                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-8 bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                                            <h4 className="text-xl font-black text-gray-800 uppercase italic">GELİŞMİŞ OPSİYONLAR</h4>

                                            <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm">
                                                <div>
                                                    <p className="font-black text-gray-800">Otomatik Sipariş Onayı</p>
                                                    <p className="text-sm text-gray-500 font-bold">Gelen siparişleri anında mutfağa ilet</p>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdatePlatform(p.id, { autoAccept: !p.autoAccept })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${p.autoAccept ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${p.autoAccept ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>

                                            <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                                <div className="flex items-start gap-4">
                                                    <FaCog className="text-orange-500 mt-1" />
                                                    <div>
                                                        <p className="font-black text-orange-900 text-sm">ENTEGRASYON NOTU</p>
                                                        <p className="text-sm text-orange-800 font-medium mt-1">
                                                            API bağlantısı sağlandıktan sonra ürünlerinizin platform ID'lerini menü yönetimi kısmından eşleştirmeniz gerekmektedir.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-black hover:border-gray-900 hover:text-gray-900 transition-all flex items-center justify-center gap-3">
                                                <FaExternalLinkAlt />
                                                <span>PLATFORM PANELİNE GİT</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
