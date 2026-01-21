'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPrint, FaCheck, FaTimes, FaPlug, FaSync, FaCog, FaBars } from 'react-icons/fa';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { LanguageProvider } from '@/context/LanguageContext';

interface Station {
    id: string;
    name: string;
    ip: string | null;
    port: number;
    enabled: boolean;
    type: string;
    language?: string; // 'tr' veya 'zh'
}

function PrinterManagementContent() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingStation, setTestingStation] = useState<string | null>(null);
    const [editingStation, setEditingStation] = useState<Station | null>(null);

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
            const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

            const response = await fetch(`${apiUrl}/printers`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                setStations(data.data);
            } else {
                // Fallback: Mock data
                console.warn('⚠️ API\'den veri gelmedi, mock data kullanılıyor');
                setMockData();
            }
        } catch (error) {
            console.error('❌ Stations load error:', error);
            // Hata durumunda mock data göster
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        // Boş array - Kullanıcı kendi istasyonlarını ekleyecek
        setStations([]);
    };

    const handleSaveStation = async (station: Station) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
            const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

            const response = await fetch(`${apiUrl}/printers/${station.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: station.ip,
                    port: station.port,
                    enabled: station.enabled,
                    type: station.type,
                    language: station.language || 'tr'
                })
            });

            const data = await response.json();
            if (data.success) {
                await loadStations();
                setEditingStation(null);
                alert('✅ Ayarlar kaydedildi');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Kaydetme hatası');
        }
    };

    const BRIDGE_URL = 'http://localhost:3005';

    const handleTestPrint = async (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (!station || !station.ip) {
            alert('❌ Hata: Yazıcı IP adresi bulunamadı.');
            return;
        }

        try {
            setTestingStation(stationId);
            // Local Bridge üzerinden test yazdırma (Debug sayfasındaki mantık)
            const res = await fetch(`${BRIDGE_URL}/test/${station.ip}`, { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert('✅ Test yazdırma başarılı! (Local Bridge)');
            } else {
                alert(`❌ Hata: ${data.error}`);
            }
        } catch (error: any) {
            console.error('Test print error:', error);
            alert(`❌ Test yazdırma hatası: ${error.message}. Local Printer Bridge çalışıyor mu? (Port 3005)`);
        } finally {
            setTestingStation(null);
        }
    };

    const handleCheckStatus = async (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (!station || !station.ip) {
            alert('❌ Hata: Yazıcı IP adresi bulunamadı.');
            return;
        }

        try {
            // Local Bridge üzerinden durum kontrolü (Debug sayfasındaki mantık)
            const res = await fetch(`${BRIDGE_URL}/status/${station.ip}`);
            const data = await res.json();

            if (data.connected) {
                alert(`✅ ${station.name} (${station.ip}) bağlı ve erişilebilir.`);
            } else {
                alert(`❌ Yazıcıya ulaşılamıyor: ${data.error || 'Bilinmeyen hata'}`);
            }
        } catch (error: any) {
            console.error('Status check error:', error);
            alert(`❌ Durum kontrolü başarısız: ${error.message}. Local Printer Bridge çalışıyor mu?`);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <BusinessSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <FaBars className="text-2xl" />
                    </button>
                    <h1 className="font-bold text-gray-800">Yazıcı Yönetimi</h1>
                    <div className="w-8"></div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <FaSync className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
                                <p className="text-gray-600">Yükleniyor...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
                                <div className="flex items-center gap-3">
                                    <FaPrint className="text-3xl" />
                                    <div>
                                        <h1 className="text-3xl font-bold">Bondrucker Yönetimi</h1>
                                        <p className="text-purple-100">İstasyon yazıcılarını yapılandırın</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stations Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stations.map(station => (
                                    <div
                                        key={station.id}
                                        className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all ${station.enabled && station.ip
                                            ? 'border-green-500'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        {/* Station Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <FaPrint className={`text-2xl ${station.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                                <div>
                                                    <h3 className="font-bold text-lg">{station.name}</h3>
                                                    <p className="text-xs text-gray-500">{station.id}</p>
                                                </div>
                                            </div>
                                            <div>
                                                {station.enabled && station.ip ? (
                                                    <FaCheck className="text-green-600 text-xl" />
                                                ) : (
                                                    <FaTimes className="text-gray-400 text-xl" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Configuration Form */}
                                        {editingStation?.id === station.id ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        IP Adresi
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editingStation.ip || ''}
                                                        onChange={e => setEditingStation({ ...editingStation, ip: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                                        placeholder="192.168.1.100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Port
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editingStation.port}
                                                        onChange={e => setEditingStation({ ...editingStation, port: parseInt(e.target.value) })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Dil / Language
                                                    </label>
                                                    <select
                                                        value={editingStation.language || 'tr'}
                                                        onChange={e => setEditingStation({ ...editingStation, language: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                                    >
                                                        <option value="tr">🇹🇷 Türkçe</option>
                                                        <option value="zh">🇨🇳 中文 (Çince)</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingStation.enabled}
                                                        onChange={e => setEditingStation({ ...editingStation, enabled: e.target.checked })}
                                                        className="w-4 h-4"
                                                    />
                                                    <label className="text-sm font-medium">Aktif</label>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleSaveStation(editingStation)}
                                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                                                    >
                                                        💾 Kaydet
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingStation(null)}
                                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-semibold"
                                                    >
                                                        ✖️ İptal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Current Configuration */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600">IP Adresi</p>
                                                        <p className="font-mono text-sm font-semibold">
                                                            {station.ip || '(Tanımlı değil)'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600">Port</p>
                                                        <p className="font-mono text-sm font-semibold">{station.port}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600">Dil</p>
                                                        <p className="font-semibold text-sm">
                                                            {station.language === 'zh' ? '🇨🇳 中文 (Çince)' : '🇹🇷 Türkçe'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600">Durum</p>
                                                        <p className={`font-semibold text-sm ${station.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                                            {station.enabled ? '✅ Aktif' : '❌ Devre Dışı'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => setEditingStation(station)}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center justify-center gap-2"
                                                    >
                                                        <FaCog />
                                                        Yapılandır
                                                    </button>

                                                    {station.enabled && station.ip && (
                                                        <>
                                                            <button
                                                                onClick={() => handleCheckStatus(station.id)}
                                                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center justify-center gap-2"
                                                            >
                                                                <FaPlug />
                                                                Bağlantıyı Test Et
                                                            </button>

                                                            <button
                                                                onClick={() => handleTestPrint(station.id)}
                                                                disabled={testingStation === station.id}
                                                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FaPrint />
                                                                {testingStation === station.id ? 'Yazdırılıyor...' : 'Test Yazdır'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                                <h3 className="font-bold text-blue-800 mb-2">ℹ️ Kullanım Bilgileri</h3>
                                <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                                    <li>Her istasyon için ayrı bir termal yazıcı (Bondrucker) tanımlayabilirsiniz</li>
                                    <li>Yazıcılar ağ üzerinden IP adresi ile bağlanır (genellikle port 9100)</li>
                                    <li>Siparişler ilgili istasyonlara otomatik yazdırılabilir</li>
                                    <li>Test yazdırma ile yazıcı bağlantısını doğrulayabilirsiniz</li>
                                    <li>Desteklenen protokol: ESC/POS (EPSON, STAR, vb.)</li>
                                    <li>Türkçe ve Çince karakterler destekleniyor (CP857, GB18030)</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PrinterManagementPage() {
    return (
        <LanguageProvider>
            <PrinterManagementContent />
        </LanguageProvider>
    );
}
