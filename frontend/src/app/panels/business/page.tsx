'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBuilding,
  FaChartLine,
  FaUsers,
  FaUtensils,
  FaDollarSign,
  FaShoppingCart,
  FaQrcode,
  FaArrowLeft,
  FaHome,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaPlus,
  FaBell,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaPercent,
  FaStore,
  FaClipboardList,
  FaCog,
  FaHeadset,
  FaBullhorn,
  FaBars,
  FaChartBar
} from 'react-icons/fa';

export default function DemoBusinessPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  
  // Form states
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null
  });
  
  const [staffMember, setStaffMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter'
  });

  // Demo işletme verileri - gerçekçi veriler
  const demoStats = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    activeTables: 0,
    totalCustomers: 0,
    menuItems: 0,
    categories: 0,
    activeOrders: [],
    popularItems: [],
    monthlyRevenue: 0,
    monthlyOrders: 0,
    averageRating: '-',
    customerSatisfaction: '-'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/panels" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FaArrowLeft />
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                <FaUtensils size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MasApp</h1>
                <p className="text-gray-600 text-sm">Demo Restoran - Yönetim Paneli</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FaHome />
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">info@masapp.com</p>
              <p className="text-xs text-gray-500">Demo Versiyonu</p>
            </div>
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

      {/* Sidebar ve Ana İçerik */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-purple-800 min-h-screen">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Demo Paneli</h2>
              <p className="text-purple-200 text-sm">Yönetim Paneli</p>
            </div>
            <nav className="space-y-3">
              <button 
                onClick={() => setActiveMenu('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'dashboard' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaChartLine className="text-xl" />
                <span className="font-medium">Kontrol Paneli</span>
              </button>
              <button 
                onClick={() => setActiveMenu('menu')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'menu' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaUtensils className="text-xl" />
                <span className="font-medium">Menü Yönetimi</span>
              </button>
              <button 
                onClick={() => setActiveMenu('staff')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'staff' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaUsers className="text-xl" />
                <span className="font-medium">Personel</span>
              </button>
              <button 
                onClick={() => setActiveMenu('qr')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'qr' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaQrcode className="text-xl" />
                <span className="font-medium">QR Kodlar</span>
              </button>
              <button 
                onClick={() => setActiveMenu('reports')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'reports' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaChartBar className="text-xl" />
                <span className="font-medium">Raporlar</span>
              </button>
              <button 
                onClick={() => setActiveMenu('settings')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'settings' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaCog className="text-xl" />
                <span className="font-medium">Ayarlar</span>
              </button>
              <button 
                onClick={() => setActiveMenu('support')}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === 'support' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-white hover:bg-purple-700'
                }`}
              >
                <FaHeadset className="text-xl" />
                <span className="font-medium">Destek</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 p-6">
          {/* Hoş Geldin Bölümü */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeMenu === 'dashboard' && 'Hoş geldiniz, Kullanıcı 👋'}
              {activeMenu === 'menu' && 'Menü Yönetimi 🍽️'}
              {activeMenu === 'staff' && 'Personel Yönetimi 👥'}
              {activeMenu === 'qr' && 'QR Kod Yönetimi 📱'}
              {activeMenu === 'reports' && 'Raporlar 📊'}
              {activeMenu === 'settings' && 'Ayarlar ⚙️'}
              {activeMenu === 'support' && 'Destek 🎧'}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Premium Plan
              </span>
              <span className="text-2xl">P</span>
            </div>
          </div>

          {/* Dashboard İçeriği */}
          {activeMenu === 'dashboard' && (
            <>
              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bugünkü Siparişler</p>
                      <p className="text-2xl font-bold text-gray-800">{demoStats.totalOrders}</p>
                    </div>
                    <FaShoppingCart className="text-3xl text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bugünkü Ciro</p>
                      <p className="text-2xl font-bold text-gray-800">₺{demoStats.totalRevenue}</p>
                    </div>
                    <FaDollarSign className="text-3xl text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Menü Ürünleri</p>
                      <p className="text-2xl font-bold text-gray-800">{demoStats.menuItems}</p>
                      <p className="text-xs text-gray-500">{demoStats.categories} kategori</p>
                    </div>
                    <FaUtensils className="text-3xl text-orange-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Toplam Masa</p>
                      <p className="text-2xl font-bold text-gray-800">{demoStats.activeTables}</p>
                      <p className="text-xs text-gray-500">0 aktif</p>
                    </div>
                    <FaBuilding className="text-3xl text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Alt Bölümler */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Aktif Siparişler */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Aktif Siparişler</h3>
                      <button className="text-blue-600 text-sm hover:text-blue-800">
                        Tümünü Gör →
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <FaShoppingCart className="text-4xl mx-auto mb-3 text-gray-300" />
                      <p>Henüz aktif sipariş bulunmuyor</p>
                    </div>
                  </div>
                </div>

                {/* Hızlı İşlemler */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Hızlı İşlemler</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => alert('Demo: Yeni ürün ekleme formu açılacak')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaPlus className="text-blue-600" />
                        <span className="text-sm font-medium">Yeni Ürün</span>
                      </button>
                      <button 
                        onClick={() => alert('Demo: Siparişler sayfasına yönlendirilecek')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaEye className="text-green-600" />
                        <span className="text-sm font-medium">Siparişleri Gör</span>
                      </button>
                      <button 
                        onClick={() => setActiveMenu('menu')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaEdit className="text-orange-600" />
                        <span className="text-sm font-medium">Menüyü Düzenle</span>
                      </button>
                      <button 
                        onClick={() => alert('Demo: Duyuru oluşturma formu açılacak')}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaBullhorn className="text-purple-600" />
                        <span className="text-sm font-medium">Duyurular</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aylık Performans */}
              <div className="mt-8 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Aylık Performans</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <FaChartLine className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p className="mb-4">Henüz veri bulunmuyor</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">₺{demoStats.monthlyRevenue}</p>
                      <p className="text-sm text-gray-600">Aylık Ciro</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{demoStats.monthlyOrders}</p>
                      <p className="text-sm text-gray-600">Toplam Sipariş</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{demoStats.averageRating}</p>
                      <p className="text-sm text-gray-600">Ortalama Puan</p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">{demoStats.customerSatisfaction}</p>
                    <p className="text-sm text-gray-600">Müşteri Memnuniyeti</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Menü Yönetimi İçeriği */}
          {activeMenu === 'menu' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Menü Ürünleri</h2>
                <button 
                  onClick={() => alert('Demo: Yeni ürün ekleme formu açılacak')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus />
                  Yeni Ürün Ekle
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FaUtensils className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Henüz menü ürünü bulunmuyor</p>
                <p className="text-sm">İlk ürününüzü ekleyerek başlayın</p>
              </div>
            </div>
          )}

          {/* Personel Yönetimi İçeriği */}
          {activeMenu === 'staff' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Personel Listesi</h2>
                <button 
                  onClick={() => alert('Demo: Yeni personel ekleme formu açılacak')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus />
                  Yeni Personel Ekle
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FaUsers className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Henüz personel bulunmuyor</p>
                <p className="text-sm">İlk personelinizi ekleyerek başlayın</p>
              </div>
            </div>
          )}

          {/* QR Kod Yönetimi İçeriği */}
          {activeMenu === 'qr' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">QR Kodlar</h2>
                <button 
                  onClick={() => alert('Demo: QR kod oluşturma formu açılacak')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FaPlus />
                  QR Kod Oluştur
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FaQrcode className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Henüz QR kod bulunmuyor</p>
                <p className="text-sm">Masa QR kodlarını oluşturun</p>
              </div>
            </div>
          )}

          {/* Raporlar İçeriği */}
          {activeMenu === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Satış Raporları</h2>
                <button 
                  onClick={() => alert('Demo: Rapor oluşturma formu açılacak')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <FaChartBar />
                  Rapor Oluştur
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FaChartLine className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">Henüz rapor verisi bulunmuyor</p>
                <p className="text-sm">Satış verileriniz raporlarda görünecek</p>
              </div>
            </div>
          )}

          {/* Ayarlar İçeriği */}
          {activeMenu === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Genel Ayarlar</h2>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Restoran Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Restoran Adı</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Demo Restoran" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Telefon</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+90 555 123 4567" />
                    </div>
                  </div>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Tema Ayarları</h3>
                  <div className="flex gap-3">
                    <button className="w-12 h-12 bg-blue-600 rounded-lg border-2 border-blue-600"></button>
                    <button className="w-12 h-12 bg-green-600 rounded-lg border-2 border-gray-300"></button>
                    <button className="w-12 h-12 bg-purple-600 rounded-lg border-2 border-gray-300"></button>
                    <button className="w-12 h-12 bg-orange-600 rounded-lg border-2 border-gray-300"></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Destek İçeriği */}
          {activeMenu === 'support' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Destek Merkezi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <FaHeadset className="text-3xl text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Canlı Destek</h3>
                  <p className="text-gray-600 mb-4">7/24 canlı destek hattımızla iletişime geçin</p>
                  <button 
                    onClick={() => alert('Demo: Canlı destek sohbeti başlatılacak')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Sohbet Başlat
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <FaBell className="text-3xl text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Destek Talebi</h3>
                  <p className="text-gray-600 mb-4">Sorununuzu detaylı olarak bildirin</p>
                  <button 
                    onClick={() => alert('Demo: Destek talebi formu açılacak')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Talep Oluştur
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}