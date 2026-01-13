'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaUtensils, FaBell, FaCheckCircle, FaClock, FaMoneyBillWave, FaEdit, FaEye, FaTimes, FaChartBar, FaSignOutAlt, FaPlus, FaMinus } from 'react-icons/fa';

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

export default function GarsonPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [newTableNumber, setNewTableNumber] = useState<string>('');
  const [orderToChangeTable, setOrderToChangeTable] = useState<Order | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [staffUser, setStaffUser] = useState<any>(null);

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
      setStaffUser(parsedUser);

      // Sadece garson ve yöneticiler erişebilir
      if (parsedUser.role !== 'waiter' && parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
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

  // Menu items'ları çek
  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items`);
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data || []);
      }
    } catch (error) {
      console.error('Menu items alınamadı:', error);
    }
  };

  // Siparişleri çek - AJAX gibi sessiz güncelleme
  const fetchOrders = async (silent: boolean = false) => {
    if (!restaurantId) {
      console.log('⚠️ fetchOrders: restaurantId eksik');
      return;
    }

    try {
      if (!silent) setLoading(true);
      console.log(`📡 Siparişler çekiliyor: ${API_URL}/orders?restaurantId=${restaurantId}`);
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${data.data?.length || 0} sipariş alındı`);
        setOrders(data.data || []);
      } else {
        console.error('❌ Siparişler alınamadı (API Error):', data.message);
      }
    } catch (error) {
      console.error('❌ Siparişler alınamadı (Network Error):', error);
    } finally {
      setLoading(false); // Her durumda loading'i kapat
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders(false); // İlk yükleme normal loading ile
      fetchMenuItems(); // Menü kalemlerini de çek
      // Her 10 saniyede bir sessiz güncelleme (AJAX tarzı)
      const interval = setInterval(() => fetchOrders(true), 10000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        if (newStatus === 'cancelled') {
          // İptal edilen siparişleri listeden kaldır
          setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        } else {
          // Diğer durumlarda güncelle
          setOrders(prevOrders =>
            prevOrders.map(o =>
              o.id === orderId ? { ...o, status: newStatus as any } : o
            )
          );
        }
        fetchOrders(); // Listeyi backend'den yenile
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  // Sipariş detaylarını aç
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Filtrelenmiş siparişler
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  // İstatistikler
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <FaUser className="text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">RestXQr Garson</h1>
                <p className="text-sm text-purple-200">{restaurantName || 'Restoran'} • Canlı Durum</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem('staff_user');
                  localStorage.removeItem('staff_token');
                  router.push('/staff-login');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'all' ? 'ring-4 ring-yellow-400' : ''}`}
          >
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-600 font-medium">Tümü ({stats.total})</div>
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'pending' ? 'ring-4 ring-yellow-400' : ''}`}
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600 font-medium">Aktif ({stats.pending})</div>
          </button>
          <button
            onClick={() => setActiveFilter('preparing')}
            className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'preparing' ? 'ring-4 ring-yellow-400' : ''}`}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
            <div className="text-xs text-gray-600 font-medium">Hazırlanıyor ({stats.preparing})</div>
          </button>
          <button
            onClick={() => setActiveFilter('ready')}
            className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'ready' ? 'ring-4 ring-yellow-400' : ''}`}
          >
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-xs text-gray-600 font-medium">Hazır ({stats.ready})</div>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'completed' ? 'ring-4 ring-yellow-400' : ''}`}
          >
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <div className="text-xs text-gray-600 font-medium">Teslim ({stats.completed})</div>
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Siparişler yükleniyor...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-12 text-center text-white">
            <FaUtensils className="text-6xl mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Henüz Sipariş Yok</h3>
            <p className="opacity-75">Yeni siparişler burada görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Masa {order.tableNumber}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaClock size={10} />
                      <span>{formatTime(order.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">₺{Number(order.totalAmount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{order.items.length} ürün</div>
                  </div>
                </div>

                {/* Order Items - Compact */}
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded flex items-center justify-center text-xs font-bold mt-0.5">
                        {item.quantity}x
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-700">{item.name}</div>
                        {item.notes && (
                          <div className="text-xs text-purple-600 italic mt-0.5">• {item.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-xs text-gray-500 pl-8">+{order.items.length - 3} ürün daha</div>
                  )}
                </div>

                {/* Customer Requests */}
                {order.notes && (
                  <div className="mb-3 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <FaBell className="text-red-600 mt-0.5" size={12} />
                    <div className="text-xs text-red-800 font-medium">{order.notes}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    ✓ Servis Et
                  </button>
                  <button
                    onClick={() => {
                      setOrderToChangeTable(order);
                      setNewTableNumber(order.tableNumber.toString());
                      setShowTableModal(true);
                    }}
                    className="py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    🔄 Masa Değiştir
                  </button>
                  <button
                    onClick={() => {
                      setOrderToEdit(order);
                      fetchMenuItems();
                      setShowEditModal(true);
                    }}
                    className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                        updateOrderStatus(order.id, 'cancelled');
                      }
                    }}
                    className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    ❌ İptal Et
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Masa Değiştir Modal */}
      {showTableModal && orderToChangeTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">🔄 Masa Değiştir</h3>
                <p className="text-sm text-gray-500 mt-1">Masa {orderToChangeTable.tableNumber} için yeni masa numarası girin</p>
              </div>
              <button
                onClick={() => {
                  setShowTableModal(false);
                  setOrderToChangeTable(null);
                  setNewTableNumber('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Yeni Masa Numarası
                </label>
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-semibold transition-colors"
                  placeholder="Masa numarası..."
                  autoFocus
                />
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 text-white rounded-lg px-3 py-2 text-xl font-bold">
                    {orderToChangeTable.tableNumber}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">₺{Number(orderToChangeTable.totalAmount).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{orderToChangeTable.items.length} ürün</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTableModal(false);
                  setOrderToChangeTable(null);
                  setNewTableNumber('');
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const tableNum = parseInt(newTableNumber);
                  if (tableNum > 0 && tableNum <= 100) {
                    setOrders(prevOrders =>
                      prevOrders.map(o =>
                        o.id === orderToChangeTable.id ? { ...o, tableNumber: tableNum } : o
                      )
                    );
                    setShowTableModal(false);
                    setOrderToChangeTable(null);
                    setNewTableNumber('');
                  } else {
                    alert('Lütfen 1-100 arasında geçerli bir masa numarası girin!');
                  }
                }}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
              >
                ✨ Değiştir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Düzenle Modal */}
      {showEditModal && orderToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">✏️ Siparişi Düzenle</h3>
                <p className="text-sm text-gray-500 mt-1">Masa {orderToEdit.tableNumber}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setOrderToEdit(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mevcut Sipariş */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Mevcut Sipariş</h4>
                <div className="space-y-2">
                  {orderToEdit.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm flex-1">{item.name}</span>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => {
                              const updatedOrder = {
                                ...orderToEdit,
                                items: orderToEdit.items.map((i, index) =>
                                  index === idx ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                                )
                              };
                              setOrderToEdit(updatedOrder);
                            }}
                            className="px-2 py-1 bg-white rounded text-blue-600 hover:bg-blue-50"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const updatedOrder = {
                                ...orderToEdit,
                                items: orderToEdit.items.map((i, index) =>
                                  index === idx ? { ...i, quantity: i.quantity + 1 } : i
                                )
                              };
                              setOrderToEdit(updatedOrder);
                            }}
                            className="px-2 py-1 bg-white rounded text-blue-600 hover:bg-blue-50"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-20 text-right">
                          ₺{Number(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            const updatedOrder = {
                              ...orderToEdit,
                              items: orderToEdit.items.filter((_, i) => i !== idx)
                            };
                            setOrderToEdit(updatedOrder);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ürün Ekle */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">➕ Ürün Ekle</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {menuItems.map((item) => {
                    const existingItem = orderToEdit.items.find(i => i.name === item.name);
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border hover:border-blue-400 transition-colors">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">₺{Number(item.price).toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => {
                            const newItem = {
                              id: item.id,
                              name: item.name,
                              quantity: 1,
                              price: item.price,
                              notes: ''
                            };
                            const updatedOrder = {
                              ...orderToEdit,
                              items: [...orderToEdit.items, newItem]
                            };
                            setOrderToEdit(updatedOrder);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          + Ekle
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setOrderToEdit(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Backend'e gönder
                      const response = await fetch(`${API_URL}/orders/${orderToEdit.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: orderToEdit.items,
                          totalAmount: orderToEdit.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                        })
                      });
                      if (response.ok) {
                        alert('✅ Sipariş başarıyla güncellendi!');
                        setShowEditModal(false);
                        setOrderToEdit(null);
                        fetchOrders(); // Listeyi yenile
                      }
                    } catch (error) {
                      alert('❌ Sipariş güncellenemedi!');
                    }
                  }}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
                >
                  💾 Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-blue-500 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
                  <p className="text-blue-100">Masa {selectedOrder.tableNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Sipariş Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">📋 Sipariş Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sipariş ID:</span>
                    <span className="font-mono text-xs">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Masa:</span>
                    <span className="font-semibold">{selectedOrder.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saat:</span>
                    <span>{formatTime(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {Number(selectedOrder.totalAmount).toFixed(2)}₺
                    </span>
                  </div>
                </div>
              </div>

              {/* Sipariş Ürünleri */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🍽️ Sipariş Ürünleri</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {item.quantity}x {item.name}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                              📝 {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{Number(item.price).toFixed(2)}₺</div>
                          <div className="font-semibold text-gray-800">
                            {(Number(item.price) * Number(item.quantity)).toFixed(2)}₺
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sipariş Notu */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">📝 Sipariş Notu</h3>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Durum Güncelleme Butonları */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🔄 Sipariş Durumu</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                      className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle />
                      Servis Edildi
                    </button>
                  )}
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Hazırlanıyor
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                      className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Hazır
                    </button>
                  )}
                  {selectedOrder.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                          updateOrderStatus(selectedOrder.id, 'cancelled');
                        }
                      }}
                      className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
