'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { printReceiptViaBridge } from '@/lib/printerHelpers';
import apiService from '@/services/api';
import { playNotificationSound } from '@/utils/audio';
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
  approved?: boolean;
  paymentInfo?: string;
  originalOrders?: Order[];
}

interface WaiterCall {
  id: string;
  tableNumber: number;
  type: string;
  message: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export default function GarsonPanel() {
  const router = useRouter();
  const prevOrderCount = useRef(0);
  const prevReadyCount = useRef(0);
  const prevCallCount = useRef(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [tables, setTables] = useState<number[]>([]); // All existing tables
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

      // Sadece garson, yöneticiler veya özel izni olanlar erişebilir
      const hasAccess =
        parsedUser.role === 'waiter' ||
        parsedUser.role === 'manager' ||
        parsedUser.role === 'admin' ||
        parsedUser.permissions?.canAccessWaiterPanel === true;

      if (!hasAccess) {
        alert('Bu panele erişim yetkiniz yok!');
        router.push('/staff-login');
        return;
      }

      // Staff'ın restoran bilgilerini al
      const fetchRestaurantId = async () => {
        if (parsedUser.restaurantId) {
          // UUID formatında mı kontrol et
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsedUser.restaurantId);

          if (isUUID) {
            setRestaurantId(parsedUser.restaurantId);
            console.log('✅ Restaurant ID (UUID):', parsedUser.restaurantId);
          } else {
            // Username formatında, UUID'yi fetch et
            console.log('⚠️ Restaurant ID username formatında, UUID çekiliyor:', parsedUser.restaurantId);
            try {
              const response = await fetch(`${API_URL}/restaurants/username/${parsedUser.restaurantId}`);
              const data = await response.json();
              if (data.success && data.data?.id) {
                setRestaurantId(data.data.id);
                console.log('✅ Restaurant UUID bulundu:', data.data.id);
              } else {
                console.error('❌ Restaurant UUID bulunamadı');
                setRestaurantId(parsedUser.restaurantId); // Fallback
              }
            } catch (error) {
              console.error('❌ Restaurant UUID fetch hatası:', error);
              setRestaurantId(parsedUser.restaurantId); // Fallback
            }
          }
        } else if (parsedUser.restaurantUsername) {
          // restaurantUsername'den UUID çek
          console.log('⚠️ Restaurant username\'den UUID çekiliyor:', parsedUser.restaurantUsername);
          try {
            const response = await fetch(`${API_URL}/restaurants/username/${parsedUser.restaurantUsername}`);
            const data = await response.json();
            if (data.success && data.data?.id) {
              setRestaurantId(data.data.id);
              console.log('✅ Restaurant UUID bulundu:', data.data.id);
            } else {
              console.error('❌ Restaurant UUID bulunamadı');
            }
          } catch (error) {
            console.error('❌ Restaurant UUID fetch hatası:', error);
          }
        }

        if (parsedUser.restaurantName) {
          setRestaurantName(parsedUser.restaurantName);
        }
      };

      fetchRestaurantId();
    };

