'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { FaCalendar, FaTrash, FaClock, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

export default function DailyOrdersPage() {
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        initializeAuth();
        setAuthInitialized(true);
    }, [initializeAuth]);

    const fetchOrders = async () => {
        if (!authenticatedRestaurant?.id) return;
        setLoading(true);

        try {
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(
                `${API_URL}/orders?restaurantId=${authenticatedRestaurant.id}&from=debug&status=all&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
            );

            const data = await response.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Siparişleri getirme hatası:', error);
            alert('Siparişler getirilemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authInitialized && authenticatedRestaurant?.id) {
            fetchOrders();
        }
    }, [selectedDate, authenticatedRestaurant, authInitialized]);

    const handleDelete = async (orderId: string) => {
        if (!confirm('Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;

        setDeletingId(orderId);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            // We use the direct delete endpoint for single order deletion which handles constraints
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                alert('Sipariş silindi');
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Bir hata oluştu');
        } finally {
            setDeletingId(null);
        }
    };

    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const totalPaid = orders.reduce((sum, order) => sum + Number(order.paidAmount || 0), 0);
    const totalDiscount = orders.reduce((sum, order) => sum + Number(order.discountAmount || 0), 0);
    const realRevenue = totalAmount - totalDiscount; // Usually paidAmount should match this for completed orders

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Günlük Sipariş Dökümü (Kroren Debug)</h1>
                    <p className="text-gray-500">Seçilen gün için tüm sipariş detayları</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <FaCalendar className="text-gray-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none focus:ring-0 text-gray-700 font-medium"
                    />
                    <button
                        onClick={fetchOrders}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <FaSearch />
                        <span>Getir</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Toplam Sipariş Sayısı</div>
                    <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Toplam Tutar</div>
                    <div className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Toplam İndirim</div>
                    <div className="text-2xl font-bold text-red-500">{totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Net Ciro (Tahmini)</div>
                    <div className="text-2xl font-bold text-green-600">{realRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</div>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 mb-4 rounded text-xs font-mono text-gray-700">
                <p>Restoran ID: {authenticatedRestaurant?.id || 'YOK (Oturum Açılmadı)'}</p>
                <p>Tarih: {selectedDate}</p>
                <p>Sorgu Başı: {new Date(selectedDate).setHours(0, 0, 0, 0) ? new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).toISOString() : 'Hata'}</p>
                <p>Sorgu Sonu: {new Date(selectedDate).setHours(23, 59, 59, 999) ? new Date(new Date(selectedDate).setHours(23, 59, 59, 999)).toISOString() : 'Hata'}</p>
                {!authenticatedRestaurant?.id && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded font-bold">
                        Lütfen Business paneline giriş yapın veya sayfayı yenileyin.
                        <br />
                        <a href="/login" className="underline">Giriş Yap</a>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Bu tarih için kayıtlı sipariş bulunamadı.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="p-4">Saat</th>
                                <th className="p-4">Masa</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4">Özet</th>
                                <th className="p-4 text-right">Tutar</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => {
                                const date = new Date(order.created_at || order.createdAt);
                                const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 font-mono text-gray-600 font-medium flex items-center gap-2">
                                            <FaClock className="text-gray-300" />
                                            {timeStr}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {order.tableNumber ? `Masa ${order.tableNumber}` : 'Online / Paket'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status === 'pending' ? 'Beklemede' :
                                                    order.status === 'preparing' ? 'Hazırlanıyor' :
                                                        order.status === 'ready' ? 'Hazır' :
                                                            order.status === 'completed' ? 'Tamamlandı' :
                                                                order.status === 'cancelled' ? 'İptal' : order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                            {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                        </td>
                                        <td className="p-4 text-right font-bold font-mono text-gray-800">
                                            {Number(order.totalAmount).toFixed(2)} ₺
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                disabled={deletingId === order.id}
                                                className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                                                title="Siparişi ve içeriğini kalıcı olarak sil"
                                            >
                                                {deletingId === order.id ? '...' : <FaTrash />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
