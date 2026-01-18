'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBug, FaTrash, FaExclamationTriangle, FaArrowLeft, FaCheckCircle, FaClock, FaRedo } from 'react-icons/fa';

export default function KasaDebugPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [restaurantUsername, setRestaurantUsername] = useState<string>('');
    const [restaurantName, setRestaurantName] = useState<string>('');
    const [confirmText, setConfirmText] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
    const [activeOrderCount, setActiveOrderCount] = useState<number | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    useEffect(() => {
        const user = localStorage.getItem('staff_user');
        if (!user) {
            router.push('/staff-login');
            return;
        }

        const parsedUser = JSON.parse(user);
        setRestaurantId(parsedUser.restaurantId || '');
        setRestaurantUsername(parsedUser.restaurantUsername || parsedUser.username || '');
        setRestaurantName(parsedUser.restaurantName || '');

        // Initial count fetch
        if (parsedUser.restaurantId) {
            fetchActiveOrderCount(parsedUser.restaurantId);
        }
    }, [router]);

    const fetchActiveOrderCount = async (resId: string) => {
        try {
            const response = await fetch(`${API_URL}/orders?restaurantId=${resId}&status=all`);
            const data = await response.json();
            if (data.success) {
                const active = (data.data || []).filter((o: any) =>
                    ['pending', 'preparing', 'ready'].includes(o.status)
                );
                setActiveOrderCount(active.length);
            }
        } catch (err) {
            console.error('Count fetch error:', err);
        }
    };

    const handleDeleteActiveOrders = async () => {
        if (confirmText !== 'SİL') {
            alert('Lütfen onay için "SİL" yazın');
            return;
        }

        setLoading(true);
        setStatus({ type: 'idle', message: '' });

        try {
            const response = await fetch(`${API_URL}/orders/debug/delete-active`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurantUsername: restaurantUsername
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus({
                    type: 'success',
                    message: `Başarılı! ${data.deletedCount} aktif sipariş silindi.`
                });
                setConfirmText('');
                if (restaurantId) fetchActiveOrderCount(restaurantId);
            } else {
                setStatus({
                    type: 'error',
                    message: `Hata: ${data.message || 'Bir sorun oluştu'}`
                });
            }
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: `Bağlantı hatası: ${err.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans selection:bg-red-500/30">
            <div className="max-w-2xl mx-auto py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Geri Dön</span>
                    </button>
                    <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                        <FaBug className="text-red-500 animate-pulse" />
                        <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Debug Mode</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/5 p-10 shadow-2xl">
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Aktif Siparişleri Temizle
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {restaurantName} için tüm aktif süreçleri sıfırlayın.
                        </p>
                    </div>

                    {/* Warning Card */}
                    <div className="bg-red-500/5 rounded-3xl border border-red-500/20 p-8 mb-10">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-500/20 p-3 rounded-2xl">
                                <FaExclamationTriangle className="text-red-500 text-xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-red-500 font-bold mb-2 uppercase tracking-wide">DİKKAT: GERİ ALINAMAZ</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                    Bu işlem aşağıdaki durumdaki <strong>TÜM</strong> siparişleri kalıcı olarak silecektir:
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {[
                                        { label: 'Bekleyen', icon: <FaClock className="text-yellow-500" /> },
                                        { label: 'Hazırlanan', icon: <FaClock className="text-blue-500" /> },
                                        { label: 'Hazır', icon: <FaClock className="text-green-500" /> },
                                        { label: 'Masasızlar', icon: <FaClock className="text-purple-500" /> }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                            {item.icon}
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-6 mb-10">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Şu Anki Aktif Siparişler</p>
                                <p className="text-3xl font-black">{activeOrderCount !== null ? activeOrderCount : '...'}</p>
                            </div>
                            <button
                                onClick={() => restaurantId && fetchActiveOrderCount(restaurantId)}
                                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                                title="Yenile"
                            >
                                <FaRedo className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-slate-500 text-xs font-bold uppercase mb-3 ml-1 tracking-widest text-center">
                                Onaylamak için "SİL" yazın
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="SİL"
                                className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-5 px-6 text-center text-2xl font-black text-red-500 focus:border-red-500/50 focus:outline-none transition-all placeholder:text-white/5"
                            />
                        </div>

                        <button
                            onClick={handleDeleteActiveOrders}
                            disabled={loading || confirmText !== 'SİL'}
                            className={`w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] ${loading || confirmText !== 'SİL'
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale'
                                : 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-red-500/20 active:from-red-700'
                                }`}
                        >
                            <FaTrash className={loading ? 'animate-bounce' : ''} />
                            {loading ? 'SİLİNİYOR...' : 'SİPARİŞLERİ TEMİZLE'}
                        </button>
                    </div>

                    {/* Status Message */}
                    {status.type !== 'idle' && (
                        <div className={`mt-8 p-6 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {status.type === 'success' ? <FaCheckCircle size={24} /> : <FaExclamationTriangle size={24} />}
                            <p className="font-bold">{status.message}</p>
                        </div>
                    )}
                </div>

                <p className="text-center mt-12 text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                    RestXQr Debug Tool v1.0 • {restaurantUsername}
                </p>
            </div>
        </div>
    );
}