    checkAuth();
  }, [router, API_URL]);

  // Yetki kontrolü fonksiyonu
  const hasPermission = (permissionId: string) => {
    // Debug: Eğer staffUser yoksa false
    if (!staffUser) return false;

    // Yönetici/Admin/Sahip her yetkiye sahiptir
    if (['admin', 'manager', 'restaurant_owner'].includes(staffUser.role)) return true;

    // Yetki listesi yoksa veya boşsa
    if (!staffUser.permissions || !Array.isArray(staffUser.permissions)) return false;

    // Yetkiyi bul ve durumunu döndür
    const permission = staffUser.permissions.find((p: any) => p.id === permissionId);
    return permission ? permission.enabled : false;
  };

  // Menu items'ları çek
  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu/items`);
      if (!response.ok) {
        console.warn(`Menu items endpoint returned ${response.status}. Skipping menu items fetch.`);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data || []);
      }
    } catch (error) {
      console.warn('Menu items alınamadı (sipariş düzenleme özelliği çalışmayabilir):', error);
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
      const url = `${API_URL}/orders?restaurantId=${restaurantId}&approved=true`;
      console.log(`📡 Siparişler çekiliyor: ${url}`);

      const response = await fetch(url);
      const data = await response.json();


      if (data.success) {
        console.log(`✅ ${data.data?.length || 0} sipariş alındı`);
        const newOrders = data.data || [];
        setOrders(newOrders);
        const readyCount = newOrders.filter((o: any) => o.status === 'ready').length;
        if (newOrders.length > prevOrderCount.current || readyCount > prevReadyCount.current) {
          playNotificationSound();
        }
        prevOrderCount.current = newOrders.length;
        prevReadyCount.current = readyCount;
      } else {
        console.error('❌ Siparişler alınamadı (API Error):', data.message);
        // Hata mesajını kullanıcıya göster
        if (data.message && data.message.includes('column')) {
          alert('⚠️ Veritabanı güncelleniyor. Lütfen 2 dakika sonra sayfayı yenileyin.');
        }
      }
    } catch (error: any) {
      console.error('❌ Siparişler alınamadı (Network Error):', error);
      // Network hatası durumunda kullanıcıya bilgi ver
      if (!silent) {
        alert('❌ Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Müşteri çağrılarını çek
  const fetchCalls = async () => {
    if (!restaurantId) {
      console.log('⚠️ fetchCalls: restaurantId eksik');
      return;
    }
    try {
      const url = `${API_URL}/waiter/calls?restaurantId=${restaurantId}`;
      console.log(`📞 Çağrılar çekiliyor: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      console.log('📞 Çağrılar response:', data);

      if (data.success) {
        const activeCalls = (data.data || []).filter((call: WaiterCall) => call.status === 'active');
        console.log(`✅ ${activeCalls.length} aktif çağrı bulundu (toplam: ${data.data?.length || 0})`);
        setCalls(activeCalls);
        if (activeCalls.length > prevCallCount.current) {
          playNotificationSound();
        }
        prevCallCount.current = activeCalls.length;
      } else {
        console.error('❌ Çağrılar alınamadı:', data.message);
      }
    } catch (error) {
      console.error('❌ Çağrılar fetch hatası:', error);
    }
  };

  // Çağrıyı çöz
  const resolveCall = async (callId: string) => {
    try {
      const response = await fetch(`${API_URL}/waiter/calls/${callId}/resolve`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (data.success) {
        setCalls(prev => prev.filter(c => c.id !== callId));
      }
    } catch (error) {
      console.error('Çağrı çözülemedi:', error);
    }
  };

  // Masaları (QR Tokenları) çek
  const fetchTables = async () => {
    if (!restaurantId) return;
    try {
      const response = await apiService.getRestaurantQRTokens(restaurantId);
      if (response.success && Array.isArray(response.data)) {
        const tableNums = response.data.map((t: any) => t.tableNumber).filter((n: any) => !isNaN(n));
        // Unique and sort
        const uniqueTables = Array.from(new Set(tableNums)).sort((a: any, b: any) => a - b) as number[];
        setTables(uniqueTables);
        console.log(`✅ ${uniqueTables.length} masa yüklendi.`);
      }
    } catch (error) {
      console.error('Masalar çekilemedi:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      const loadData = () => {
        fetchOrders(true);
        fetchCalls();
      };

      fetchOrders(false);
      fetchCalls();
      fetchMenuItems();
      fetchTables(); // Load tables once

      const interval = setInterval(loadData, 10000);
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
      // Gruplu sipariş ID'si ise gerçek siparişleri bul ve güncelle
      if (orderId.includes('grouped')) {
        const tableNumber = parseInt(orderId.split('-')[1]);
        const tableOrders = orders.filter(o => o.tableNumber === tableNumber);

        // Her bir gerçek siparişi güncelle
        const updatePromises = tableOrders.map(async (tableOrder) => {
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

        // UI'ı güncelle
        if (newStatus === 'cancelled') {
          setOrders(prevOrders => prevOrders.filter(o => o.tableNumber !== tableNumber));
        } else {
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.tableNumber === tableNumber ? { ...order, status: newStatus as any } : order
            )
          );
        }
        return;
      }

      // Normal sipariş için standart güncelleme
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

  // Masa Numarasını API ile Güncelle
  const handleUpdateTable = async () => {
    if (!orderToChangeTable || !newTableNumber) return;
    const tableNum = parseInt(newTableNumber);

    if (isNaN(tableNum) || tableNum < 0) {
      alert('Lütfen geçerli bir masa numarası girin!');
      return;
    }

    try {
      setLoading(true);
      const isGrouped = orderToChangeTable.id.includes('grouped');
      const tableOrders = isGrouped ? orderToChangeTable.originalOrders || [] : [orderToChangeTable];

      if (tableOrders.length === 0) return;

      const results = await Promise.all(tableOrders.map(async (order) => {
        const response = await fetch(`${API_URL}/orders/${order.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tableNumber: tableNum })
        });
        return response.json();
      }));

      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        console.log(`✅ Masa ${orderToChangeTable.tableNumber} -> ${tableNum} olarak güncellendi`);
        // UI'ı güncelle
        setShowTableModal(false);
        setOrderToChangeTable(null);
        setNewTableNumber('');
        fetchOrders(true);
      } else {
        alert('Bazı siparişler güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('❌ Masa güncelleme hatası:', error);
      alert('Masa güncellenirken teknik bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sipariş detaylarını aç
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Siparişleri masa numarasına göre grupla
  const groupOrdersByTable = (orders: Order[]) => {
    const grouped = new Map<number, Order[]>();

    orders.forEach(order => {
      const tableNumber = order.tableNumber;
      if (!grouped.has(tableNumber)) {
        grouped.set(tableNumber, []);
      }
      grouped.get(tableNumber)!.push(order);
    });

    return grouped;
  };

  // Gruplu siparişleri tek sipariş formatına çevir
  const createGroupedOrder = (tableOrders: Order[]): Order => {
    // En son siparişin bilgilerini temel al
    const latestOrder = [...tableOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    // Tüm items'ları birleştir
    const allItems: OrderItem[] = [];
    let totalAmount = 0;

    tableOrders.forEach(order => {
      order.items.forEach(item => {
        allItems.push(item);
      });
      totalAmount += Number(order.totalAmount);
    });

    // En kritik durumu belirle (ready > pending > preparing > others)
    const statusPriority: { [key: string]: number } = { 'ready': 5, 'pending': 4, 'preparing': 3, 'completed': 2, 'cancelled': 1 };
    const mostCriticalStatus = tableOrders.reduce((prev, current) => {
      const pPriority = statusPriority[prev.status] ?? 0;
      const cPriority = statusPriority[current.status] ?? 0;
      return pPriority > cPriority ? prev : current;
    }).status;

    // Notları temizle (Ödeme bilgilerini gizle)
    const cleanNotes = (note: string) => {
      if (!note) return '';
      return note.replace(/Ödeme yöntemi:[^|]*?(?:\||$)/g, '')
        .replace(/Bahşiş:[^|]*?(?:\||$)/g, '')
        .replace(/Bağış:[^|]*?(?:\||$)/g, '')
        .replace(/Debug\s+Simülasyonu\s*-\s*Ödeme:[^|]*?(?:\||$)/gi, '')
        .trim();
    };

    const combinedNotes = tableOrders.map(o => cleanNotes(o.notes || '')).filter(Boolean)
      .filter((note, index, arr) => arr.indexOf(note) === index)
      .join(' | ');

    return {
      ...latestOrder,
      items: allItems,
      totalAmount,
      status: mostCriticalStatus,
      id: tableOrders.length > 1 ? `table-${latestOrder.tableNumber}-grouped` : latestOrder.id,
      notes: combinedNotes,
      paymentInfo: '', // Gizli tutalım
      originalOrders: tableOrders
    };
  };

  // Filtrelenmiş ve gruplu siparişler
  const filteredOrders = (() => {
    const filtered = orders.filter(order => {
      if (activeFilter === 'all') return true;
      return order.status === activeFilter;
    });

    const grouped = groupOrdersByTable(filtered);
    const groupedOrders: Order[] = [];

    grouped.forEach((tableOrders) => {
      groupedOrders.push(createGroupedOrder(tableOrders));
    });

    return groupedOrders;
  })();

  // İstatistikler - gruplu siparişler için
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length
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
        ) : (filteredOrders.length === 0 && activeFilter !== 'all') ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-12 text-center text-white">
            <FaUtensils className="text-6xl mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Sipariş Yok</h3>
            <p className="opacity-75">Bu filtrede sipariş bulunmuyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Logic: If 'all' filter, show ALL tables. If specific filter, show only matching orders */}
            {(activeFilter === 'all' && tables.length > 0 ? tables : filteredOrders.map(o => o.tableNumber)).map((item) => {
              // Resolve Table Number and Order
              let tableNumber = 0;
              let order: Order | undefined;

              if (typeof item === 'number') {
                tableNumber = item;
                order = filteredOrders.find(o => o.tableNumber === tableNumber);
              } else {
                // Fallback for filtered view where we map active orders
                const o = (activeFilter === 'all' && tables.length > 0) ? null : filteredOrders.find(fo => fo.tableNumber === item); // redundant but safe
                if (!o && activeFilter !== 'all') return null; // Should not happen
                tableNumber = item as number;
                order = filteredOrders.find(fo => fo.tableNumber === tableNumber);
              }

              const activeCall = calls.find(c => c.tableNumber === tableNumber && c.type !== 'bill');

              // If 'all' view and empty table
              if (activeFilter === 'all' && !order && !activeCall) {
                return (
                  <div key={`table-${tableNumber}`} className="bg-white bg-opacity-90 rounded-2xl p-4 shadow-sm border-2 border-gray-200 opacity-75 hover:opacity-100 transition-opacity flex flex-col items-center justify-center min-h-[150px]">
                    <div className="text-2xl font-bold text-gray-400 mb-2">Masa {tableNumber}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <FaCheckCircle /> Boş
                    </div>
                  </div>
                );
              }

              // If we have an active call but no order (e.g. customer sat down and called waiter before ordering)
              if (!order && activeCall) {
                return (
                  <div key={`table-${tableNumber}`} className="bg-white rounded-2xl p-4 shadow-lg border-2 border-orange-500 ring-4 ring-orange-200 animate-pulse">
                    <div className="text-lg font-bold text-gray-900 mb-2">Masa {tableNumber}</div>
                    <div className="mb-3 flex items-center justify-between p-3 rounded-xl bg-orange-100 border-2 border-orange-400 text-orange-800">
                      <div className="flex items-center gap-2">
                        <FaBell className="text-orange-600" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {activeCall.type === 'water' ? 'SU İSTİYOR' :
                              activeCall.type === 'clean' ? 'TEMİZLİK' :
                                activeCall.type === 'custom' ? 'MÜŞTERİ NOTU' : 'GARSON'}
                          </span>
                          {activeCall.message && (
                            <span className="text-xs font-semibold opacity-90">
                              {activeCall.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveCall(activeCall.id);
                        }}
                        className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                      >
                        ✓ Tamamla
                      </button>
                    </div>
                  </div>
                );
              }

              if (!order) return null; // Fallback

              // Standard Active Order Card
              return (
                <div key={order.id} className={`bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all border-2 ${activeCall ? 'border-orange-500 ring-2 ring-orange-200' :
                  order.status === 'ready' ? 'border-green-500 ring-2 ring-green-200 animate-pulse' :
                    'border-transparent hover:border-yellow-400'
                  }`}>
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
                      <div className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded">
                        {getStatusText(order.status)}
                      </div>
                      {order.id.includes('grouped') && (
                        <div className="text-xs text-blue-600 font-semibold mt-1">📋 Birleşik</div>
                      )}
                    </div>
                  </div>

                  {/* Order Items - Full List */}
                  <div className="space-y-1 mb-3">
                    {order.items.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded flex items-center justify-center text-xs font-bold mt-0.5">
                          {item.quantity}x
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-700 font-medium">{item.name}</div>
                          {item.notes && (
                            <div className="text-xs text-purple-600 italic mt-0.5">• {item.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Service Calls Only - Ignore Bill calls */}
                  {(() => {
                    if (activeCall) {
                      return (
                        <div className={`mb-3 flex items-center justify-between p-3 rounded-xl animate-pulse bg-orange-100 border-2 border-orange-400 text-orange-800`}>
                          <div className="flex items-center gap-2">
                            <FaBell className="text-orange-600" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {activeCall.type === 'water' ? 'SU İSTİYOR' :
                                  activeCall.type === 'clean' ? 'TEMİZLİK' :
                                    activeCall.type === 'custom' ? 'MÜŞTERİ NOTU' : 'GARSON'}
                              </span>
                              {activeCall.message && (
                                <span className="text-xs font-semibold opacity-90">
                                  {activeCall.message}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveCall(activeCall.id);
                            }}
                            className="bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                          >
                            ✓ Tamamla
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Customer Requests - Food Related Notes Only */}
                  {order.notes && order.notes.trim() && (
                    <div className="mb-3 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <FaBell className="text-yellow-600 mt-0.5" size={12} />
                      <div className="text-xs text-yellow-800 font-medium">{order.notes}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={`grid gap-2 ${order.id.includes('grouped') ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    {(order.id.includes('grouped') || hasPermission('waiter_view_orders')) && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        📋 Detay
                      </button>
                    )}

                    {hasPermission('waiter_mark_completed') && (
                      <button
                        onClick={() => {
                          if (order.id.includes('grouped')) {
                            // Gruplu sipariş için tüm siparişleri tamamla
                            const tableOrders = orders.filter(o => o.tableNumber === order.tableNumber);
                            tableOrders.forEach(tableOrder => {
                              updateOrderStatus(tableOrder.id, 'completed');
                            });
                          } else {
                            updateOrderStatus(order.id, 'completed');
                          }
                        }}
                        className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        ✓ Servis Et
                      </button>
                    )}

                    {hasPermission('waiter_edit_order') && (
                      <button
                        onClick={() => {
                          setOrderToChangeTable(order);
                          setNewTableNumber(order.tableNumber.toString());
                          setShowTableModal(true);
                        }}
                        className="py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        🔄 Masa
                      </button>
                    )}

                    {hasPermission('waiter_edit_order') && (
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
                    )}

                    {hasPermission('waiter_cancel_order') && (
                      <button
                        onClick={() => {
                          if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                            if (order.id.includes('grouped')) {
                              // Gruplu sipariş için tüm siparişleri iptal et
                              const tableOrders = orders.filter(o => o.tableNumber === order.tableNumber);
                              tableOrders.forEach(tableOrder => {
                                updateOrderStatus(tableOrder.id, 'cancelled');
                              });
                            } else {
                              updateOrderStatus(order.id, 'cancelled');
                            }
                          }
                        }}
                        className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        ❌ İptal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Masa Değiştir Modal */}
      {
        showTableModal && orderToChangeTable && (
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
                  onClick={handleUpdateTable}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Güncelleniyor...' : '✨ Değiştir'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Sipariş Düzenle Modal */}
      {
        showEditModal && orderToEdit && (
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
                    {orderToEdit.items.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm flex-1">{item.name}</span>
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => {
                                const updatedOrder = {
                                  ...orderToEdit,
                                  items: orderToEdit.items.map((i: OrderItem, index: number) =>
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
                                  items: orderToEdit.items.map((i: OrderItem, index: number) =>
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
                                items: orderToEdit.items.filter((_: OrderItem, i: number) => i !== idx)
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
                    {menuItems.map((item: any) => {
                      const existingItem = orderToEdit.items.find((i: OrderItem) => i.name === item.name);
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
        )
      }

      {/* Sipariş Detay Modal */}
      {
        showModal && selectedOrder && (
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

                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
