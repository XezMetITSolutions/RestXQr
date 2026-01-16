'use client';

import { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaReceipt,
  FaCheck,
  FaTimes,
  FaEye,
  FaPrint,
  FaCreditCard,
  FaMoneyBill,
  FaExclamationCircle,
  FaFilter
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import RoleBasedLayout from '@/components/RoleBasedLayout';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function CashierDashboard() {
  const { t } = useTranslation();
  const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Fetch orders with role-based API
  const fetchOrders = async () => {
    if (!authenticatedRestaurant?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/role-orders?restaurantId=${authenticatedRestaurant.id}&status=${activeFilter}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (activeFilter === 'pending') {
          setPendingOrders(data.data || []);
        } else {
          setCompletedOrders(data.data || []);
        }
        console.log(`💰 Kasa paneli ${activeFilter} sipariş sayısı:`, data.data?.length || 0);
      } else {
        setError(data.message || 'Veri alınamadı');
      }
    } catch (error: any) {
      console.error('❌ Sipariş yükleme hatası:', error);
      setError(error.message || 'Sipariş yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Approve order - Cashier must approve orders before they go to kitchen
  const approveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/role-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pending' }) // Special case in the backend for cashier approval
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        fetchOrders();
        alert(t('Sipariş onaylandı ve mutfağa gönderildi'));
      } else {
        throw new Error(data.message || 'Onay işlemi başarısız oldu');
      }
    } catch (error: any) {
      console.error('❌ Onay hatası:', error);
      alert(`Onay işlemi başarısız oldu: ${error.message}`);
    }
  };

  // Reject order
  const rejectOrder = async (orderId: string) => {
    if (!confirm(t('Bu siparişi reddetmek istediğinize emin misiniz?'))) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/role-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        fetchOrders();
        alert(t('Sipariş reddedildi'));
      } else {
        throw new Error(data.message || 'Reddetme işlemi başarısız oldu');
      }
    } catch (error: any) {
      console.error('❌ Reddetme hatası:', error);
      alert(`Reddetme işlemi başarısız oldu: ${error.message}`);
    }
  };

  // Mark order as paid
  const markAsPaid = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/role-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'paid',
          paymentMethod: paymentMethod
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        setShowPaymentModal(false);
        setSelectedOrder(null);
        fetchOrders();
        alert(t('Ödeme başarıyla kaydedildi'));
      } else {
        throw new Error(data.message || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error: any) {
      console.error('❌ Ödeme hatası:', error);
      alert(`Ödeme işlemi başarısız oldu: ${error.message}`);
    }
  };

  // Load data on component mount and when filter changes
  useEffect(() => {
    fetchOrders();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [authenticatedRestaurant?.id, activeFilter]);

  // Calculate order total
  const calculateOrderTotal = (order: any) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    
    return order.items.reduce((total, item) => {
      const price = item.menuItem?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Payment Modal
  const PaymentModal = () => {
    if (!selectedOrder) return null;
    
    const total = calculateOrderTotal(selectedOrder);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <TranslatedText>Ödeme Al</TranslatedText>
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600"><TranslatedText>Masa</TranslatedText></span>
                <span className="font-semibold">{selectedOrder.tableNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600"><TranslatedText>Sipariş No</TranslatedText></span>
                <span className="font-semibold">{selectedOrder.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600"><TranslatedText>Toplam Tutar</TranslatedText></span>
                <span className="font-semibold text-lg">{total.toFixed(2)} TL</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                <TranslatedText>Ödeme Yöntemi</TranslatedText>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                    paymentMethod === 'cash'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FaMoneyBill />
                  <TranslatedText>Nakit</TranslatedText>
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                    paymentMethod === 'card'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard />
                  <TranslatedText>Kredi Kartı</TranslatedText>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOrder(null);
                }}
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => markAsPaid(selectedOrder.id)}
              >
                <TranslatedText>Ödemeyi Tamamla</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RoleBasedLayout 
      requiredRole={['cashier', 'manager', 'admin']} 
      title={t('Kasa Paneli')}
      description={t('Siparişleri onaylayın ve ödemeleri alın')}
    >
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeFilter === 'pending'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('pending')}
            >
              <div className="flex items-center justify-center gap-2">
                <FaExclamationTriangle className={activeFilter === 'pending' ? 'text-blue-700' : 'text-gray-400'} />
                <span><TranslatedText>Onay Bekleyenler</TranslatedText></span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeFilter === 'completed'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('completed')}
            >
              <div className="flex items-center justify-center gap-2">
                <FaCheckCircle className={activeFilter === 'completed' ? 'text-blue-700' : 'text-gray-400'} />
                <span><TranslatedText>Tamamlananlar</TranslatedText></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-sm flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start">
              <FaExclamationCircle className="text-red-500 mt-0.5 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && activeFilter === 'pending' && pendingOrders.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <FaExclamationTriangle className="mx-auto text-gray-400 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              <TranslatedText>Onay Bekleyen Sipariş Yok</TranslatedText>
            </h3>
            <p className="text-gray-500">
              <TranslatedText>Şu anda onay bekleyen sipariş bulunmamaktadır.</TranslatedText>
            </p>
          </div>
        )}

        {!loading && !error && activeFilter === 'completed' && completedOrders.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <FaCheckCircle className="mx-auto text-gray-400 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              <TranslatedText>Tamamlanan Sipariş Yok</TranslatedText>
            </h3>
            <p className="text-gray-500">
              <TranslatedText>Şu anda tamamlanan sipariş bulunmamaktadır.</TranslatedText>
            </p>
          </div>
        )}

        {activeFilter === 'pending' && pendingOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    <TranslatedText>Masa</TranslatedText> {order.tableNumber}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <TranslatedText>Onay Bekliyor</TranslatedText>
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => approveOrder(order.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <FaCheck className="text-xs" />
                  <TranslatedText>Onayla</TranslatedText>
                </button>
                <button
                  onClick={() => rejectOrder(order.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <FaTimes className="text-xs" />
                  <TranslatedText>Reddet</TranslatedText>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                <TranslatedText>Sipariş İçeriği</TranslatedText>
              </h4>
              <ul className="space-y-2">
                {order.items?.map((item: any, index: number) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800">{item.menuItem?.name}</div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-700 font-medium">
                      {((item.menuItem?.price || 0) * item.quantity).toFixed(2)} TL
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  <TranslatedText>Toplam</TranslatedText>
                </span>
                <span className="font-bold text-lg text-gray-800">
                  {calculateOrderTotal(order).toFixed(2)} TL
                </span>
              </div>
            </div>
            
            {order.notes && (
              <div className="px-4 pb-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                  <h5 className="text-sm font-medium text-yellow-800">
                    <TranslatedText>Sipariş Notu</TranslatedText>
                  </h5>
                  <p className="text-sm text-yellow-700 mt-1">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeFilter === 'completed' && completedOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    <TranslatedText>Masa</TranslatedText> {order.tableNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'completed' && t('Tamamlandı')}
                    {order.status === 'paid' && t('Ödendi')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'completed' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowPaymentModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaMoneyBillWave className="text-xs" />
                    <TranslatedText>Ödeme Al</TranslatedText>
                  </button>
                )}
                <button
                  onClick={() => {
                    alert(t('Fiş yazdırma özelliği henüz aktif değil.'));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <FaPrint className="text-xs" />
                  <TranslatedText>Fiş</TranslatedText>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                <TranslatedText>Sipariş İçeriği</TranslatedText>
              </h4>
              <ul className="space-y-2">
                {order.items?.map((item: any, index: number) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800">{item.menuItem?.name}</div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-700 font-medium">
                      {((item.menuItem?.price || 0) * item.quantity).toFixed(2)} TL
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  <TranslatedText>Toplam</TranslatedText>
                </span>
                <span className="font-bold text-lg text-gray-800">
                  {calculateOrderTotal(order).toFixed(2)} TL
                </span>
              </div>
            </div>
            
            {order.paymentMethod && (
              <div className="px-4 pb-4">
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                  <h5 className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    <TranslatedText>Ödeme Bilgisi</TranslatedText>
                  </h5>
                  <p className="text-sm text-green-700 mt-1">
                    {order.paymentMethod === 'cash' ? t('Nakit Ödeme') : t('Kredi Kartı ile Ödeme')}
                    {order.paidAt && ` - ${new Date(order.paidAt).toLocaleString()}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </RoleBasedLayout>
  );
}
