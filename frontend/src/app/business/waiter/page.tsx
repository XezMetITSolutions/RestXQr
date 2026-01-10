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

  const handleUpdateStatus = (orderId: string, status: any) => {
    updateOrderStatus(orderId, status);
  };

  useEffect(() => {
    if (!authenticatedRestaurant?.id) return;
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, [authenticatedRestaurant?.id]);

  const orders = getActiveOrders();
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

  if (!isClient) {
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
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto pb-4">
          <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Tümü')}</button>
          <button onClick={() => setActiveFilter('preparing')} className={`px-4 py-2 rounded-lg ${activeFilter === 'preparing' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Hazırlanıyor')} ({stats.preparing})</button>
          <button onClick={() => setActiveFilter('ready')} className={`px-4 py-2 rounded-lg ${activeFilter === 'ready' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>{t('Hazır')} ({stats.ready})</button>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
