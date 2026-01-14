'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  kitchenStation?: string;
}

interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerName?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  notes?: string;
  orderType: string;
  created_at: string;
  items: OrderItem[];
}

export default function IzgaraStation() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
  const STATION = 'izgara';
  const STATION_NAME = '🔥 Izgara İstasyonu';
  const STATION_COLOR = '#F59E0B';

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('staff_user');
      const token = localStorage.getItem('staff_token');

      if (!user || !token) {
        router.push('/staff-login');
        return;
      }

      const parsedUser = JSON.parse(user);

      if (parsedUser.role !== 'chef' && parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
        alert('Bu panele erişim yetkiniz yok!');
        router.push('/staff-login');
        return;
      }

      if (parsedUser.restaurantId) setRestaurantId(parsedUser.restaurantId);
      if (parsedUser.restaurantName) setRestaurantName(parsedUser.restaurantName);
    };

    checkAuth();
  }, [router]);

  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return;

    try {
      if (showLoading) setLoading(true);
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        const activeOrders = (data.data || []).filter((order: Order) => 
          order.status !== 'completed' && 
          order.items.some((item: OrderItem) => item.kitchenStation === STATION)
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      const interval = setInterval(() => fetchOrders(false), 3000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(false);
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTime = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now.getTime() - orderTime.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-lg px-6 py-4 mb-6 border-b-4" style={{ borderColor: STATION_COLOR }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg" style={{ backgroundColor: STATION_COLOR }}>
              🔥
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800">{STATION_NAME}</h1>
              <p className="text-gray-600 font-semibold">{restaurantName}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/mutfak" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              ← Tüm İstasyonlar
            </Link>
            <div className="px-4 py-2 rounded-lg font-bold text-white shadow-lg" style={{ backgroundColor: STATION_COLOR }}>
              {orders.length} Aktif Sipariş
            </div>
          </div>
        </div>
      </div>

      {/* Station Navigation */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Link href="/mutfak/izgara" className="px-6 py-3 rounded-xl font-bold text-white shadow-lg" style={{ backgroundColor: STATION_COLOR }}>
            🔥 Izgara
          </Link>
          <Link href="/mutfak/makarna" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-blue-50 border-2 border-blue-200">
            🍝 Makarna
          </Link>
          <Link href="/mutfak/soguk" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-green-50 border-2 border-green-200">
            🥗 Soğuk
          </Link>
          <Link href="/mutfak/tatli" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-pink-50 border-2 border-pink-200">
            🍰 Tatlı
          </Link>
        </div>
      </div>

      {/* Orders */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: STATION_COLOR }}></div>
            <p className="text-gray-600 font-semibold">Siparişler yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-8xl mb-6">🔥</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Izgara İstasyonunda Sipariş Yok</h3>
            <p className="text-gray-600">Yeni siparişler geldiğinde burada görünecek.</p>
          </div>
        ) : (
          <motion.div className="space-y-6" layout>
            <AnimatePresence mode="popLayout">
              {orders.map((order) => {
                const stationItems = order.items.filter(item => item.kitchenStation === STATION);
                const estimatedTime = calculateTime(order.created_at);

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-6 shadow-xl border-l-8"
                    style={{ borderColor: STATION_COLOR }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-3xl font-black text-gray-800">Masa {order.tableNumber}</div>
                        <div className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)} • {estimatedTime} dk önce</div>
                      </div>
                      <div className="px-4 py-2 rounded-full font-bold text-white text-sm" style={{ backgroundColor: STATION_COLOR }}>
                        {order.status === 'pending' ? 'BEKLEMEDE' : order.status === 'preparing' ? 'HAZIRLANIYOR' : 'HAZIR'}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {stationItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                          <div className="text-3xl font-black text-orange-600">{item.quantity}x</div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-800">{item.name}</div>
                            {item.notes && <div className="text-sm text-orange-700 italic mt-1">📝 {item.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg"
                        >
                          ▶ Hazırlığa Başla
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg"
                        >
                          ✅ Hazır
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
