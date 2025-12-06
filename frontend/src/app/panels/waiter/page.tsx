'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  FaArrowLeft,
  FaHome
} from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function DemoWaiterPanel() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showTableTransfer, setShowTableTransfer] = useState(false);
  const [transferOrderId, setTransferOrderId] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState<number | ''>('');
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  // Demo veriler - gerçek restoran verileriyle karışmasın diye farklı localStorage key'leri kullan
  const demoOrders = [
    {
      id: 'demo_1001',
      tableNumber: 3,
      guests: 2,
      items: [
        { id: '1', name: 'Adana Kebap', quantity: 2, price: 45, status: 'ready', notes: 'Az acı olsun' },
        { id: '2', name: 'Ayran', quantity: 2, price: 15, status: 'ready' }
      ],
      totalAmount: 120,
      status: 'ready',
      orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notes: 'Az acı olsun'
    },
    {
      id: 'demo_1002',
      tableNumber: 7,
      guests: 4,
      items: [
        { id: '3', name: 'Lahmacun', quantity: 4, price: 25, status: 'preparing' },
        { id: '4', name: 'Çay', quantity: 4, price: 8, status: 'ready' }
      ],
      totalAmount: 132,
      status: 'preparing',
      orderTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      notes: ''
    },
    {
      id: 'demo_1003',
      tableNumber: 12,
      guests: 1,
      items: [
        { id: '5', name: 'Döner', quantity: 1, price: 35, status: 'preparing' },
        { id: '6', name: 'Kola', quantity: 1, price: 12, status: 'ready' }
      ],
      totalAmount: 47,
      status: 'preparing',
      orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      notes: 'Ekstra sos'
    },
    {
      id: 'demo_1004',
      tableNumber: 5,
      guests: 3,
      items: [
        { id: '7', name: 'Pide', quantity: 2, price: 30, status: 'ready' },
        { id: '8', name: 'Salata', quantity: 1, price: 20, status: 'ready' },
        { id: '9', name: 'Su', quantity: 3, price: 5, status: 'served' }
      ],
      totalAmount: 95,
      status: 'ready',
      orderTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      notes: 'Pide kıtır olsun'
    },
    {
      id: 'demo_1005',
      tableNumber: 9,
      guests: 2,
      items: [
        { id: '10', name: 'Mantı', quantity: 1, price: 40, status: 'preparing' },
        { id: '11', name: 'Cacık', quantity: 1, price: 15, status: 'preparing' }
      ],
      totalAmount: 55,
      status: 'preparing',
      orderTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      notes: 'Yoğurtlu'
    }
  ];

  const demoCalls = [
    {
      id: 'demo_call_1',
      tableNumber: 3,
      type: 'waiter_call',
      message: 'Garson isteniyor',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: 'demo_call_2',
      tableNumber: 7,
      type: 'water_request',
      message: 'Su isteniyor',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'demo_call_3',
      tableNumber: 12,
      type: 'bill_request',
      message: 'Hesap isteniyor',
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    }
  ];

  // Demo verileri yükle
  useEffect(() => {
    setActiveCalls(demoCalls);
    setCallHistory([]);
  }, []);

  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`🚀 Demo Buton tıklandı: ${action} - Sipariş ID: ${orderId}`);
    
    // Demo için sadece alert göster
    switch (action) {
      case 'serve':
        alert('✅ Demo: Sipariş servis edildi!');
        break;
      case 'bill':
        alert('✅ Demo: Kasadan hesap çıkarıldı!');
        break;
      case 'call_waiter':
        alert('✅ Demo: Garson çağrısı çözüldü!');
        break;
      case 'call_water':
        alert('✅ Demo: Su isteği çözüldü!');
        break;
      case 'call_bill':
        alert('✅ Demo: Hesap isteği çözüldü!');
        break;
      case 'call_clean':
        alert('✅ Demo: Masa temizleme isteği çözüldü!');
        break;
    }
  };

  const handleTableTransfer = (orderId: string) => {
    setTransferOrderId(orderId);
    setNewTableNumber('');
    setShowTableTransfer(true);
  };

  const confirmTableTransfer = () => {
    if (!transferOrderId || !newTableNumber) return;
    
    alert(`✅ Demo: Sipariş başarıyla ${newTableNumber} numaralı masaya taşındı!`);
    
    setShowTableTransfer(false);
    setTransferOrderId(null);
    setNewTableNumber('');
  };

  const dismissNotification = (tableNumber: number) => {
    setDismissedNotifs(prev => {
      const newSet = new Set(prev);
      newSet.add(tableNumber.toString());
      return newSet;
    });
  };

  const hasChangeForTable = (tableNumber: number) => {
    // Demo için bazı masalarda değişiklik bildirimi göster
    return tableNumber === 7 || tableNumber === 12;
  };

  const filteredOrders = demoOrders.filter(order => {
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

  const stats = {
    preparing: demoOrders.filter(o => o.status === 'preparing').length,
    ready: demoOrders.filter(o => o.status === 'ready').length,
    active: 0,
    billRequested: 0,
    idle: 0,
    totalCalls: activeCalls.length
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/panels" className="p-2 hover:bg-purple-700 rounded-lg transition-colors">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FaConciergeBell />
                  Demo Restoran - Garson Paneli
                </h1>
                <p className="text-purple-200 text-sm">MasApp Demo Versiyonu</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-purple-700 rounded-lg transition-colors">
                <FaHome />
              </Link>
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
            Tümü ({demoOrders.length})
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
                      {/* Sipariş değişiklik bildirimi */}
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

              {/* Çağrılar */}
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
                          onClick={() => {
                            if (call.type === 'waiter_call') handleOrderAction(order.id, 'call_waiter');
                            if (call.type === 'water_request') handleOrderAction(order.id, 'call_water');
                            if (call.type === 'bill_request') handleOrderAction(order.id, 'call_bill');
                            if (call.type === 'clean_request') handleOrderAction(order.id, 'call_clean');
                          }}
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
                        {item.quantity}x {item.name}
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
                  {/* Servis Et Butonu */}
                  <button
                    onClick={() => handleOrderAction(order.id, 'serve')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <FaCheckCircle size={12} />
                    Servis Et
                  </button>
                  
                  {/* Hesap Çıkar Butonu */}
                  {activeCalls.some(call => call.tableNumber === order.tableNumber && call.type === 'bill_request') && (
                    <button
                      onClick={() => handleOrderAction(order.id, 'bill')}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1 text-sm"
                    >
                      <FaMoneyBillWave size={12} />
                      Kasadan Hesap Çıkar
                    </button>
                  )}
                  
                  {/* Masa Değiştir Butonu */}
                  <button
                    onClick={() => handleTableTransfer(order.id)}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <FaExchangeAlt size={12} />
                    Masa Değiştir
                  </button>
                  
                  {/* Detay Butonu */}
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
                const order = demoOrders.find(o => o.id === selectedOrder);
                if (!order) return null;
                
                return (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">Masa {order.tableNumber} - Sipariş Detayları</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Sipariş Bilgileri */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Sipariş Zamanı</p>
                            <p className="font-medium">{new Date(order.orderTime).toLocaleString('tr-TR')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bekleme Süresi</p>
                            <p className={`font-medium ${getWaitTimeColor(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)))}`}>
                              {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))} dakika
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Kişi Sayısı</p>
                            <p className="font-medium">{order.guests} kişi</p>
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
                                <p className="font-medium">{item.quantity}x {item.name}</p>
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
                                      {call.type === 'waiter_call' && 'Garson çağrısı'}
                                      {call.type === 'water_request' && 'Su isteniyor'}
                                      {call.type === 'bill_request' && 'Hesap isteniyor'}
                                      {call.type === 'clean_request' && 'Masa temizleme isteniyor'}
                                    </span>
                                    <span className="text-red-600 text-sm">
                                      Masa {order.tableNumber} - {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (call.type === 'waiter_call') handleOrderAction(order.id, 'call_waiter');
                                    if (call.type === 'water_request') handleOrderAction(order.id, 'call_water');
                                    if (call.type === 'bill_request') handleOrderAction(order.id, 'call_bill');
                                    if (call.type === 'clean_request') handleOrderAction(order.id, 'call_clean');
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
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Masa Değiştirme Modal */}
        {showTableTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Masa Değiştir</h3>
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
    </LanguageProvider>
  );
}
