'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaUtensils, FaCheckCircle, FaCreditCard, FaReceipt, FaPrint, FaSignOutAlt, FaTrash, FaPlus, FaMinus, FaTimesCircle } from 'react-icons/fa';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
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

export default function KasaPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Login kontrolü ve restoran bilgilerini al
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('staff_user');
      const token = localStorage.getItem('staff_token');

      if (!user || !token) {
        router.push('/staff-login');
        return;
      }

      const parsedUser = JSON.parse(user);

      // Sadece kasiyer ve yöneticiler erişebilir
      if (parsedUser.role !== 'cashier' && parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
        alert('Bu panele erişim yetkiniz yok!');
        router.push('/staff-login');
        return;
      }

      // Staff'ın restoran bilgilerini al
      if (parsedUser.restaurantId) {
        setRestaurantId(parsedUser.restaurantId);
      }
      if (parsedUser.restaurantName) {
        setRestaurantName(parsedUser.restaurantName);
      }
    };

    checkAuth();
  }, [router]);

  // Siparişleri çek (sadece ready ve completed)
  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        // Kasanın ilgilenmesi gereken siparişler
        const paymentOrders = (data.data || []).filter(
          (order: Order) => order.status === 'ready' || order.status === 'completed'
        );
        setOrders(paymentOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Her 5 saniyede bir yenile
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  // Ödeme al
  const handlePayment = async (orderId: string, updatedOrder?: any) => {
    try {
      const payload: any = { status: 'completed' };
      if (updatedOrder) {
        payload.items = updatedOrder.items;
        payload.totalAmount = updatedOrder.totalAmount;
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setShowPaymentModal(false);
        setSelectedOrder(null);
        fetchOrders(); // Listeyi yenile
        alert('✅ Ödeme ve değişiklikler onaylandı!');
      }
    } catch (error) {
      console.error('Ödeme işlemi başarısız:', error);
      alert('❌ Ödeme işlemi başarısız!');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalRevenue = () => {
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  };

  const getPendingPayments = () => {
    return orders
      .filter(o => o.status === 'ready')
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
  };

  // Siparişi iptal et
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        setSelectedOrder(null);
        fetchOrders();
        alert('Sipariş iptal edildi.');
      }
    } catch (error) {
      console.error('Sipariş iptal edilemedi:', error);
      alert('Sipariş iptal edilirken bir hata oluştu.');
    }
  };

  // Modal içindeki sipariş düzenleme fonksiyonları
  const updateItemQuantity = (index: number, newQty: number) => {
    if (!selectedOrder || newQty < 1) return;

    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], quantity: newQty };

    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      totalAmount: newTotal
    });
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    if (!selectedOrder || newPrice < 0) return;

    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], price: newPrice };

    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      totalAmount: newTotal
    });
  };

  const removeItem = (index: number) => {
    if (!selectedOrder) return;
    if (selectedOrder.items.length <= 1) {
      alert('Siparişteki son ürünü silemezsiniz. Bunun yerine siparişi iptal edebilirsiniz.');
      return;
    }

    const updatedItems = selectedOrder.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      totalAmount: newTotal
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="text-4xl text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Kasa Paneli</h1>
                <p className="text-gray-600">{restaurantName || 'Restoran'}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalRevenue().toFixed(2)}₺</div>
                <div className="text-sm text-gray-600">Toplam Gelir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getPendingPayments().toFixed(2)}₺</div>
                <div className="text-sm text-gray-600">Bekleyen Ödeme</div>
              </div>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Ödeme Bekleyen Sipariş Yok</h3>
            <p className="text-gray-500">Yeni siparişler burada görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-lg shadow-lg p-6 ${order.status === 'ready'
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500'
                  : 'bg-white border-2 border-gray-200'
                  }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${order.status === 'ready' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                      <span className="text-2xl font-bold text-white">{order.tableNumber}</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-800">Masa {order.tableNumber}</div>
                      <div className="text-sm text-gray-600">{formatTime(order.created_at)}</div>
                    </div>
                  </div>
                  {order.status === 'ready' && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ÖDEME BEKLİYOR
                    </div>
                  )}
                  {order.status === 'completed' && (
                    <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaCheckCircle />
                      ÖDENDİ
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="border-t border-b border-gray-300 py-3 mb-3">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="font-medium text-gray-800">
                          {item.quantity}x {item.name}
                        </div>
                        <div className="font-semibold text-gray-700">
                          {(Number(item.price) * Number(item.quantity)).toFixed(2)}₺
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-gray-800">TOPLAM</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Number(order.totalAmount).toFixed(2)}₺
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'ready' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowPaymentModal(true);
                      }}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCreditCard />
                      Ödeme Al
                    </button>
                    <button
                      className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPrint />
                      Fiş Yazdır
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle />
                      Siparişi İptal Et
                    </button>
                  </div>
                )}
                {order.status === 'completed' && (
                  <button
                    className="w-full py-2 bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaReceipt />
                    Fiş Görüntüle
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ödeme Onayı</h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-bold text-gray-800">Masa {selectedOrder.tableNumber}</div>
                <div className="text-2xl font-bold text-green-600">{Number(selectedOrder.totalAmount).toFixed(2)}₺</div>
              </div>

              <div className="border-t border-b border-gray-200 py-3 mb-6 max-h-[40vh] overflow-y-auto">
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800 flex-1">{item.name}</span>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Ürünü Çıkar"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Adet Kontrolü */}
                        <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            className="text-gray-500 hover:text-green-600"
                          >
                            <FaMinus size={12} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-10 text-center font-bold text-sm bg-transparent outline-none"
                          />
                          <button
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            className="text-gray-500 hover:text-green-600"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        {/* Fiyat Kontrolü */}
                        <div className="flex-1 flex items-center gap-1 bg-white border rounded-lg px-2 py-1">
                          <input
                            type="number"
                            step="0.1"
                            value={item.price}
                            onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                            className="w-full text-right font-bold text-sm text-gray-700 outline-none"
                          />
                          <span className="text-sm font-bold text-gray-500">₺</span>
                        </div>
                      </div>

                      <div className="text-right mt-1 text-xs text-gray-500 font-medium">
                        Ara Toplam: {(Number(item.price) * Number(item.quantity)).toFixed(2)}₺
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePayment(selectedOrder.id, selectedOrder)}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
              >
                <FaCheckCircle className="text-xl" />
                Ödemeyi ve Değişiklikleri Onayla
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimesCircle />
                  Siparişi İptal Et
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    fetchOrders(); // Değişiklikleri iptal et ve taze veriyi çek
                    setSelectedOrder(null);
                  }}
                  className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                >
                  Geri Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
