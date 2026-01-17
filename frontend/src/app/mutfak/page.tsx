'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

export default function MutfakPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [stationFilter, setStationFilter] = useState<string>('all');

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

      // Sadece aşçı ve yöneticiler erişebilir
      if (parsedUser.role !== 'chef' && parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
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

  // Siparişleri çek
  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        // Ödeme tamamlanan siparişleri filtrele
        const activeOrders = (data.data || []).filter((order: Order) => order.status !== 'completed');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Her 2 saniyede bir sessizce (loading göstermeden) yenile
      const interval = setInterval(() => fetchOrders(false), 2000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Mutfak: Sipariş durumu güncelleniyor:', { orderId, newStatus });

      // Gruplu sipariş ID'si ise gerçek siparişleri bul ve güncelle
      if (orderId.includes('grouped')) {
        const tableNumber = parseInt(orderId.split('-')[1]);
        const tableOrders = orders.filter(o => o.tableNumber === tableNumber);
        
        console.log('📋 Gruplu sipariş tespit edildi:', { tableNumber, orderCount: tableOrders.length });
        
        // Her bir gerçek siparişi güncelle
        const updatePromises = tableOrders.map(async (tableOrder) => {
          console.log('🔄 Gerçek sipariş güncelleniyor:', tableOrder.id);
          const response = await fetch(`${API_URL}/orders/${tableOrder.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          });
          return response.json();
        });
        
        await Promise.all(updatePromises);
        console.log('✅ Tüm masa siparişleri güncellendi');
        
        // UI'ı güncelle
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.tableNumber === tableNumber ? { ...order, status: newStatus as any } : order
          )
        );
        
        fetchOrders(false);
        return;
      }

      // Normal sipariş için standart güncelleme
      // Optimistic update - Hemen görsel değişiklik
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📦 API Response data:', data);

      if (data.success) {
        console.log('✅ Sipariş durumu başarıyla güncellendi');
        // Backend'den güncel veriyi al (loading gösterme)
        fetchOrders(false);
      } else {
        console.error('❌ API başarısız response:', data);
        // Hata durumunda eski haline dön (loading gösterme)
        fetchOrders(false);
      }
    } catch (error) {
      console.error('💥 Durum güncellenemedi:', error);
      // Hata durumunda eski haline dön (loading gösterme)
      fetchOrders(false);
    }
  };

  // Siparişi tamamen sil
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi tamamen silmek istediğinizden emin misiniz?\nBu işlem geri alınamaz ve sipariş tüm panellerden (Garson, Kasa) silinecektir.')) {
      return;
    }

    try {
      // Optimistic update
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

      // Handle grouped orders differently
      if (orderId.includes('table-') && orderId.includes('-grouped')) {
        // For grouped orders, we need to extract the table number and delete all orders for that table
        const tableMatch = orderId.match(/table-(\d+)-grouped/);
        if (tableMatch && tableMatch[1]) {
          const tableNumber = tableMatch[1];
          console.log(`Grouped order deletion for table ${tableNumber}`);
          // This endpoint should be implemented on the backend to handle grouped order deletion
          const response = await fetch(`${API_URL}/orders/table/${tableNumber}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Masa ${tableNumber} siparişleri silindi`);
            fetchOrders(false);
          } else {
            const errorText = await response.text();
            console.error(`❌ Masa siparişleri silinemedi! Status: ${response.status}, Response:`, errorText);
            alert(`Masa siparişleri silinemedi! (Hata Kodu: ${response.status})`);
            fetchOrders(false);
          }
          return;
        }
      }

      // Regular order deletion
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sipariş silindi:', orderId);
        fetchOrders(false);
      } else {
        const errorText = await response.text();
        console.error(`❌ Sipariş silinemedi! Status: ${response.status}, Response:`, errorText);
        alert(`Sipariş silinemedi! (Hata Kodu: ${response.status})`);
        fetchOrders(false);
      }
    } catch (error) {
      console.error('Sipariş silme hatası:', error);
      alert('Sipariş silinirken teknik bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
      fetchOrders(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const calculateTime = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now.getTime() - orderTime.getTime();
    return Math.floor(diffMs / (1000 * 60)); // dakika
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'BEKLEMEDE', bg: '#fff3cd', color: '#856404' };
      case 'preparing':
        return { text: 'HAZIRLANIYOR', bg: '#d4edda', color: '#155724' };
      case 'ready':
        return { text: 'HAZIR', bg: '#cce5ff', color: '#004085' };
      case 'completed':
        return { text: 'TESLİM EDİLDİ', bg: '#d1ecf1', color: '#0c5460' };
      case 'cancelled':
        return { text: 'İPTAL EDİLDİ', bg: '#f8d7da', color: '#721c24' };
      default:
        return { text: 'BİLİNMEYEN', bg: '#f0f0f0', color: '#333' };
    }
  };

  // Ödeme yöntemi, bahşiş ve bağış bilgilerini notlardan temizle
  const cleanNotes = (notes: string | undefined): string | undefined => {
    if (!notes) return notes;

    // Ödeme yöntemi, bahşiş ve bağış bilgilerini regex ile temizle
    let cleaned = notes
      .replace(/Ödeme\s+yöntemi:\s*[^,]+(,\s*)?/gi, '')
      .replace(/Bahşiş:\s*[^,]+(,\s*)?/gi, '')
      .replace(/Bağış:\s*[^,]+(,\s*)?/gi, '')
      .replace(/Debug\s+Simülasyonu\s*-\s*Ödeme:\s*[^,]+(,\s*)?/gi, '') // Debug notlarını temizle
      .replace(/,\s*,/g, ',') // Çift virgülleri temizle
      .replace(/^,\s*/, '') // Başlangıçtaki virgülü temizle
      .replace(/,\s*$/, '') // Sondaki virgülü temizle
      .replace(/^\s*📝\s*Özel\s+Not:\s*/i, '') // "📝 Özel Not:" başlığını temizle
      .trim();

    // Eğer sadece boşluk veya virgül kaldıysa undefined döndür
    if (!cleaned || cleaned === ',' || cleaned === '') {
      return undefined;
    }

    return cleaned;
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Menü yönetimi
  const fetchMenuItems = async () => {
    if (!restaurantId) return;

    try {
      setMenuLoading(true);
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items`);
      const data = await response.json();

      if (data.success && data.data) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Menü ürünleri yüklenemedi:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuManagement = () => {
    setShowMenuModal(true);
    setMenuSearchTerm(''); // Arama terimini sıfırla
    fetchMenuItems();
  };

  const updateMenuAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      // Optimistic update - Hemen görsel değişiklik
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isAvailable } : item
        )
      );

      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable })
      });

      const data = await response.json();

      if (data.success) {
        // Backend'den güncel veriyi al
        fetchMenuItems();
      } else {
        // Hata durumunda eski haline dön
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Ürün durumu güncellenemedi:', error);
      // Hata durumunda eski haline dön
      fetchMenuItems();
    }
  };

  // Siparişleri masaya göre gruplandır
  const groupOrdersByTable = (orders: Order[]) => {
    const grouped = new Map<number, Order[]>();
    
    orders.forEach(order => {
      const tableNumber = order.tableNumber;
      if (!grouped.has(tableNumber)) {
        grouped.set(tableNumber, []);
      }
      grouped.get(tableNumber)!.push(order);
    });
    
    return Array.from(grouped.values());
  };

  // Gruplu siparişi tek sipariş olarak birleştir
  const createGroupedOrder = (tableOrders: Order[]): Order => {
    if (tableOrders.length === 1) {
      return tableOrders[0];
    }
    
    const latestOrder = tableOrders.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    });
    
    const allItems: OrderItem[] = [];
    let totalAmount = 0;
    
    tableOrders.forEach(order => {
      order.items.forEach(item => {
        allItems.push(item);
      });
      totalAmount += order.totalAmount;
    });
    
    const statusPriority = { 'pending': 1, 'preparing': 2, 'ready': 3, 'completed': 4, 'cancelled': 5 };
    const mostCriticalStatus = tableOrders.reduce((prev, current) => {
      return statusPriority[prev.status] > statusPriority[current.status] ? prev : current;
    }).status;
    
    return {
      ...latestOrder,
      items: allItems,
      totalAmount,
      status: mostCriticalStatus,
      id: `table-${latestOrder.tableNumber}-grouped`,
      notes: tableOrders.map(o => o.notes).filter(Boolean).filter((note, index, arr) => arr.indexOf(note) === index).filter(note => note && !note.includes('Ödeme yöntemi') && !note.includes('Debug Simülasyonu')).join(' | ') || (latestOrder.notes ? latestOrder.notes.replace(/Ödeme yöntemi:.*?(?:\||$)/g, '').replace(/Debug\s+Simülasyonu\s*-\s*Ödeme:\s*[^,|]+(,\s*|\|\s*)?/gi, '').trim() : '')
    };
  };

  // Filtrelenmiş ve gruplu siparişler
  const filteredOrders = (() => {
    const filtered = orders.filter(order => {
      // Durum filtresi
      if (activeTab !== 'all' && order.status !== activeTab) return false;

      // İstasyon filtresi
      if (stationFilter !== 'all') {
        const hasStationItem = order.items.some((item: any) => 
          item.kitchenStation === stationFilter
        );
        if (!hasStationItem) return false;
      }

      // Arama filtresi
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.tableNumber.toString().includes(searchLower) ||
          order.items.some(item => item.name.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
    
    const grouped = groupOrdersByTable(filtered);
    const groupedOrders: Order[] = [];
    
    grouped.forEach((tableOrders) => {
      groupedOrders.push(createGroupedOrder(tableOrders));
    });
    
    return groupedOrders;
  })();

  // Her durumun sayısını hesapla
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 md:px-8 md:py-6 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl md:text-2xl flex-shrink-0">
              👨‍🍳
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Mutfak Paneli</h1>
              <p className="text-gray-600 text-xs md:text-sm hidden sm:block">
                {restaurantName || 'Restoran'} • Sipariş ve menü yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
            <button
              onClick={handleMenuManagement}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors text-sm md:text-base whitespace-nowrap"
            >
              + Menü Yönetimi
            </button>
            <div className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
              TR Türkçe ↓
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-8">
        <div className="bg-yellow-50 rounded-2xl p-4 md:p-8 shadow-sm">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Masa numarası veya ürün ara..."
            className="w-full mb-4 md:mb-6 px-4 md:px-6 py-3 md:py-4 border border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* İstasyon Filtresi */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mutfak İstasyonu
            </label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">🏪 Tüm İstasyonlar</option>
              <option value="izgara">🔥 Izgara</option>
              <option value="makarna">🍝 Makarna</option>
              <option value="soguk">🥗 Soğuk</option>
              <option value="tatli">🍰 Tatlı</option>
            </select>
          </div>

          {/* Filter Tabs - Desktop (md and up) */}
          <div className="hidden md:flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              Tümü ({orderCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'pending'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              Bekleyen ({orderCounts.pending})
            </button>
            <button
              onClick={() => setActiveTab('preparing')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'preparing'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              Hazırlanan ({orderCounts.preparing})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'cancelled'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              İptal Edilen ({orderCounts.cancelled})
            </button>
          </div>

          {/* Filter Tabs - Mobile (below md) */}
          <div className="block md:hidden mb-6">
            <label htmlFor="order-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Sipariş Durumu
            </label>
            <select
              id="order-filter"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:border-green-500 font-semibold"
            >
              <option value="all">Tümü ({orderCounts.all})</option>
              <option value="pending">Bekleyen ({orderCounts.pending})</option>
              <option value="preparing">Hazırlanan ({orderCounts.preparing})</option>
              <option value="cancelled">İptal Edilen ({orderCounts.cancelled})</option>
            </select>
          </div>

          {/* Orders */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Siparişler yükleniyor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz sipariş yok</h3>
              <p className="text-gray-600">Yeni siparişler geldiğinde burada görünecek.</p>
            </div>
          ) : (
            <motion.div className="space-y-4" layout>
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const estimatedTime = calculateTime(order.created_at);

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl p-4 md:p-6 shadow-md border-l-4 md:border-l-8"
                      style={{ borderLeftColor: statusInfo.bg }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-4 md:gap-6">
                        {/* Sol Sütun - Sipariş Detayları */}
                        <div>
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div>
                              <div className="text-xl md:text-2xl font-bold text-gray-800">Masa {order.tableNumber}</div>
                              <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">{formatDate(order.created_at)}</div>
                            </div>
                            <div
                              className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1"
                              style={{ background: statusInfo.bg, color: statusInfo.color }}
                            >
                              {statusInfo.text}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">Sipariş Detayları:</div>
                            <div className="space-y-1 md:space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="text-gray-600">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span>{item.quantity}x {item.name}</span>
                                    {item.kitchenStation && (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                                        backgroundColor: 
                                          item.kitchenStation === 'izgara' ? '#FEF3C7' :
                                          item.kitchenStation === 'makarna' ? '#DBEAFE' :
                                          item.kitchenStation === 'soguk' ? '#D1FAE5' :
                                          item.kitchenStation === 'tatli' ? '#FCE7F3' : '#F3F4F6',
                                        color:
                                          item.kitchenStation === 'izgara' ? '#92400E' :
                                          item.kitchenStation === 'makarna' ? '#1E40AF' :
                                          item.kitchenStation === 'soguk' ? '#065F46' :
                                          item.kitchenStation === 'tatli' ? '#9F1239' : '#374151'
                                      }}>
                                        {item.kitchenStation === 'izgara' && '🔥 Izgara'}
                                        {item.kitchenStation === 'makarna' && '🍝 Makarna'}
                                        {item.kitchenStation === 'soguk' && '🥗 Soğuk'}
                                        {item.kitchenStation === 'tatli' && '🍰 Tatlı'}
                                      </span>
                                    )}
                                  </div>
                                  {item.notes && (
                                    <div className="text-xs text-yellow-700 italic ml-4">
                                      📝 {item.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Orta Sütun - Sipariş Bilgileri */}
                        <div>
                          <div className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Sipariş Bilgileri:</div>
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Tahmini Süre:</span>
                              <span className="font-semibold text-gray-800">{estimatedTime} dk</span>
                            </div>
                            {cleanNotes(order.notes) && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                <div className="font-semibold text-yellow-800 mb-1">📝 Özel Not:</div>
                                <div className="text-sm text-gray-700">{cleanNotes(order.notes)}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sağ Sütun - Aksiyon Butonları */}
                        <div className="flex flex-col gap-2 md:gap-3">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-4 md:px-6 py-3 md:py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 justify-center text-sm md:text-base"
                            >
                              ▶ Hazırlığa Başla
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-4 md:px-6 py-3 md:py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 justify-center text-sm md:text-base"
                            >
                              ✅ Hazır
                            </button>
                          )}
                          <button
                            onClick={() => showOrderDetails(order)}
                            className="px-4 md:px-6 py-3 md:py-4 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2 justify-center text-sm md:text-base"
                          >
                            👁 Detaylar
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="px-4 md:px-6 py-3 md:py-4 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors flex items-center gap-2 justify-center border border-red-200 text-sm md:text-base"
                          >
                            🗑️ Siparişi Sil
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Menü Yönetimi Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">📋 Menü Yönetimi</h2>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-gray-900 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {menuLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Menü yükleniyor...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz ürün yok</h3>
                  <p className="text-gray-600">Menüye ürün ekleyin.</p>
                </div>
              ) : (
                <>
                  {/* Arama Kutusu */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="🔍 Yemek ara..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-yellow-500"
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Filtrelenmiş Menü Öğeleri */}
                  {(() => {
                    const filteredItems = menuItems.filter(item => {
                      if (!menuSearchTerm) return true;
                      const searchLower = menuSearchTerm.toLowerCase();
                      return (
                        item.name.toLowerCase().includes(searchLower) ||
                        (item.description && item.description.toLowerCase().includes(searchLower))
                      );
                    });

                    if (filteredItems.length === 0) {
                      return (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <div className="text-4xl mb-4">🔍</div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sonuç bulunamadı</h3>
                          <p className="text-gray-600">"{menuSearchTerm}" için arama sonucu yok.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            className={`bg-white border-2 rounded-lg p-4 ${item.isAvailable ? 'border-green-200' : 'border-red-200 bg-red-50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isAvailable
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.isAvailable ? '✓ Mevcut' : '✗ Bitti'}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                                <p className="text-lg font-bold text-green-600 mt-2">
                                  {parseFloat(item.price.toString()).toFixed(2)}₺
                                </p>
                              </div>
                              <div className="ml-4">
                                {item.isAvailable ? (
                                  <button
                                    onClick={() => updateMenuAvailability(item.id, false)}
                                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                  >
                                    ✗ Bitti
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateMenuAvailability(item.id, true)}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                  >
                                    ✓ Mevcut
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      {showOrderModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
                  <p className="text-purple-100 text-sm mt-1">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Genel Bilgiler */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="text-orange-600 text-sm font-medium mb-1">Masa Numarası</div>
                  <div className="text-2xl font-bold text-orange-900">#{selectedOrder.tableNumber}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-600 text-sm font-medium mb-2">Toplam Ürün Sayısı</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} Adet
                  </div>
                </div>
              </div>

              {/* Durum ve Tarih */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-600 text-sm font-medium mb-2">Sipariş Durumu</div>
                  <div
                    className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: getStatusInfo(selectedOrder.status).bg,
                      color: getStatusInfo(selectedOrder.status).color
                    }}
                  >
                    {getStatusInfo(selectedOrder.status).text}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-gray-600 text-sm font-medium mb-2">Sipariş Zamanı</div>
                  <div className="text-gray-900 font-semibold">{formatDate(selectedOrder.created_at)}</div>
                </div>
              </div>

              {/* Ürünler */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🍽️</span>
                  Sipariş Ürünleri
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            {item.quantity}x
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            {item.notes && (
                              <div className="text-sm text-yellow-700 mt-1 italic">
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notlar */}
              {cleanNotes(selectedOrder.notes) && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="font-semibold text-yellow-900 mb-1">Sipariş Notu</div>
                      <div className="text-yellow-800">{cleanNotes(selectedOrder.notes)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Özet */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 font-medium">Toplam Ürün Sayısı</div>
                  <div className="text-xl font-bold text-purple-700">
                    {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} Adet
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}