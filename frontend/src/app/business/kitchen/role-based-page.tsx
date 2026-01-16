'use client';

import { useState, useEffect } from 'react';
import {
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlay,
  FaPause,
  FaHourglass,
  FaExclamationTriangle,
  FaFilter,
  FaSort,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import RoleBasedLayout from '@/components/RoleBasedLayout';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function KitchenDashboard() {
  const { t } = useTranslation();
  const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'table'>('time');

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
        setOrders(data.data || []);
        console.log('🍳 Mutfak paneli sipariş sayısı:', data.data?.length || 0);
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

  // Update order item status
  const updateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/role-orders/${orderId}/items/${itemId}`, {
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
        throw new Error(data.message || 'Item status update failed');
      }
    } catch (error: any) {
      console.error('❌ Item status update error:', error);
      alert(`Ürün durumu güncellenemedi: ${error.message}`);
    }
  };

  // Load data on component mount and when filter changes
  useEffect(() => {
    fetchOrders();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [authenticatedRestaurant?.id, activeFilter]);

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return a.tableNumber - b.tableNumber;
    }
  });

  // Filter buttons
  const filterButtons = [
    { id: 'all', label: t('Tümü'), icon: <FaUtensils /> },
    { id: 'pending', label: t('Bekleyen'), icon: <FaClock /> },
    { id: 'preparing', label: t('Hazırlanan'), icon: <FaPlay /> }
  ];

  return (
    <RoleBasedLayout 
      requiredRole={['kitchen', 'manager', 'admin']} 
      title={t('Mutfak Paneli')}
      description={t('Siparişleri görüntüleyin ve hazırlayın')}
    >
      {/* Filter and Sort Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            <TranslatedText>Filtrele</TranslatedText>
          </h3>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((button) => (
              <button
                key={button.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === button.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(button.id as any)}
              >
                {button.icon}
                {button.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            <TranslatedText>Sırala</TranslatedText>
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'time'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('time')}
            >
              <FaClock />
              <TranslatedText>Zamana Göre</TranslatedText>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'table'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('table')}
            >
              <FaSort />
              <TranslatedText>Masa Numarasına Göre</TranslatedText>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-8 rounded-lg shadow-sm flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
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

        {!loading && !error && sortedOrders.length === 0 && (
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

        {sortedOrders.map((order) => (
          <div key={order.id} className={`bg-white rounded-lg shadow-sm overflow-hidden ${
            order.status === 'pending' ? 'border-l-4 border-yellow-500' : 
            order.status === 'preparing' ? 'border-l-4 border-blue-500' : ''
          }`}>
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
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'pending' && t('Bekliyor')}
                    {order.status === 'preparing' && t('Hazırlanıyor')}
                    {order.status === 'ready' && t('Hazır')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaPlay className="text-xs" />
                    <TranslatedText>Hazırlamaya Başla</TranslatedText>
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FaCheckCircle className="text-xs" />
                    <TranslatedText>Hazır</TranslatedText>
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                <TranslatedText>Sipariş İçeriği</TranslatedText>
              </h4>
              <ul className="space-y-3">
                {order.items?.map((item: any) => (
                  <li key={item.id} className={`p-3 rounded-lg ${
                    item.status === 'pending' ? 'bg-yellow-50' :
                    item.status === 'preparing' ? 'bg-blue-50' :
                    item.status === 'ready' ? 'bg-green-50' :
                    'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-white border text-gray-800 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">{item.menuItem?.name}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-600 mt-0.5 italic">{item.notes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <TranslatedText>Hazırlamaya Başla</TranslatedText>
                          </button>
                        )}
                        
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <TranslatedText>Hazır</TranslatedText>
                          </button>
                        )}
                        
                        {item.status === 'ready' && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <FaCheck className="text-xs" />
                            <TranslatedText>Hazır</TranslatedText>
                          </span>
                        )}
                      </div>
                    </div>
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
