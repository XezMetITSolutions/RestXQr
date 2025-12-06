'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/store';
import { 
  FaConciergeBell, 
  FaUtensils, 
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaUser,
  FaSignOutAlt,
  FaWater,
  FaHandPaper,
  FaReceipt,
  FaUsers,
  FaEdit,
  FaEye,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTimes,
  FaExchangeAlt,
  FaBell
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useBillRequestStore from '@/store/useBillRequestStore';
import { subscribe } from '@/lib/realtime';
import useNotificationStore from '@/store/useNotificationStore';
import useCentralOrderStore from '@/store/useCentralOrderStore';
import BillModal from '@/components/BillModal';

export default function WaiterDashboard() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  const { language } = useLanguageStore();
  const { 
    createBillRequest, 
    getBillRequestsByStatus, 
    updateBillRequestStatus,
    getBillRequestsByTable 
  } = useBillRequestStore();
  const { 
    createBillRequestNotification,
    getActiveNotifications,
    getUnreadCount,
    notifications
  } = useNotificationStore();
  const { 
    getActiveOrders,
    updateOrderStatus,
    updateItemStatus,
    initializeDemoData
  } = useCentralOrderStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billOrder, setBillOrder] = useState<any>(null);
  const [showTableTransfer, setShowTableTransfer] = useState(false);
  const [transferOrderId, setTransferOrderId] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState<number | ''>('');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [changeNotifs, setChangeNotifs] = useState<any[]>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  // Sadece değişiklik bildirimlerini dinle
  useEffect(() => {
    const interval = setInterval(() => {
      const arr = JSON.parse(localStorage.getItem('kitchen_change_notifications') || '[]');
      const unread = arr.filter((n: any) => !n.read);
      if (unread.length > 0) {
        setChangeNotifs((prev) => [...unread.map((n: any) => ({ ...n, id: 'ls_' + n.timestamp })) , ...prev]);
        const updated = arr.map((n: any) => ({ ...n, read: true }));
        localStorage.setItem('kitchen_change_notifications', JSON.stringify(updated));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (tableNumber: number) => {
    setDismissedNotifs(prev => {
      const newSet = new Set(prev);
      newSet.add(tableNumber.toString());
      return newSet;
    });
  };

  const hasChangeForTable = (tableNumber: number) =>
    changeNotifs.some(n => n.tableNumber === tableNumber);

  // Fetch calls from backend
  const fetchCalls = async () => {
    if (!authenticatedRestaurant?.id) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter/calls?restaurantId=${authenticatedRestaurant.id}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setActiveCalls(data.data);
      }
    } catch (error) {
      console.error('Fetch calls error:', error);
    }
  };

  // Masa değiştirme fonksiyonu
  const handleTableTransfer = (orderId: string) => {
    setTransferOrderId(orderId);
    setNewTableNumber('');
    setShowTableTransfer(true);
  };

  const confirmTableTransfer = () => {
    if (!transferOrderId || !newTableNumber) return;
    
    // Eski masa numarasını al
    const orderToTransfer = orders.find(order => order.id === transferOrderId.toString());
    const oldTableNumber = orderToTransfer?.tableNumber;
    
    if (!oldTableNumber) return;
    
    // Siparişi yeni masaya taşı
    // setOrders(prevOrders => { // Artık merkezi store kullanıyoruz
    //   const updatedOrders = prevOrders.map(order => 
    //     order.id === transferOrderId 
    //       ? { ...order, tableNumber: newTableNumber as number }
    //       : order
    //   );
    //   
    //   // LocalStorage'ı güncelle
    //   localStorage.setItem('waiter_orders', JSON.stringify(updatedOrders));
    //   
    //   return updatedOrders;
    // });

    // Ödeme geçmişini de güncelle
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const updatedPayments = payments.map((payment: any) => 
      payment.orderId === transferOrderId.toString() 
        ? { ...payment, tableNumber: newTableNumber as number }
        : payment
    );
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

    // Müşteriye bildirim gönderme - gereksiz karmaşıklık
    // Tüm veriler otomatik güncellendi, müşteri hiçbir şey fark etmeyecek

    // Kasa bildirimi gönder
    const cashierNotification = {
      type: 'table_transfer',
      orderId: transferOrderId,
      oldTableNumber: oldTableNumber,
      newTableNumber: newTableNumber,
      timestamp: new Date().toISOString(),
      message: `Sipariş #${transferOrderId} ${oldTableNumber} numaralı masadan ${newTableNumber} numaralı masaya taşındı.`
    };

    const existingCashierNotifications = JSON.parse(localStorage.getItem('cashier_notifications') || '[]');
    existingCashierNotifications.push(cashierNotification);
    localStorage.setItem('cashier_notifications', JSON.stringify(existingCashierNotifications));

    // Başarı mesajı
    alert(`✅ Sipariş başarıyla ${newTableNumber} numaralı masaya taşındı!`);

    // Modal'ı kapat
    setShowTableTransfer(false);
    setTransferOrderId(null);
    setNewTableNumber('');
  };

  // Ödeme tamamlandığında sepet sıfırlama
  const handlePaymentComplete = (orderId: number, tableNumber: number) => {
    // Siparişi 'completed' olarak işaretle
    // setOrders(prevOrders => { // Artık merkezi store kullanıyoruz
    //   const updatedOrders = prevOrders.map(order => 
    //     order.id === orderId 
    //       ? { ...order, status: 'completed' }
    //       : order
    //   );
    //   
    //   // LocalStorage'ı güncelle
    //   localStorage.setItem('waiter_orders', JSON.stringify(updatedOrders));
    //   
    //   return updatedOrders;
    // });

    // Masa için tüm çağrıları temizle
    const calls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
    const filteredCalls = calls.filter((call: any) => call.tableNumber !== tableNumber);
    localStorage.setItem('waiter_calls', JSON.stringify(filteredCalls));

    // Müşteri menüsüne sepet sıfırlama bildirimi gönder
    const paymentNotification = {
      type: 'payment_complete',
      tableNumber: tableNumber,
      orderId: orderId,
      timestamp: new Date().toISOString(),
      message: 'Sepete eklendi! Sepeti görüntüleyebilirsiniz.'
    };

    // LocalStorage'a bildirim kaydet
    const existingNotifications = JSON.parse(localStorage.getItem('customer_notifications') || '[]');
    existingNotifications.push(paymentNotification);
    localStorage.setItem('customer_notifications', JSON.stringify(existingNotifications));

    // QR kod yenileme için masa bilgisini güncelle
    const tableUpdate = {
      type: 'table_reset',
      tableNumber: tableNumber,
      timestamp: new Date().toISOString(),
      status: 'available'
    };

    const existingTableUpdates = JSON.parse(localStorage.getItem('table_updates') || '[]');
    existingTableUpdates.push(tableUpdate);
    localStorage.setItem('table_updates', JSON.stringify(existingTableUpdates));

    console.log(`Payment completed for order ${orderId} at table ${tableNumber}`);
  };

  // Demo sipariş kartları - garson arayüzü
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  
  // Periyodik çağrı çekme (5 saniye)
  useEffect(() => {
    if (!authenticatedRestaurant?.id) return;
    
    fetchCalls(); // İlk çekim
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, [authenticatedRestaurant?.id]);
  
  const orders = getActiveOrders();
  console.log('🍽️ Garson paneli sipariş sayısı:', orders.length);

  // Bildirimleri yükle
  useEffect(() => {
    const loadNotifications = () => {
      const activeNotifications = getActiveNotifications('waiter');
      // notifications state'i zaten useNotificationStore'dan geliyor
      console.log('Aktif bildirimler:', activeNotifications);
    };
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [getActiveNotifications]);

  // LocalStorage'dan siparişleri ve çağrıları oku
  useEffect(() => {
    const loadData = () => {
      // Siparişleri yükle
      let storedOrders = JSON.parse(localStorage.getItem('waiter_orders') || '[]');
      
      // Eğer hiç sipariş yoksa örnek siparişler oluştur
      if (storedOrders.length === 0) {
        const sampleOrders = [
          {
            id: 1001,
            tableNumber: 3,
            guests: 2,
            items: [
              { id: '1', name: 'Adana Kebap', quantity: 2, price: 45 },
              { id: '2', name: 'Ayran', quantity: 2, price: 15 }
            ],
            totalAmount: 120,
            status: 'preparing',
            orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            notes: 'Az acı olsun'
          },
          {
            id: 1002,
            tableNumber: 7,
            guests: 4,
            items: [
              { id: '3', name: 'Lahmacun', quantity: 4, price: 25 },
              { id: '4', name: 'Çay', quantity: 4, price: 8 }
            ],
            totalAmount: 132,
            status: 'ready',
            orderTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            notes: ''
          },
          {
            id: 1003,
            tableNumber: 12,
            guests: 1,
            items: [
              { id: '5', name: 'Döner', quantity: 1, price: 35 },
              { id: '6', name: 'Kola', quantity: 1, price: 12 }
            ],
            totalAmount: 47,
            status: 'preparing',
            orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            notes: 'Ekstra sos'
          },
          {
            id: 1004,
            tableNumber: 5,
            guests: 3,
            items: [
              { id: '7', name: 'Pide', quantity: 2, price: 30 },
              { id: '8', name: 'Salata', quantity: 1, price: 20 },
              { id: '9', name: 'Su', quantity: 3, price: 5 }
            ],
            totalAmount: 95,
            status: 'ready',
            orderTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            notes: 'Pide kıtır olsun'
          },
          {
            id: 1005,
            tableNumber: 9,
            guests: 2,
            items: [
              { id: '10', name: 'Mantı', quantity: 1, price: 40 },
              { id: '11', name: 'Cacık', quantity: 1, price: 15 }
            ],
            totalAmount: 55,
            status: 'preparing',
            orderTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            notes: 'Yoğurtlu'
          }
        ];
        
        storedOrders = sampleOrders;
        localStorage.setItem('waiter_orders', JSON.stringify(sampleOrders));
        console.log('🍽️ Örnek siparişler oluşturuldu:', sampleOrders);
      }
      
      // setOrders(storedOrders); // Artık merkezi store kullanıyoruz
      
      // Çağrıları yükle
      let calls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
      
      // Eğer hiç çağrı yoksa örnek çağrılar oluştur
      if (calls.length === 0) {
        const sampleCalls = [
          {
            id: 'call_1',
            tableNumber: 3,
            type: 'waiter_call',
            message: 'Garson isteniyor',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: 'active',
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          },
          {
            id: 'call_2',
            tableNumber: 7,
            type: 'water_request',
            message: 'Su isteniyor',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: 'active',
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            id: 'call_3',
            tableNumber: 12,
            type: 'bill_request',
            message: 'Hesap isteniyor',
            timestamp: new Date(Date.now() - 1 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: 'active',
            createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString()
          }
        ];
        
        calls = sampleCalls;
        localStorage.setItem('waiter_calls', JSON.stringify(sampleCalls));
        console.log('📞 Örnek çağrılar oluşturuldu:', sampleCalls);
      }
      
      // Örnek ödeme geçmişi oluştur
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      if (existingPayments.length === 0) {
        const samplePayments = [
          {
            id: 'pay_1',
            orderId: '1001',
            tableNumber: 3,
            amount: 60,
            method: 'cash',
            items: [
              { id: '1', name: 'Adana Kebap', quantity: 1, price: 45 },
              { id: '2', name: 'Ayran', quantity: 1, price: 15 }
            ],
            payerName: 'Ahmet',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            isPartial: true,
            remainingAmount: 60
          },
          {
            id: 'pay_2',
            orderId: '1004',
            tableNumber: 5,
            amount: 95,
            method: 'card',
            items: [
              { id: '7', name: 'Pide', quantity: 2, price: 30 },
              { id: '8', name: 'Salata', quantity: 1, price: 20 },
              { id: '9', name: 'Su', quantity: 3, price: 5 }
            ],
            payerName: 'Fatma',
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            isPartial: false
          }
        ];
        
        localStorage.setItem('payments', JSON.stringify(samplePayments));
        console.log('💰 Örnek ödeme geçmişi oluşturuldu:', samplePayments);
      }
      
      console.log('📞 LocalStorage\'dan çağrılar yüklendi:', calls);
      
      // Aktif çağrıları ayır
      const activeCalls = calls.filter((call: any) => call.status === 'active');
      setActiveCalls(activeCalls);
      console.log('🔔 Aktif çağrılar:', activeCalls);
      
      // Yeni çağrıları geçmişe ekle
      const newCalls = calls.filter((call: any) => 
        !callHistory.some(historyCall => historyCall.id === call.id)
      );
      
      if (newCalls.length > 0) {
        setCallHistory(prev => [...prev, ...newCalls]);
      }
      
      // Çağrıları siparişlere ekle - sadece aktif çağrıları
      // setOrders(prevOrders => { // Artık merkezi store kullanıyoruz
      //   const updatedOrders = [...prevOrders];
      //   
      //   // Önce tüm çağrıları temizle
      //   updatedOrders.forEach(order => {
      //     // order.calls = []; // Merkezi store'da calls property'si yok
      //   });
      //   
      //   // Sonra LocalStorage'daki aktif çağrıları ekle
      //   calls.forEach((call: any) => {
      //     const existingOrder = updatedOrders.find(o => o.tableNumber === call.tableNumber);
      //     if (existingOrder) {
      //       if (call.type === 'waiter_call' && !existingOrder.calls.includes('waiter')) {
      //         existingOrder.calls.push('waiter');
      //       }
      //       if (call.type === 'water_request' && !existingOrder.calls.includes('water')) {
      //         existingOrder.calls.push('water');
      //       }
      //       if (call.type === 'bill_request' && !existingOrder.calls.includes('bill')) {
      //         existingOrder.calls.push('bill');
      //       }
      //       if (call.type === 'clean_request' && !existingOrder.calls.includes('clean')) {
      //         existingOrder.calls.push('clean');
      //       }
      //     }
      //   });
      //   
      //   return updatedOrders;
      // });
    };

    // İlk yükleme
    loadData();

    // Her 2 saniyede bir kontrol et
    const interval = setInterval(loadData, 2000);

    return () => clearInterval(interval);
  }, [callHistory]);

  useEffect(() => {
    // Client-side rendering kontrolü
    setIsClient(true);
    console.log('Demo panel sayfası');
  }, [setIsClient]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'bill_requested': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'idle': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Servis Hazır';
      case 'active': return 'Aktif';
      case 'bill_requested': return 'Hesap İstendi';
      case 'idle': return 'Boş Masa';
      default: return status;
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 20) return 'text-orange-600';
    return 'text-gray-600';
  };

  // Çağrıyı çözme fonksiyonu
  const resolveCall = async (callId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter/calls/${callId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Çağrıyı local state'den kaldır
        setActiveCalls(prev => prev.filter(call => call.id !== callId));
        console.log('✅ Çağrı çözüldü:', callId);
      }
    } catch (error) {
      console.error('Çağrı çözme hatası:', error);
    }
  };


  const stats = {
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    active: 0, // Merkezi store'da active status yok
    billRequested: 0, // Merkezi store'da bill_requested status yok
    idle: 0, // Merkezi store'da idle status yok
    totalCalls: activeCalls.length // activeCalls state'inden al
  };

  // Client-side rendering kontrolü
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Garson paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FaConciergeBell />
              {authenticatedRestaurant?.name || authenticatedStaff?.name}
            </h1>
            <p className="text-purple-200 text-sm">Garson Paneli</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
            </button>
            {activeCalls.length > 0 && (
              <div className="px-2 py-1 bg-red-600 text-white text-xs rounded-md animate-pulse">
                {activeCalls.length} aktif çağrı
              </div>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="px-4 py-2 bg-black bg-opacity-20 grid grid-cols-5 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.idle}</p>
            <p className="text-xs text-purple-200">Boş</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-purple-200">Aktif</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.preparing}</p>
            <p className="text-xs text-purple-200">Hazırlanıyor</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.ready}</p>
            <p className="text-xs text-purple-200">Hazır</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.billRequested}</p>
            <p className="text-xs text-purple-200">Hesap</p>
          </div>
        </div>
      </header>

      {/* Filtreler */}
      <div className="bg-white shadow-sm px-4 py-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'active' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Aktif ({stats.active})
        </button>
        <button
          onClick={() => setActiveFilter('preparing')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'preparing' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Hazırlanıyor ({stats.preparing})
        </button>
        <button
          onClick={() => setActiveFilter('ready')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'ready' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Hazır ({stats.ready})
        </button>
        <button
          onClick={() => setActiveFilter('bill_requested')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'bill_requested' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          Hesap ({stats.billRequested})
        </button>
      </div>


      {/* Bağımsız çağrı listesi kaldırıldı: çağrılar artık ilgili masa kartında gösteriliyor */}

      {/* Sipariş Kartları */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-lg shadow-md border-2 overflow-hidden ${
              order.status === 'ready' ? 'border-green-400' : 
              'border-gray-200'
            } ${activeCalls.some(call => call.tableNumber === order.tableNumber) ? 'ring-2 ring-red-400 animate-pulse' : ''}`}
          >
            {/* Başlık */}
            <div className={`px-4 py-3 ${getStatusColor(order.status)}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">Masa {order.tableNumber}</p>
                    {/* Sipariş değişiklik bildirimi - Yanıp sönen "değişiklik" yazısı */}
                    {hasChangeForTable(order.tableNumber) && !dismissedNotifs.has(order.tableNumber.toString()) && (
                      <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                        <FaBell className="text-xs" />
                        <span>DEĞİŞİKLİK</span>
                        <button
                          onClick={() => dismissNotification(order.tableNumber)}
                          className="ml-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Bildirimi kaldır"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers size={12} />
                    <span className="text-sm">
                      {order.guests} kişi
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getWaitTimeColor(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)))}`}>
                    <FaClock className="inline mr-1" size={12} />
                    {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))} dk
                  </p>
                </div>
              </div>
            </div>

            {/* Çağrılar - Dikey Olarak Üst Üste */}
            {activeCalls.filter(call => call.tableNumber === order.tableNumber).length > 0 && (
              <div className="px-4 py-4 bg-red-50 border-b border-red-200">
                <h4 className="font-semibold mb-3 text-red-700 text-sm">Müşteri Çağrıları</h4>
                <div className="space-y-2">
                  {activeCalls.filter(call => call.tableNumber === order.tableNumber).map((call, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FaConciergeBell className="text-red-600 animate-pulse" size={16} />
                        <span className="text-red-800 font-bold">
                          {call.type === 'waiter_call' && 'Garson çağrısı'}
                          {call.type === 'water_request' && 'Su isteniyor'}
                          {call.type === 'bill_request' && 'Hesap isteniyor'}
                          {call.type === 'clean_request' && 'Masa temizleme isteniyor'}
                  </span>
                      </div>
                      <button
                        onClick={() => resolveCall(call.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
                        title="Çağrıyı kaldır"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ürünler */}
            <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.quantity}x {typeof item.name === 'string' ? item.name : item.name[language as 'tr' | 'en']}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-purple-600 italic">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'ready' ? 'bg-green-100 text-green-700' :
                    item.status === 'served' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status === 'ready' ? 'Hazır' :
                       item.status === 'served' ? 'Servis Edildi' :
                     'Hazırlanıyor'}
                  </span>
                  </div>
                </div>
              ))}
            </div>

            {/* İşlemler */}
            <div className="px-4 py-3 border-t bg-gray-50 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-purple-600">₺{order.totalAmount}</span>
                <span className="text-sm text-gray-600">{getStatusText(order.status)}</span>
              </div>
              
              <div className="flex gap-2">
                {/* Servis Et Butonu - Her zaman aktif */}
                  <button
                    onClick={() => handleOrderAction(order.id, 'serve')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <FaCheckCircle size={12} />
                    Servis Et
                  </button>
                
                {/* Hesap Çıkar Butonu - Sadece hesap talebi geldiğinde göster */}
                  {activeCalls.some(call => call.tableNumber === order.tableNumber && call.type === 'bill_request') && (
                    <button
                      onClick={() => handleOrderAction(order.id, 'bill')}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaMoneyBillWave size={12} />
                      Kasadan Hesap Çıkar
                    </button>
                  )}
                
                {/* Masa Değiştir Butonu - Her zaman aktif */}
                <button
                  onClick={() => handleTableTransfer(order.id)}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-1 text-sm"
                >
                  <FaExchangeAlt size={12} />
                  Masa Değiştir
                </button>
                
                {/* Detay Butonu - Her zaman aktif */}
                <button
                  onClick={() => setSelectedOrder(order.id)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                >
                  <FaEye size={12} />
                  Detay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const order = orders.find(o => o.id === selectedOrder);
              if (!order) return null;
              
              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Masa {order.tableNumber} - Sipariş Detayları</h3>
              <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
              >
                      <FaTimes size={20} />
              </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Sipariş Bilgileri */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Sipariş Zamanı</p>
                          <p className="font-medium">{order.orderTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bekleme Süresi</p>
                          <p className={`font-medium ${getWaitTimeColor(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)))}`}>
                            {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))} dakika
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Kişi Sayısı</p>
                          <p className="font-medium">{order.guests > 0 ? `${order.guests} kişi` : 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Toplam Tutar</p>
                          <p className="font-bold text-purple-600">₺{order.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ürünler */}
                    <div>
                      <h4 className="font-semibold mb-2">Sipariş Edilen Ürünler</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.quantity}x {typeof item.name === 'string' ? item.name : item.name[language as 'tr' | 'en']}</p>
                              {item.notes && (
                                <p className="text-sm text-purple-600 italic">{item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === 'ready' ? 'bg-green-100 text-green-700' :
                                item.status === 'served' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {item.status === 'ready' ? 'Hazır' :
                                 item.status === 'served' ? 'Servis Edildi' :
                                 'Hazırlanıyor'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Aktif Çağrılar */}
                    {activeCalls.filter(call => call.tableNumber === order.tableNumber).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-4 text-red-700 text-lg">Aktif Çağrılar</h4>
                        <div className="space-y-3">
                          {activeCalls.filter(call => call.tableNumber === order.tableNumber).map((call, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <FaConciergeBell className="text-red-600 animate-pulse" size={18} />
                                <div>
                                  <span className="text-red-800 font-bold text-lg block">
                                    {call === 'waiter' && 'Garson çağrısı'}
                                    {call === 'water' && 'Su isteniyor'}
                                    {call === 'bill' && 'Hesap isteniyor'}
                                    {call === 'clean' && 'Masa temizleme isteniyor'}
                                  </span>
                                  <span className="text-red-600 text-sm">
                                    Masa {order.tableNumber} - {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
              <button
                onClick={() => {
                                  if (call === 'waiter') handleOrderAction(order.id, 'call_waiter');
                                  if (call === 'water') handleOrderAction(order.id, 'call_water');
                                  if (call === 'bill') handleOrderAction(order.id, 'call_bill');
                                  if (call === 'clean') handleOrderAction(order.id, 'call_clean');
                                  setSelectedOrder(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
                              >
                                Çözüldü
              </button>
            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    {/* Çağrı Geçmişi */}
                    {callHistory.filter(call => call.tableNumber === order.tableNumber).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-4 text-gray-700 text-lg">Çağrı Geçmişi</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {callHistory
                            .filter(call => call.tableNumber === order.tableNumber)
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((call, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-100 border border-gray-300 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FaConciergeBell className="text-gray-600" size={16} />
                                <div>
                                  <span className="text-gray-800 font-medium text-sm block">
                                    {call.type === 'waiter_call' && 'Garson çağrısı'}
                                    {call.type === 'water_request' && 'Su isteniyor'}
                                    {call.type === 'bill_request' && 'Hesap isteniyor'}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(call.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Çözüldü
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Fatura Modalı */}
      {showBillModal && billOrder && (
        <BillModal
          isOpen={showBillModal}
          onClose={() => {
            setShowBillModal(false);
            setBillOrder(null);
          }}
          onPaymentComplete={handlePaymentComplete}
          order={billOrder}
          restaurant={{
            name: 'Lezzet Durağı',
            address: 'Atatürk Caddesi No: 123, Kadıköy/İstanbul',
            phone: '+90 216 555 0123',
            taxNumber: '1234567890'
          }}
          allowPartialPayment={true}
        />
      )}

      {/* Masa Değiştirme Modal */}
      {showTableTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Masa Değiştir</h3>
              <button
                onClick={() => setShowTableTransfer(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Masa Numarası
                </label>
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(parseInt(e.target.value) || '')}
                  placeholder="Masa numarasını girin..."
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTableTransfer(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={confirmTableTransfer}
                  disabled={!newTableNumber}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Masa Değiştir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


