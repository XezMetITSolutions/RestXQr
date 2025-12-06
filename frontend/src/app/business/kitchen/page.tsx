'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaSignOutAlt, FaUtensils, FaClock, FaCheckCircle, FaExclamationTriangle, FaPlay, FaPause } from 'react-icons/fa';

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface Order {
  orderId: string;
  restaurantId: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  timestamp: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  preparationTime?: number;
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);

  // Session kontrolü - sayfa yüklendiğinde localStorage'dan kontrol et
  useEffect(() => {
    const checkSession = () => {
      const savedStaff = localStorage.getItem('kitchen_staff');
      if (savedStaff) {
        try {
          const staff = JSON.parse(savedStaff);
          console.log('🍳 Mutfak oturumu geri yüklendi:', staff);
          setIsLoggedIn(true);
          setStaffInfo(staff);
        } catch (error) {
          console.error('Session restore error:', error);
          localStorage.removeItem('kitchen_staff');
          setIsLoggedIn(false);
          setStaffInfo(null);
        }
      } else {
        setIsLoggedIn(false);
        setStaffInfo(null);
      }
    };
    
    checkSession();
  }, []);

  // Real-time connection için EventSource
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com';
    const eventSource = new EventSource(`${baseUrl}/api/events/orders`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Kitchen dashboard connected to real-time updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_order') {
          const newOrder: Order = {
            orderId: data.orderId,
            restaurantId: data.restaurantId,
            tableNumber: data.tableNumber,
            items: data.items,
            totalAmount: data.totalAmount,
            timestamp: data.timestamp,
            status: 'pending'
          };
          
          setOrders(prev => [newOrder, ...prev]);
          setNotifications(prev => [`Masa ${data.tableNumber} için yeni sipariş!`]);
          
          // Bildirim sesi çal
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Yeni Sipariş!', {
              body: `Masa ${data.tableNumber} için sipariş geldi`,
              icon: '/favicon.svg'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing real-time data:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('Real-time connection error');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Notification permission iste
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mevcut siparişleri yükle - AJAX gibi sessiz güncelleme
  const loadOrders = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/api/orders?restaurantId=aksaray&status=pending`);
      const data = await response.json();
      
      if (data.success) {
        const formattedOrders: Order[] = data.data.map((order: any) => ({
          orderId: order.id,
          restaurantId: order.restaurantId,
          tableNumber: order.tableNumber || 0,
          items: order.items || [],
          totalAmount: order.totalAmount || 0,
          timestamp: order.created_at,
          status: order.status || 'pending'
        }));
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(false); // İlk yükleme normal loading ile
    // Her 5 saniyede bir sessiz güncelleme (AJAX tarzı)
    const interval = setInterval(() => loadOrders(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready' | 'completed') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(prev => 
          prev.map(order => 
            order.orderId === orderId 
              ? { ...order, status, preparationTime: status === 'preparing' ? Date.now() : order.preparationTime }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} saat önce`;
  };

  const getPreparationTime = (order: Order) => {
    if (order.status !== 'preparing' || !order.preparationTime) return null;
    
    const now = Date.now();
    const diffMs = now - order.preparationTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    return `${diffMins} dk`;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600 bg-red-100';
      case 'preparing': return 'text-yellow-600 bg-yellow-100';
      case 'ready': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      default: return 'Bilinmiyor';
    }
  };

  // Login kontrolü
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mutfak Paneli</h2>
            <p className="text-gray-600 mb-6">Mutfak paneline erişmek için giriş yapmanız gerekiyor.</p>
            <button
              onClick={() => window.location.href = '/isletme-giris'}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FaUtensils className="text-2xl" />
              <div>
                <h1 className="text-2xl font-bold">Mutfak Paneli</h1>
                <p className="text-red-100 text-sm">Aksaray Restoran</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Debug Button */}
              <button
                onClick={() => {
                  console.log('=== MUTFAK PANELİ DEBUG ===');
                  console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
                  console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com');
                  console.log('SSE URL:', `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com'}/api/events/orders`);
                  console.log('Connection Status:', isConnected);
                  console.log('Orders Count:', orders.length);
                  console.log('Notifications:', notifications);
                  
                  // API Health Check
                  fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com'}/health`)
                    .then(res => res.json())
                    .then(data => console.log('API Health:', data))
                    .catch(err => console.error('API Health Error:', err));
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                🔧 Debug
              </button>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <FaBell className="text-xl cursor-pointer hover:text-red-200" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors">
                <FaSignOutAlt />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: 'all', label: 'Tümü', count: orders.length },
            { key: 'pending', label: 'Bekleyen', count: orders.filter(o => o.status === 'pending').length },
            { key: 'preparing', label: 'Hazırlanan', count: orders.filter(o => o.status === 'preparing').length },
            { key: 'ready', label: 'Hazır', count: orders.filter(o => o.status === 'ready').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === key
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                order.status === 'pending' ? 'border-red-500' :
                order.status === 'preparing' ? 'border-yellow-500' :
                order.status === 'ready' ? 'border-green-500' : 'border-gray-500'
              } hover:shadow-xl transition-all duration-300`}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Masa {order.tableNumber}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <FaClock className="mr-1" />
                    {getTimeAgo(order.timestamp)}
                  </p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">Adet: {item.quantity}</div>
                      {item.notes && (
                        <div className="text-sm text-blue-600 mt-1 italic">
                          Not: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Toplam:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₺{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Preparation Time */}
              {order.status === 'preparing' && getPreparationTime(order) && (
                <div className="mb-4 p-2 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-700 font-medium">
                    Hazırlanma Süresi: {getPreparationTime(order)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPlay />
                    <span>Hazırla</span>
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'ready')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle />
                    <span>Hazır</span>
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'completed')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle />
                    <span>Teslim Et</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              {filter === 'all' ? 'Henüz sipariş yok' : `${getStatusText(filter)} sipariş yok`}
            </h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'Yeni siparişler geldiğinde burada görünecek' 
                : 'Bu durumda sipariş bulunmuyor'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
