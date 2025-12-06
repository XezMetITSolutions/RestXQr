'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaClock, 
  FaCheckCircle, 
  FaUtensils, 
  FaBell,
  FaSort,
  FaSearch,
  FaArrowLeft,
  FaHome,
  FaExclamationCircle,
  FaFire
} from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function DemoKitchenPanel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [searchTerm, setSearchTerm] = useState('');
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const [readyConfirmations, setReadyConfirmations] = useState<Set<string>>(new Set());
  const [itemReadyConfirmations, setItemReadyConfirmations] = useState<Set<string>>(new Set());

  // Demo mutfak siparişleri
  const demoOrders = [
    {
      id: 'demo_kitchen_1',
      tableNumber: 3,
      guests: 2,
      items: [
        { id: '1', name: 'Adana Kebap', quantity: 2, price: 45, status: 'preparing', prepTime: 15, priority: 'high' },
        { id: '2', name: 'Ayran', quantity: 2, price: 15, status: 'preparing', prepTime: 2, priority: 'low' }
      ],
      totalAmount: 120,
      status: 'preparing',
      orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      priority: 'high',
      notes: 'Az acı olsun'
    },
    {
      id: 'demo_kitchen_2',
      tableNumber: 7,
      guests: 4,
      items: [
        { id: '3', name: 'Lahmacun', quantity: 4, price: 25, status: 'preparing', prepTime: 8, priority: 'medium' },
        { id: '4', name: 'Çay', quantity: 4, price: 8, status: 'ready', prepTime: 3, priority: 'low' }
      ],
      totalAmount: 132,
      status: 'preparing',
      orderTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      priority: 'medium',
      notes: ''
    },
    {
      id: 'demo_kitchen_3',
      tableNumber: 12,
      guests: 1,
      items: [
        { id: '5', name: 'Döner', quantity: 1, price: 35, status: 'preparing', prepTime: 10, priority: 'medium' },
        { id: '6', name: 'Kola', quantity: 1, price: 12, status: 'ready', prepTime: 1, priority: 'low' }
      ],
      totalAmount: 47,
      status: 'preparing',
      orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'medium',
      notes: 'Ekstra sos'
    },
    {
      id: 'demo_kitchen_4',
      tableNumber: 5,
      guests: 3,
      items: [
        { id: '7', name: 'Pide', quantity: 2, price: 30, status: 'ready', prepTime: 12, priority: 'medium' },
        { id: '8', name: 'Salata', quantity: 1, price: 20, status: 'ready', prepTime: 5, priority: 'low' },
        { id: '9', name: 'Su', quantity: 3, price: 5, status: 'ready', prepTime: 1, priority: 'low' }
      ],
      totalAmount: 95,
      status: 'ready',
      orderTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      priority: 'medium',
      notes: 'Pide kıtır olsun'
    },
    {
      id: 'demo_kitchen_5',
      tableNumber: 9,
      guests: 2,
      items: [
        { id: '10', name: 'Mantı', quantity: 1, price: 40, status: 'preparing', prepTime: 20, priority: 'high' },
        { id: '11', name: 'Cacık', quantity: 1, price: 15, status: 'preparing', prepTime: 5, priority: 'low' }
      ],
      totalAmount: 55,
      status: 'preparing',
      orderTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      priority: 'high',
      notes: 'Yoğurtlu'
    }
  ];

  const dismissNotification = (tableNumber: number) => {
    setDismissedNotifs(prev => {
      const newSet = new Set(prev);
      newSet.add(tableNumber.toString());
      return newSet;
    });
  };

  const hasChangeForTable = (tableNumber: number) => {
    return tableNumber === 7 || tableNumber === 12;
  };

  const handleItemReady = (orderId: string, itemIndex: number) => {
    const itemKey = `${orderId}-${itemIndex}`;
    setItemReadyConfirmations(prev => {
      const newSet = new Set(prev);
      newSet.add(itemKey);
      return newSet;
    });
    
    setTimeout(() => {
      setItemReadyConfirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
      alert('✅ Demo: Ürün hazır olarak işaretlendi!');
    }, 2000);
  };

  const handleOrderReady = (orderId: string) => {
    setReadyConfirmations(prev => {
      const newSet = new Set(prev);
      newSet.add(orderId);
      return newSet;
    });
    
    setTimeout(() => {
      setReadyConfirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      alert('✅ Demo: Sipariş hazır olarak işaretlendi!');
    }, 2000);
  };

  // Filtreleme ve sıralama
  const filteredAndSortedOrders = demoOrders
    .filter(order => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'preparing') return order.status === 'preparing';
      if (activeFilter === 'ready') return order.status === 'ready';
      return true;
    })
    .filter(order => {
      if (!searchTerm) return true;
      return order.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toString().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'table':
          return a.tableNumber - b.tableNumber;
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek Öncelik';
      case 'medium': return 'Orta Öncelik';
      case 'low': return 'Düşük Öncelik';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      default: return status;
    }
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 20) return 'text-orange-600';
    return 'text-gray-600';
  };

  const stats = {
    preparing: demoOrders.filter(o => o.status === 'preparing').length,
    ready: demoOrders.filter(o => o.status === 'ready').length,
    total: demoOrders.length,
    highPriority: demoOrders.filter(o => o.priority === 'high').length
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/panels" className="p-2 hover:bg-orange-700 rounded-lg transition-colors">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FaUtensils />
                  Demo Restoran - Mutfak Paneli
                </h1>
                <p className="text-orange-200 text-sm">MasApp Demo Versiyonu</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-orange-700 rounded-lg transition-colors">
                <FaHome />
              </Link>
              <div className="flex items-center gap-2 bg-orange-700 px-3 py-1 rounded-lg">
                <FaFire className="text-yellow-300" />
                <span className="text-sm font-medium">{stats.highPriority} Acil</span>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="px-4 py-2 bg-black bg-opacity-20 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-orange-200">Toplam</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.preparing}</p>
              <p className="text-xs text-orange-200">Hazırlanıyor</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ready}</p>
              <p className="text-xs text-orange-200">Hazır</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
              <p className="text-xs text-orange-200">Acil</p>
            </div>
          </div>
        </header>

        {/* Demo Uyarısı */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                🎭 Bu demo versiyondur. Tüm veriler örnek verilerdir ve gerçek işlemler yapılmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Kontroller */}
        <div className="bg-white shadow-sm px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filtreler */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü ({stats.total})
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
            </div>

            {/* Sıralama */}
            <div className="flex items-center gap-2">
              <FaSort className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="time">Zamana Göre</option>
                <option value="priority">Önceliğe Göre</option>
                <option value="table">Masaya Göre</option>
              </select>
            </div>

            {/* Arama */}
            <div className="flex items-center gap-2 flex-1">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Ürün veya masa ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Sipariş Kartları */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedOrders.map(order => (
            <div
              key={order.id}
              className={`bg-white rounded-lg shadow-md border-2 overflow-hidden ${
                order.priority === 'high' ? 'border-red-400' :
                order.priority === 'medium' ? 'border-yellow-400' :
                'border-gray-200'
              } ${hasChangeForTable(order.tableNumber) && !dismissedNotifs.has(order.tableNumber.toString()) ? 'ring-2 ring-orange-400' : ''}`}
            >
              {/* Başlık */}
              <div className={`px-4 py-3 ${getPriorityColor(order.priority)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">Masa {order.tableNumber}</p>
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
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-medium">{getPriorityText(order.priority)}</span>
                      <span className={`text-sm ${getWaitTimeColor(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)))}`}>
                        <FaClock className="inline mr-1" size={12} />
                        {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))} dk
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ürünler */}
              <div className="px-4 py-3 space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {item.quantity}x {item.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          <FaClock className="inline mr-1" />
                          {item.prepTime}dk
                        </span>
                      </div>
                      {item.status === 'preparing' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'ready' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status === 'ready' ? 'Hazır' : 'Hazırlanıyor'}
                      </span>
                      {item.status === 'preparing' && (
                        <button
                          onClick={() => handleItemReady(order.id, index)}
                          className={`px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors ${
                            itemReadyConfirmations.has(`${order.id}-${index}`) ? 'animate-pulse' : ''
                          }`}
                          disabled={itemReadyConfirmations.has(`${order.id}-${index}`)}
                        >
                          {itemReadyConfirmations.has(`${order.id}-${index}`) ? 'Hazırlandı!' : 'Hazır'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notlar */}
              {order.notes && (
                <div className="px-4 py-2 bg-blue-50 border-t">
                  <p className="text-sm text-blue-700 italic">
                    <strong>Not:</strong> {order.notes}
                  </p>
                </div>
              )}

              {/* İşlemler */}
              <div className="px-4 py-3 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-orange-600">₺{order.totalAmount}</span>
                  <span className="text-sm text-gray-600">
                    {order.guests} kişi
                  </span>
                </div>
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleOrderReady(order.id)}
                    className={`w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors ${
                      readyConfirmations.has(order.id) ? 'animate-pulse' : ''
                    }`}
                    disabled={readyConfirmations.has(order.id)}
                  >
                    {readyConfirmations.has(order.id) ? 'Sipariş Hazırlandı!' : 'Siparişi Hazır İşaretle'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </LanguageProvider>
  );
}
