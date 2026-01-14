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
  FaBell,
  FaTimesCircle,
  FaCheck
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useBillRequestStore from '@/store/useBillRequestStore';
import { subscribe } from '@/lib/realtime';
import useNotificationStore from '@/store/useNotificationStore';
import useCentralOrderStore from '@/store/useCentralOrderStore';
import BillModal from '@/components/BillModal';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WaiterDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
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
    updateItemStatus
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
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const arr = JSON.parse(localStorage.getItem('kitchen_change_notifications') || '[]');
      const unread = arr.filter((n: any) => !n.read);
      if (unread.length > 0) {
        setChangeNotifs((prev) => [...unread.map((n: any) => ({ ...n, id: 'ls_' + n.timestamp })), ...prev]);
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

  const fetchOrders = async (showLoading = true) => {
    if (!authenticatedRestaurant?.id) {
      setDebugInfo(prev => ({ ...prev, error: 'No authenticated restaurant ID' }));
      return;
    }
    try {
      if (showLoading) {
        setLoading(true);
      }
      const url = `${API_URL}/orders?restaurantId=${authenticatedRestaurant.id}`;
      setDebugInfo(prev => ({ ...prev, apiUrl: url, timestamp: new Date().toISOString() }));
      
      const response = await fetch(url);
      const data = await response.json();
      
      setDebugInfo(prev => ({ 
        ...prev, 
        response: {
          status: response.status,
          ok: response.ok,
          data: data,
          dataLength: data.data?.length || 0
        }
      }));
      
      if (data.success) {
        const activeOrders = (data.data || []).filter((order: any) => 
          ['pending', 'preparing', 'ready', 'served'].includes(order.status)
        );
        setOrders(activeOrders);
        console.log('🍽️ Garson paneli sipariş sayısı:', activeOrders.length);
        setDebugInfo(prev => ({ ...prev, activeOrdersCount: activeOrders.length }));
      } else {
        setDebugInfo(prev => ({ ...prev, error: data.message || 'API returned success: false' }));
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleTableTransfer = (orderId: string) => {
    setTransferOrderId(orderId);
    setNewTableNumber('');
    setShowTableTransfer(true);
  };

  const confirmTableTransfer = () => {
    if (!transferOrderId || !newTableNumber) return;
    const orderToTransfer = orders.find(order => order.id === transferOrderId.toString());
    const oldTableNumber = orderToTransfer?.tableNumber;
    if (!oldTableNumber) return;

    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const updatedPayments = payments.map((payment: any) =>
      payment.orderId === transferOrderId.toString()
        ? { ...payment, tableNumber: newTableNumber as number }
        : payment
    );
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

    const cashierNotification = {
      type: 'table_transfer',
      orderId: transferOrderId,
      oldTableNumber: oldTableNumber,
      newTableNumber: newTableNumber,
      timestamp: new Date().toISOString(),
      message: t('Sipariş #{0} {1} numaralı masadan {2} numaralı masaya taşındı.').replace('{0}', transferOrderId).replace('{1}', oldTableNumber.toString()).replace('{2}', newTableNumber.toString())
    };

    const existingCashierNotifications = JSON.parse(localStorage.getItem('cashier_notifications') || '[]');
    existingCashierNotifications.push(cashierNotification);
    localStorage.setItem('cashier_notifications', JSON.stringify(existingCashierNotifications));

    alert(t('✅ Sipariş başarıyla {0} numaralı masaya taşındı!').replace('{0}', newTableNumber.toString()));

    setShowTableTransfer(false);
    setTransferOrderId(null);
    setNewTableNumber('');
  };

  const handlePaymentComplete = (orderId: number, tableNumber: number) => {
    const calls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
    const filteredCalls = calls.filter((call: any) => call.tableNumber !== tableNumber);
    localStorage.setItem('waiter_calls', JSON.stringify(filteredCalls));

    const paymentNotification = {
      type: 'payment_complete',
      tableNumber: tableNumber,
      orderId: orderId,
      timestamp: new Date().toISOString(),
      message: t('Sepete eklendi! Sepeti görüntüleyebilirsiniz.')
    };

    const existingNotifications = JSON.parse(localStorage.getItem('customer_notifications') || '[]');
    existingNotifications.push(paymentNotification);
    localStorage.setItem('customer_notifications', JSON.stringify(existingNotifications));

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

  const handleOrderAction = async (orderId: number | string, action: string) => {
    if (action === 'serve') {
      updateOrderStatus(orderId.toString(), 'served');
    } else if (action === 'bill') {
      alert(t('Hesap talebi alındı.'));
    }
  };

  const checkOrderChanges = async (orderId: string) => {
    // dummy implementation
  };

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchOrders(false); // Refresh orders
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  useEffect(() => {
    if (!authenticatedRestaurant?.id) return;
    fetchCalls();
    fetchOrders();
    const callsInterval = setInterval(fetchCalls, 5000);
    const ordersInterval = setInterval(() => fetchOrders(false), 3000);
    return () => {
      clearInterval(callsInterval);
      clearInterval(ordersInterval);
    };
  }, [authenticatedRestaurant?.id]);

  const selectedOrderDetail = orders.find(o => o.id === selectedOrder);

  useEffect(() => {
    const loadNotifications = () => {
      const activeNotifications = getActiveNotifications('waiter');
      console.log('Aktif bildirimler:', activeNotifications);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [getActiveNotifications]);

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router, setIsClient]);

  const handleLogout = () => {
    logout();
    router.push('/login');
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
      case 'preparing': return t('Hazırlanıyor');
      case 'ready': return t('Servis Hazır');
      case 'active': return t('Aktif');
      case 'bill_requested': return t('Hesap İstendi');
      case 'idle': return t('Boş Masa');
      default: return status;
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 20) return 'text-orange-600';
    return 'text-gray-600';
  };

  const resolveCall = async (callId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waiter/calls/${callId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setActiveCalls(prev => prev.filter(call => call.id !== callId));
      }
    } catch (error) {
      console.error('Çağrı çözme hatası:', error);
    }
  };

  const stats = {
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    active: 0,
    billRequested: 0,
    idle: 0,
    totalCalls: activeCalls.length
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Garson paneli yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FaConciergeBell />
              {authenticatedRestaurant?.name || authenticatedStaff?.name}
            </h1>
            <p className="text-purple-200 text-sm"><TranslatedText>Garson Paneli</TranslatedText></p>
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
                {t('{0} aktif çağrı').replace('{0}', activeCalls.length.toString())}
              </div>
            )}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Debug
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto pb-4">
          <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Tümü')}</button>
          <button onClick={() => setActiveFilter('preparing')} className={`px-4 py-2 rounded-lg ${activeFilter === 'preparing' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Hazırlanıyor')} ({stats.preparing})</button>
          <button onClick={() => setActiveFilter('ready')} className={`px-4 py-2 rounded-lg ${activeFilter === 'ready' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Hazır')} ({stats.ready})</button>
        </div>
      </header>

      {showDebug && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-lg mb-2">Debug Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Restaurant ID:</strong> {authenticatedRestaurant?.id || 'Yok'}</p>
                <p><strong>Restaurant Name:</strong> {authenticatedRestaurant?.name || 'Yok'}</p>
                <p><strong>Is Authenticated:</strong> {isAuthenticated() ? 'Evet' : 'Hayır'}</p>
                <p><strong>Loading:</strong> {loading ? 'Evet' : 'Hayır'}</p>
                <p><strong>Orders Count:</strong> {orders.length}</p>
              </div>
              <div>
                <p><strong>API URL:</strong> {debugInfo?.apiUrl || 'Henüz çağrılmadı'}</p>
                <p><strong>Last Call:</strong> {debugInfo?.timestamp || 'Henüz çağrılmadı'}</p>
                <p><strong>Response Status:</strong> {debugInfo?.response?.status || 'Yok'}</p>
                <p><strong>Response OK:</strong> {debugInfo?.response?.ok ? 'Evet' : 'Hayır'}</p>
                <p><strong>API Data Length:</strong> {debugInfo?.response?.dataLength || 0}</p>
                <p><strong>Active Orders:</strong> {debugInfo?.activeOrdersCount || 0}</p>
                {debugInfo?.error && <p className="text-red-600"><strong>Error:</strong> {debugInfo.error}</p>}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => fetchOrders(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Manuel Sipariş Çek
              </button>
              <button
                onClick={() => console.log('Debug Info:', debugInfo, 'Orders:', orders, 'Auth:', authenticatedRestaurant)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Console'a Yazdır
              </button>
            </div>
            {debugInfo?.response?.data && (
              <div className="mt-4">
                <h4 className="font-bold">API Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.length === 0 && !loading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">
              <FaUtensils className="mx-auto text-4xl mb-4" />
              <p className="text-lg font-medium">Aktif sipariş bulunamadı</p>
              <p className="text-sm mt-2">Yeni siparişler geldiğinde burada görünecek</p>
              {showDebug && (
                <div className="mt-4 text-xs bg-gray-100 p-3 rounded">
                  <p>Total orders in state: {orders.length}</p>
                  <p>Filtered orders: {filteredOrders.length}</p>
                  <p>Active filter: {activeFilter}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className={`bg-white rounded-lg shadow-md border-2 overflow-hidden ${order.status === 'ready' ? 'border-green-400' : 'border-gray-200'} ${activeCalls.some(call => call.tableNumber === order.tableNumber) ? 'ring-2 ring-red-400 animate-pulse' : ''}`}
          >
            <div className={`px-4 py-3 ${getStatusColor(order.status)}`}>
              <div className="flex justify-between">
                <span className="font-bold">{t('Masa')} {order.tableNumber}</span>
                <span>{getStatusText(order.status)}</span>
              </div>
            </div>
            <div className="p-4">
              {activeCalls.filter(call => call.tableNumber === order.tableNumber).map((call, idx) => (
                <div key={idx} className="bg-red-50 text-red-700 p-2 mb-2 rounded flex justify-between">
                  <span>{call.type === 'waiter_call' ? t('Garson Çağırıyor') : t('Çağrı')}</span>
                  <button onClick={(e) => { e.stopPropagation(); resolveCall(call.id); }} className="font-bold">{t('Çöz')}</button>
                </div>
              ))}
              <div className="space-y-1">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {typeof item.name === 'string' ? item.name : item.name[language as 'tr' | 'en']}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t flex gap-2">
              <button onClick={() => setSelectedOrder(order.id)} className="flex-1 bg-blue-600 text-white py-2 rounded">{t('Detay')}</button>
              {order.status === 'ready' && (
                <button onClick={() => handleUpdateStatus(order.id, 'delivered')} className="flex-1 bg-green-600 text-white py-2 rounded">{t('Teslim')}</button>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('Siparişler yükleniyor...')}</p>
          </div>
        )}
      </div>

      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">{t('Masa')} {selectedOrderDetail.tableNumber}</h3>
              <button onClick={() => setSelectedOrder(null)}><FaTimes /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>{t('Toplam')}:</strong> ₺{selectedOrderDetail.totalAmount}</p>
              </div>
              <div>
                {selectedOrderDetail.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b">
                    <span>{item.quantity}x {typeof item.name === 'string' ? item.name : item.name[language as 'tr' | 'en']}</span>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setBillOrder(selectedOrderDetail);
                  setShowBillModal(true);
                }} className="flex-1 bg-purple-600 text-white py-3 rounded">{t('Hesap Al')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {showTableTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="mb-4 font-bold">{t('Masa Değiştir')}</h3>
            <input type="number" value={newTableNumber} onChange={e => setNewTableNumber(Number(e.target.value))} className="w-full border p-2 mb-4 rounded" placeholder={t('Yeni Masa No')} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTableTransfer(false)} className="px-4 py-2 border rounded">{t('İptal')}</button>
              <button onClick={confirmTableTransfer} className="px-4 py-2 bg-orange-600 text-white rounded">{t('Onayla')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
