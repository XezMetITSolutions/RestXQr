'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import RoleBasedLayout from '@/components/RoleBasedLayout';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WaiterDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders with role-based API
  const fetchOrders = async () => {
    if (!authenticatedRestaurant?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/role-orders?restaurantId=${authenticatedRestaurant.id}&status=${activeFilter !== 'all' ? activeFilter : ''}`;
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
        const activeOrders = data.data || [];
        setOrders(activeOrders);
        console.log('🍽️ Garson paneli sipariş sayısı:', activeOrders.length);
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

  // Fetch waiter calls
  const fetchCalls = async () => {
    if (!authenticatedRestaurant?.id) return;
    
    try {
      const response = await fetch(`${API_URL}/role-orders/calls?restaurantId=${authenticatedRestaurant.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setActiveCalls(data.data);
      }
    } catch (error) {
      console.error('Fetch calls error:', error);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/role-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        fetchOrders();
      } else {
        throw new Error(data.message || 'Status update failed');
      }
    } catch (error: any) {
      console.error('❌ Status update error:', error);
      alert(`Durum güncellenemedi: ${error.message}`);
    }
  };

  // Load data on component mount and when filter changes
  useEffect(() => {
    fetchOrders();
    fetchCalls();
    
    // Set up polling for real-time updates
    const ordersInterval = setInterval(fetchOrders, 30000); // Every 30 seconds
    const callsInterval = setInterval(fetchCalls, 15000);   // Every 15 seconds
    
    return () => {
      clearInterval(ordersInterval);
      clearInterval(callsInterval);
    };
  }, [authenticatedRestaurant?.id, activeFilter]);

  // Filter buttons for orders
  const filterButtons = [
    { id: 'all', label: t('Tümü'), icon: <FaUtensils /> },
    { id: 'pending', label: t('Bekleyen'), icon: <FaClock /> },
    { id: 'preparing', label: t('Hazırlanıyor'), icon: <FaUtensils /> },
    { id: 'ready', label: t('Hazır'), icon: <FaCheckCircle /> },
    { id: 'served', label: t('Servis Edildi'), icon: <FaConciergeBell /> }
  ];

  return (
    <RoleBasedLayout 
      requiredRole={['waiter', 'manager', 'admin']} 
      title={t('Garson Paneli')}
      description={t('Siparişleri görüntüleyin ve yönetin')}
    >
      {/* Active Calls Section */}
      {activeCalls.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <FaBell className="text-red-500 text-xl mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">
                  <TranslatedText>Aktif Çağrılar</TranslatedText> ({activeCalls.length})
                </h3>
                <p className="text-sm text-red-700">
                  <TranslatedText>Müşteriler yardım bekliyor!</TranslatedText>
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeCalls.map((call, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-red-200 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">
                      <TranslatedText>Masa</TranslatedText> {call.tableNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => {
                      // Handle call response
                      alert(`Masa ${call.tableNumber} çağrısına yanıt verildi`);
                    }}
                  >
                    <TranslatedText>Yanıtla</TranslatedText>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === button.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(button.id)}
              >
                {button.icon}
                {button.label}
              </button>
            ))}
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

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <FaUtensils className="mx-auto text-gray-400 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              <TranslatedText>Sipariş Bulunamadı</TranslatedText>
            </h3>
            <p className="text-gray-500">
              <TranslatedText>Şu anda görüntülenecek sipariş bulunmamaktadır.</TranslatedText>
            </p>
          </div>
        )}

        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    <TranslatedText>Masa</TranslatedText> {order.tableNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'served' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'pending' && t('Bekliyor')}
                    {order.status === 'preparing' && t('Hazırlanıyor')}
                    {order.status === 'ready' && t('Hazır')}
                    {order.status === 'served' && t('Servis Edildi')}
                    {order.status === 'completed' && t('Tamamlandı')}
                    {order.status === 'cancelled' && t('İptal Edildi')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaCheck className="text-xs" />
                    <TranslatedText>Servis Edildi</TranslatedText>
                  </button>
                )}
                
                {order.status === 'served' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaCheckCircle className="text-xs" />
                    <TranslatedText>Tamamlandı</TranslatedText>
                  </button>
                )}
                
                {['pending', 'preparing', 'ready'].includes(order.status) && (
                  <button
                    onClick={() => {
                      if (confirm(t('Bu siparişi iptal etmek istediğinize emin misiniz?'))) {
                        updateOrderStatus(order.id, 'cancelled');
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaTimes className="text-xs" />
                    <TranslatedText>İptal</TranslatedText>
                  </button>
                )}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'ready' ? 'bg-green-100 text-green-800' :
                      item.status === 'served' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'pending' && t('Bekliyor')}
                      {item.status === 'preparing' && t('Hazırlanıyor')}
                      {item.status === 'ready' && t('Hazır')}
                      {item.status === 'served' && t('Servis Edildi')}
                    </span>
                  </li>
                ))}
              </ul>
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
      </div>
    </RoleBasedLayout>
  );
}
