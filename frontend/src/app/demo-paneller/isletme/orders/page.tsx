'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaShoppingCart, 
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaPrint,
  FaFilter,
  FaSearch,
  FaChartLine,
  FaChartBar,
  FaUsers,
  FaSignOutAlt,
  FaDownload,
  FaCog,
  FaHeadset,
  FaUtensils,
  FaQrcode,
  FaBell,
  FaMoneyBillWave,
  FaTimes,
  FaSort,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaBars
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';

export default function OrdersPage() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  
  // Sayfa yüklendiğinde auth'u initialize et
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Demo için session kontrolü yok
  useEffect(() => {
    console.log('Demo panel sayfası');
  }, []);

  // Siparişleri backend'den yükle
  useEffect(() => {
    // Backend'den siparişleri çek (gelecekte implement edilecek)
    // TODO: API call to fetch orders from backend
    console.log('📦 Orders will be loaded from backend');
    // Şimdilik boş array
    setOrders([]);
    setFilteredOrders([]);
  }, [authenticatedRestaurant]);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...orders];

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tarih filtresi
    if (dateFilter === 'today') {
      // Bugünkü siparişler (demo için tümü)
      filtered = filtered;
    } else if (dateFilter === 'yesterday') {
      // Dünkü siparişler (demo için boş)
      filtered = [];
    } else if (dateFilter === 'week') {
      // Bu hafta (demo için tümü)
      filtered = filtered;
    }

    // Arama
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toString().includes(searchTerm) ||
        order.items.some((item: any) => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        case 'table':
          return a.tableNumber - b.tableNumber;
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'waitTime':
          return b.waitTime - a.waitTime;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateFilter, searchTerm, sortBy]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-300';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'delivered': return 'Teslim Edildi';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'normal': return 'border-gray-200';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    avgOrderValue: orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.totalAmount, 0) / orders.length) : 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{authenticatedRestaurant?.name || authenticatedStaff?.name}</h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">Yönetim Paneli</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <nav className="mt-4 sm:mt-6">
          <Link href="/business/dashboard" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaChartLine className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Kontrol Paneli</span>
          </Link>
          <Link href="/business/orders" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 bg-purple-700 bg-opacity-50 border-l-4 border-white rounded-r-lg mx-2 sm:mx-0">
            <FaShoppingCart className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Siparişler</span>
          </Link>
          <Link href="/business/menu" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaUtensils className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Menü</span>
          </Link>
          <Link href="/kitchen" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaUtensils className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Mutfak</span>
          </Link>
          <Link href="/business/cashier" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaMoneyBillWave className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Kasa</span>
          </Link>
          <Link href="/business/staff" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaUsers className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Personel</span>
          </Link>
          <Link href="/business/qr-codes" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaQrcode className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">QR Kodlar</span>
          </Link>
          <Link href="/business/reports" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaChartBar className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Raporlar</span>
          </Link>
          <Link href="/business/settings" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaCog className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Ayarlar</span>
          </Link>
          <Link href="/business/support" className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-purple-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaHeadset className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Destek</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border-t border-purple-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{authenticatedRestaurant?.name || authenticatedStaff?.name}</p>
                <p className="text-xs text-purple-300">{authenticatedRestaurant?.email || authenticatedStaff?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-purple-700 rounded-lg"
                title="Çıkış Yap"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBars className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">Siparişler</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Tüm siparişleri görüntüleyin ve yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <button className="px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FaDownload className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Rapor İndir</span>
                <span className="sm:hidden">Rapor</span>
              </button>
              <button className="px-2 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FaPrint className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Yazdır</span>
                <span className="sm:hidden">Yazdır</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-6 lg:p-8">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaShoppingCart className="text-xl text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">Toplam</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
              <p className="text-sm text-gray-500 mt-1">Sipariş</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="text-xl text-yellow-600" />
                </div>
                <span className="text-sm text-yellow-600 font-medium">Hazırlanıyor</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.preparing}</h3>
              <p className="text-sm text-gray-500 mt-1">Sipariş</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCheckCircle className="text-xl text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">Hazır</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.ready}</h3>
              <p className="text-sm text-gray-500 mt-1">Sipariş</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FaCheckCircle className="text-xl text-gray-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Tamamlandı</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.completed}</h3>
              <p className="text-sm text-gray-500 mt-1">Sipariş</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaMoneyBillWave className="text-xl text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-medium">Toplam Ciro</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">₺{stats.totalRevenue}</h3>
              <p className="text-sm text-gray-500 mt-1">Bugün</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaChartLine className="text-xl text-orange-600" />
                </div>
                <span className="text-sm text-orange-600 font-medium">Ortalama</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">₺{stats.avgOrderValue}</h3>
              <p className="text-sm text-gray-500 mt-1">Sipariş Değeri</p>
            </div>
          </div>

          {/* Filtreler ve Arama */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Arama */}
              <div className="lg:col-span-2 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Müşteri adı, masa no veya ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Durum Filtresi */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Bekliyor</option>
                  <option value="preparing">Hazırlanıyor</option>
                  <option value="ready">Hazır</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              {/* Tarih Filtresi */}
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="today">Bugün</option>
                  <option value="yesterday">Dün</option>
                  <option value="week">Bu Hafta</option>
                  <option value="month">Bu Ay</option>
                </select>
              </div>

              {/* Sıralama */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="table">Masa No</option>
                  <option value="amount">Tutar</option>
                  <option value="waitTime">Bekleme Süresi</option>
                </select>
              </div>
            </div>
          </div>


          {/* Sipariş Listesi */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Siparişler ({filteredOrders.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${getPriorityColor(order.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-purple-600">{order.tableNumber}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Masa {order.tableNumber} - {order.customerName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {order.orderTime} • {order.items.length} ürün • ₺{order.totalAmount}
                        </p>
                        {order.notes && (
                          <p className="text-sm text-purple-600 italic mt-1">
                            Not: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.waitTime} dk bekleme
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.calls.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FaBell className="text-red-500 animate-pulse" />
                            <span className="text-sm text-red-600 font-medium">
                              {order.calls.length} çağrı
                            </span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ürünler */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">
                          {item.quantity}x {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">₺{item.price}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'ready' ? 'bg-green-100 text-green-700' :
                            item.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status === 'ready' ? 'Hazır' :
                             item.status === 'delivered' ? 'Teslim' : 'Hazırlanıyor'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Sipariş bulunamadı</p>
                <p className="text-gray-400 text-sm mt-2">Filtreleri değiştirerek tekrar deneyin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sipariş Detay Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Sipariş Detayları</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sipariş Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Sipariş Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Masa No</p>
                      <p className="font-medium">{selectedOrder.tableNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sipariş Zamanı</p>
                      <p className="font-medium">{selectedOrder.orderTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Müşteri</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Toplam Tutar</p>
                      <p className="font-bold text-purple-600">₺{selectedOrder.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Ürünler */}
                <div>
                  <h4 className="font-semibold mb-3">Sipariş Edilen Ürünler</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                        <div>
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          <p className="text-sm text-gray-500">₺{item.price} adet</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₺{item.quantity * item.price}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'ready' ? 'bg-green-100 text-green-700' :
                            item.status === 'delivered' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status === 'ready' ? 'Hazır' :
                             item.status === 'delivered' ? 'Teslim' : 'Hazırlanıyor'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notlar */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-semibold mb-3">Özel Notlar</h4>
                    <p className="text-gray-700 italic bg-yellow-50 p-3 rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Çağrılar */}
                {selectedOrder.calls.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700">Aktif Çağrılar</h4>
                    <div className="space-y-2">
                      {selectedOrder.calls.map((call: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <FaBell className="text-red-500 animate-pulse" />
                          <span className="text-red-800 font-medium">
                            {call === 'waiter' && 'Garson çağrısı'}
                            {call === 'water' && 'Su isteniyor'}
                            {call === 'bill' && 'Hesap isteniyor'}
                            {call === 'clean' && 'Masa temizleme isteniyor'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



