'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaConciergeBell,
  FaGlassWhiskey,
  FaFileInvoiceDollar,
  FaBroom,
  FaUtensils,
  FaPhone,
  FaUser
} from 'react-icons/fa';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import BusinessSidebar from '@/components/BusinessSidebar';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  options?: string[];
}

interface Order {
  id: string;
  tableId: string;
  tableName: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  createdAt: any; // Firebase timestamp
  paymentMethod?: 'cash' | 'card' | 'online';
  note?: string;
  waiterCalls?: ('waiter' | 'bill' | 'water' | 'cleanup')[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const { authenticatedRestaurant, logout } = useAuthStore();
  const { restaurant } = useRestaurantStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper for synchronous translation
  const getStatic = (text: string) => {
    const langCode = currentLanguage === 'German' ? 'de' :
      (currentLanguage === 'English' ? 'en' :
        (currentLanguage === 'Turkish' ? 'tr' :
          (currentLanguage === 'Arabic' ? 'ar' :
            (currentLanguage === 'Russian' ? 'ru' :
              (currentLanguage === 'French' ? 'fr' :
                (currentLanguage === 'Spanish' ? 'es' :
                  (currentLanguage === 'Italian' ? 'it' : 'en')))))));

    if (staticDictionary[text] && staticDictionary[text][langCode]) {
      return staticDictionary[text][langCode];
    }
    return text;
  };

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: 'ORD-1001',
        tableId: 'T1',
        tableName: 'Masa 1',
        customerName: 'Ahmet Yılmaz',
        customerPhone: '0532 123 45 67',
        items: [
          { name: 'Izgara Tavuk', quantity: 1, price: 250, options: ['Az pişmiş', 'Patates kızartması ile'] },
          { name: 'Mercimek Çorbası', quantity: 1, price: 80 },
          { name: 'Kola', quantity: 1, price: 40 }
        ],
        totalAmount: 370,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod: 'card',
        note: 'Tavuk soslu olsun lütfen',
        waiterCalls: ['waiter']
      },
      {
        id: 'ORD-1002',
        tableId: 'T3',
        tableName: 'Masa 3',
        items: [
          { name: 'Hamburger Menü', quantity: 2, price: 300, options: ['Orta boy', 'Soğan halkası'] },
          { name: 'Ayran', quantity: 2, price: 30 }
        ],
        totalAmount: 660,
        status: 'preparing',
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        paymentMethod: 'cash'
      },
      {
        id: 'ORD-1003',
        tableId: 'T5',
        tableName: 'Bahçe 2',
        customerName: 'Ayşe Demir',
        items: [
          { name: 'Sezar Salata', quantity: 1, price: 180 },
          { name: 'Su', quantity: 1, price: 15 }
        ],
        totalAmount: 195,
        status: 'ready',
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        id: 'ORD-1004',
        tableId: 'T2',
        tableName: 'Masa 2',
        items: [
          { name: 'Pizza Margherita', quantity: 1, price: 220 },
          { name: 'Limonata', quantity: 1, price: 50 }
        ],
        totalAmount: 270,
        status: 'delivered',
        createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
      },
      {
        id: 'ORD-1005',
        tableId: 'T8',
        tableName: 'Teras 1',
        items: [
          { name: 'Latte', quantity: 2, price: 120 },
          { name: 'Cheesecake', quantity: 1, price: 140 }
        ],
        totalAmount: 260,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      }
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return getStatic('Bekliyor');
      case 'preparing': return getStatic('Hazırlanıyor');
      case 'ready': return getStatic('Hazır');
      case 'delivered': return getStatic('Teslim Edildi');
      case 'completed': return getStatic('Tamamlandı');
      case 'cancelled': return getStatic('İptal Edildi');
      default: return status;
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.tableName.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount': return b.totalAmount - a.totalAmount;
        default: return 0;
      }
    });

    return filtered;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0)
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Toplam', value: stats.total, color: 'bg-blue-50 text-blue-600', icon: FaUtensils },
              { label: 'Bekliyor', value: stats.pending, color: 'bg-yellow-50 text-yellow-600', icon: FaClock },
              { label: 'Hazırlanıyor', value: stats.preparing, color: 'bg-indigo-50 text-indigo-600', icon: FaSpinner },
              { label: 'Hazır', value: stats.ready, color: 'bg-purple-50 text-purple-600', icon: FaCheckCircle },
              { label: 'Tamamlandı', value: stats.completed, color: 'bg-green-50 text-green-600', icon: FaFileInvoiceDollar },
              { label: 'Ciro', value: `₺${stats.revenue}`, color: 'bg-emerald-50 text-emerald-600', icon: FaGlassWhiskey },
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} p-4 rounded-xl border border-opacity-20 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="text-xl opacity-80" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm font-medium opacity-80"><TranslatedText>{stat.label}</TranslatedText></div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['all', 'pending', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {status === 'all' ? getStatic('Tüm Durumlar') : getStatusText(status)}
                </button>
              ))}
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder={getStatic('Müşteri adı, masa no veya ürün ara...')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="today">{getStatic('Bugün')}</option>
                <option value="yesterday">{getStatic('Dün')}</option>
                <option value="week">{getStatic('Bu Hafta')}</option>
                <option value="month">{getStatic('Bu Ay')}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="newest">{getStatic('En Yeni')}</option>
                <option value="oldest">{getStatic('En Eski')}</option>
                <option value="amount">{getStatic('Tutar')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredOrders().map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-gray-800">{order.tableName}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                          #{order.id.split('-')[1]}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-1">•</span>
                        {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} <TranslatedText>dk bekleme</TranslatedText>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  {/* Active Calls */}
                  {order.waiterCalls && order.waiterCalls.length > 0 && (
                    <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex gap-2 overflow-x-auto">
                      {order.waiterCalls.map((call, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs font-bold text-red-600 bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm">
                          {call === 'waiter' && <><FaConciergeBell /> <TranslatedText>Garson çağrısı</TranslatedText></>}
                          {call === 'water' && <><FaGlassWhiskey /> <TranslatedText>Su isteniyor</TranslatedText></>}
                          {call === 'bill' && <><FaFileInvoiceDollar /> <TranslatedText>Hesap isteniyor</TranslatedText></>}
                          {call === 'cleanup' && <><FaBroom /> <TranslatedText>Masa temizleme isteniyor</TranslatedText></>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex gap-2">
                            <span className="font-bold text-gray-400 text-xs px-1.5 py-0.5 bg-gray-100 rounded self-start">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="text-gray-800 font-medium">{item.name}</span>
                              {item.options && (
                                <p className="text-xs text-gray-500">{item.options.join(', ')}</p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-orange-500 italic mt-0.5">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-medium text-gray-600">₺{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-center text-xs text-blue-600 font-medium pt-2 border-t border-dashed">
                          + {order.items.length - 3} <TranslatedText>daha fazla ürün</TranslatedText>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        <div><TranslatedText>Toplam</TranslatedText></div>
                        <div className="text-xs">{order.paymentMethod ? getStatic((order.paymentMethod === 'cash' ? 'Nakit' : 'Kart')) : '-'}</div>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        ₺{order.totalAmount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
              <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col animate-slide-left">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-800"><TranslatedText>Sipariş Detayları</TranslatedText></h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FaTimesCircle className="text-gray-500 text-xl" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Status Header */}
                  <div className={`p-4 rounded-xl border ${getStatusColor(selectedOrder.status)} flex justify-between items-center`}>
                    <div className="font-bold text-lg">{getStatusText(selectedOrder.status)}</div>
                    <div className="text-sm opacity-80">#{selectedOrder.id}</div>
                  </div>

                  {/* Waiter Calls */}
                  {selectedOrder.waiterCalls && selectedOrder.waiterCalls.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                      <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2"><TranslatedText>Aktif Çağrılar</TranslatedText></h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.waiterCalls.map((call, idx) => (
                          <span key={idx} className="flex items-center gap-2 text-sm font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                            {call === 'waiter' && <><FaConciergeBell /> <TranslatedText>Garson çağrısı</TranslatedText></>}
                            {call === 'water' && <><FaGlassWhiskey /> <TranslatedText>Su isteniyor</TranslatedText></>}
                            {call === 'bill' && <><FaFileInvoiceDollar /> <TranslatedText>Hesap isteniyor</TranslatedText></>}
                            {call === 'cleanup' && <><FaBroom /> <TranslatedText>Masa temizleme isteniyor</TranslatedText></>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1"><TranslatedText>Masa No</TranslatedText></div>
                      <div className="font-semibold">{selectedOrder.tableName}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1"><TranslatedText>Sipariş Zamanı</TranslatedText></div>
                      <div className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    {selectedOrder.customerName && (
                      <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                        <div className="text-xs text-gray-500 mb-1"><TranslatedText>Müşteri</TranslatedText></div>
                        <div className="font-semibold flex items-center justify-between">
                          {selectedOrder.customerName}
                          {selectedOrder.customerPhone && (
                            <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                              <FaPhone className="text-xs" /> {selectedOrder.customerPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b"><TranslatedText>Sipariş Edilen Ürünler</TranslatedText></h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="bg-blue-50 text-blue-600 font-bold w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                              {item.quantity}x
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{item.name}</div>
                              {item.options && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.options.map((opt, i) => (
                                    <span key={i} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{opt}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-gray-700">₺{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.note && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <h3 className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <TranslatedText>Özel Notlar</TranslatedText>
                      </h3>
                      <p className="text-sm text-yellow-700">{selectedOrder.note}</p>
                    </div>
                  )}

                  {/* Total Summary */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span><TranslatedText>Ara Toplam</TranslatedText></span>
                      <span>₺{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>KDV (%10)</span>
                      <span>₺{Math.round(selectedOrder.totalAmount * 0.1)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                      <span><TranslatedText>Toplam Tutar</TranslatedText></span>
                      <span>₺{Math.round(selectedOrder.totalAmount * 1.1)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 border-t bg-white safe-area-bottom space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaPrint /> <TranslatedText>Yazdır</TranslatedText>
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaDownload /> <TranslatedText>Rapor İndir</TranslatedText>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => {
                            // In a real app, update status here
                            const nextStatus = selectedOrder.status === 'pending' ? 'preparing' :
                              selectedOrder.status === 'preparing' ? 'ready' :
                                selectedOrder.status === 'ready' ? 'delivered' : 'completed';
                            // For demo just console log
                            console.log('Advance status to', nextStatus);
                          }}
                          className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-colors"
                        >
                          {selectedOrder.status === 'pending' ? getStatic('Hazırlanıyor') :
                            selectedOrder.status === 'preparing' ? getStatic('Hazır') :
                              selectedOrder.status === 'ready' ? getStatic('Teslim Edildi') : getStatic('Tamamlandı')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
