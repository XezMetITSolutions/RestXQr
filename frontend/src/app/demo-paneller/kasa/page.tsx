'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaUtensils, FaCheckCircle, FaCreditCard, FaReceipt, FaPrint, FaSignOutAlt } from 'react-icons/fa';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Demo mode - No authentication required
  useEffect(() => {
    // Demo mode activated
  }, []);

  // Restoran ID'sini al
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${API_URL}/staff/restaurants`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const aksaray = data.data.find((r: any) => r.username === 'aksaray');
          if (aksaray) {
            setRestaurantId(aksaray.id);
          }
        }
      } catch (error) {
        console.error('Restoran bilgisi alınamadı:', error);
      }
    };

    fetchRestaurant();
  }, []);

  // Demo veriler
  const demoOrders: Order[] = [
    {
      id: '1',
      restaurantId: 'demo-restaurant',
      tableNumber: 5,
      customerName: 'Ahmet Yılmaz',
      status: 'ready',
      totalAmount: 245.50,
      notes: 'Not: Az baharatlı olsun',
      orderType: 'table',
      created_at: new Date(Date.now() - 20 * 60000).toISOString(),
      items: [
        { id: '1', name: 'Adana Kebap', quantity: 2, price: 85.00 },
        { id: '2', name: 'Ayran', quantity: 2, price: 15.00 },
        { id: '3', name: 'Fırın Sütlaç', quantity: 1, price: 35.50 }
      ]
    },
    {
      id: '2',
      restaurantId: 'demo-restaurant',
      tableNumber: 12,
      customerName: 'Ayşe Demir',
      status: 'completed',
      totalAmount: 128.00,
      orderType: 'takeaway',
      created_at: new Date(Date.now() - 50 * 60000).toISOString(),
      items: [
        { id: '4', name: 'Pide (Kaşarlı)', quantity: 2, price: 45.00 },
        { id: '5', name: 'Çay', quantity: 2, price: 10.00 },
        { id: '6', name: 'Salata', quantity: 1, price: 18.00 }
      ]
    },
    {
      id: '3',
      restaurantId: 'demo-restaurant',
      tableNumber: 8,
      customerName: '',
      status: 'ready',
      totalAmount: 320.00,
      notes: 'Hemen geliyoruz',
      orderType: 'table',
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      items: [
        { id: '7', name: 'Sucuklu Pizza', quantity: 1, price: 95.00 },
        { id: '8', name: 'Karışık Pizza', quantity: 1, price: 110.00 },
        { id: '9', name: 'Cola (2L)', quantity: 1, price: 45.00 },
        { id: '10', name: 'Patates Kızartması', quantity: 2, price: 35.00 }
      ]
    }
  ];

  // Siparişleri çek (sadece ready ve completed)
  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      // Demo modda demo verileri kullan
      const paymentOrders = demoOrders.filter(
        (order: Order) => order.status === 'ready' || order.status === 'completed'
      );
      setOrders(paymentOrders);
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
  const handlePayment = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowPaymentModal(false);
        setSelectedOrder(null);
        fetchOrders(); // Listeyi yenile
        alert('✅ Ödeme alındı!');
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
                <p className="text-gray-600">RestXQr Restoranı</p>
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
                className={`rounded-lg shadow-lg p-6 ${
                  order.status === 'ready' 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500' 
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      order.status === 'ready' ? 'bg-green-500' : 'bg-gray-400'
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
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-800 mb-2">Masa {selectedOrder.tableNumber}</div>
                <div className="text-3xl font-bold text-green-600">{Number(selectedOrder.totalAmount).toFixed(2)}₺</div>
              </div>

              <div className="border-t border-b border-gray-200 py-3 mb-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{(Number(item.price) * Number(item.quantity)).toFixed(2)}₺</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePayment(selectedOrder.id)}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
              >
                ✅ Ödemeyi Onayla
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
