'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaStore, 
  FaUsers, 
  FaQrcode, 
  FaChartLine,
  FaCog,
  FaCreditCard,
  FaSignOutAlt,
  FaPlus,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { restaurants } = useRestaurantStore();
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Güvenli kullanıcı kontrolü
    const checkAuth = async () => {
      const { checkAuth: authCheck, isAdmin } = useAuthStore.getState();
      const isValid = await authCheck();
      
      if (!isValid || !isAdmin()) {
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">MasApp Admin</h1>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">Sistem Yönetimi</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>

        <nav className="mt-4 sm:mt-6">
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 bg-blue-700 bg-opacity-50 border-l-4 border-white rounded-r-lg mx-2 sm:mx-0">
            <FaChartLine className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/restaurants" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaStore className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Restoranlar</span>
          </Link>
          <Link href="/admin/qr-management" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaQrcode className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">QR Yönetimi</span>
          </Link>
          <Link href="/admin/users" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaUsers className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Kullanıcılar</span>
          </Link>
          <Link href="/admin/payment" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaCreditCard className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Ödeme & Abonelik</span>
          </Link>
          <Link href="/admin/settings" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 sm:py-3 hover:bg-blue-700 hover:bg-opacity-50 transition-colors rounded-r-lg mx-2 sm:mx-0">
            <FaCog className="mr-2 sm:mr-3 text-sm sm:text-base" />
            <span className="text-sm sm:text-base font-medium">Ayarlar</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="border-t border-blue-700 pt-3 sm:pt-4">
            <div className="flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-200">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                <FaSignOutAlt className="text-sm sm:text-base" />
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
                <FaChartLine className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">Dashboard</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Sistem Yönetimi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <FaBell className="text-sm sm:text-base" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-3 sm:p-6 lg:p-8">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Toplam Restoran</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">24</p>
                  <p className="text-xs text-green-600 mt-2">↑ 12% bu ay</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                  <FaStore className="text-blue-600 text-lg sm:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Aktif Restoranlar</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">21</p>
                  <p className="text-xs text-gray-500 mt-2">%87.5 aktif</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                  <FaCheckCircle className="text-green-600 text-lg sm:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Toplam Sipariş</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">1,842</p>
                  <p className="text-xs text-green-600 mt-2">↑ 23% bu hafta</p>
                </div>
                <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                  <FaChartLine className="text-purple-600 text-lg sm:text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Aylık Gelir</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">₺124K</p>
                  <p className="text-xs text-green-600 mt-2">↑ 18% geçen aya göre</p>
                </div>
                <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
                  <FaChartLine className="text-orange-600 text-lg sm:text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <Link href="/admin/restaurants/add" className="flex flex-col items-center p-2 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                <div className="bg-blue-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaPlus className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Restoran Ekle</span>
              </Link>
              
              <Link href="/admin/qr-management/generate" className="flex flex-col items-center p-2 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                <div className="bg-green-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaQrcode className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">QR Oluştur</span>
              </Link>
              
              <Link href="/admin/users/add" className="flex flex-col items-center p-2 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                <div className="bg-purple-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaUsers className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Kullanıcı Ekle</span>
              </Link>
              
              <Link href="/admin/reports" className="flex flex-col items-center p-2 sm:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group">
                <div className="bg-orange-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Raporlar</span>
              </Link>
            </div>
            
            {/* İkinci Satır - Ek Hızlı İşlemler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4">
              <Link href="/admin/notifications" className="flex flex-col items-center p-2 sm:p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group">
                <div className="bg-yellow-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaBell className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Bildirimler</span>
              </Link>
              
              <Link href="/admin/settings" className="flex flex-col items-center p-2 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className="bg-gray-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaCog className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Ayarlar</span>
              </Link>
              
              <Link href="/admin/payment" className="flex flex-col items-center p-2 sm:p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group">
                <div className="bg-indigo-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaCreditCard className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Ödeme</span>
              </Link>
              
              <Link href="/admin/logs" className="flex flex-col items-center p-2 sm:p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group">
                <div className="bg-red-600 p-2 sm:p-3 rounded-full text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  <FaExclamationCircle className="text-sm sm:text-base" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 text-center font-medium">Loglar</span>
              </Link>
            </div>
          </div>

          {/* Son Restoranlar ve Aktiviteler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Son Eklenen Restoranlar */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Son Eklenen Restoranlar</h3>
                <Link href="/admin/restaurants" className="text-blue-600 text-sm hover:underline">
                  Tümünü Gör
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaStore className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Lezzet Durağı</p>
                      <p className="text-xs text-gray-500">2 saat önce eklendi</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaStore className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Deniz Restaurant</p>
                      <p className="text-xs text-gray-500">5 saat önce eklendi</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaStore className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Köfte Evi</p>
                      <p className="text-xs text-gray-500">1 gün önce eklendi</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Beklemede</span>
                </div>
              </div>
            </div>

            {/* Son Aktiviteler */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Son Aktiviteler</h3>
                <Link href="/admin/logs" className="text-blue-600 text-sm hover:underline">
                  Tümünü Gör
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FaCheckCircle className="text-green-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Yeni QR kodları oluşturuldu</p>
                    <p className="text-xs text-gray-500">Lezzet Durağı - 10 masa</p>
                    <p className="text-xs text-gray-400 mt-1">15 dakika önce</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaUsers className="text-blue-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Yeni kullanıcı eklendi</p>
                    <p className="text-xs text-gray-500">Ahmet Yılmaz - Garson</p>
                    <p className="text-xs text-gray-400 mt-1">1 saat önce</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    <FaClock className="text-orange-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Abonelik yenilendi</p>
                    <p className="text-xs text-gray-500">Deniz Restaurant - Premium Plan</p>
                    <p className="text-xs text-gray-400 mt-1">3 saat önce</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <FaExclamationCircle className="text-red-600 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Ödeme hatası</p>
                    <p className="text-xs text-gray-500">Köfte Evi - Abonelik ödemesi başarısız</p>
                    <p className="text-xs text-gray-400 mt-1">5 saat önce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
