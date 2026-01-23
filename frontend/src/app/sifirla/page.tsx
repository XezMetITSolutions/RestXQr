'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrash, FaExclamationTriangle, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

export default function SystemResetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [restaurantName, setRestaurantName] = useState<string>('');
    const [staffUser, setStaffUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem('staff_token');
        const userStr = localStorage.getItem('staff_user');

        if (!token || !userStr) {
            router.push('/staff-login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            setStaffUser(user);
            setRestaurantId(user.restaurantId);
            setRestaurantName(user.restaurantName);
        } catch (e) {
            localStorage.clear();
            router.push('/staff-login');
        }
    }, [router]);

    const handleReset = async () => {
        if (!restaurantId) return;

        if (!confirm('⚠️ DİKKAT!\n\nSistemdeki TÜM SİPARİŞLER silinecek.\nBu işlem geri alınamaz.\n\nDevam etmek istiyor musunuz?')) {
            return;
        }

        if (!confirm('🛑 SON UYARI!\n\nGerçekten tüm verileri sıfırlamak istediğinize emin misiniz?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/orders/bulk?restaurantId=${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('staff_token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ SİSTEM SIFIRLANDI\n\n${data.deletedCount || 0} adet sipariş silindi.`);
                router.push('/kasa');
            } else {
                alert('❌ Hata: ' + data.message);
            }
        } catch (error) {
            console.error('Reset error:', error);
            alert('Sistem sıfırlanırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (!staffUser) return null;

    return (
        <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-600 relative">

                {/* Header */}
                <div className="bg-red-600 p-6 text-center">
                    <FaShieldAlt className="text-6xl text-red-900 mx-auto mb-4 opacity-50" />
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">SİSTEM SIFIRLAMA</h1>
                    <p className="text-red-100 font-medium opacity-90">{restaurantName}</p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-8">

                    <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
                        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
                        <h3 className="font-bold text-red-800 text-lg mb-2">KRİTİK İŞLEM</h3>
                        <p className="text-red-600 text-sm font-medium leading-relaxed">
                            Bu sayfadaki işlem, restorana ait <strong>BÜTÜN SİPARİŞ GEÇMİŞİNİ</strong> ve aktif adisyonları kalıcı olarak siler.
                        </p>
                    </div>

                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className={`w-full py-6 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 group
              ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95 ring-4 ring-red-200'
                            }`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <FaTrash className="group-hover:animate-bounce" />
                                <span>TÜM SİPARİŞLERİ SİL</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 font-bold hover:text-gray-800 flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Vazgeç ve Geri Dön</span>
                    </button>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-mono">
                        AUTHORIZED STAFF ONLY • {staffUser.username}
                    </p>
                </div>

            </div>
        </div>
    );
}
