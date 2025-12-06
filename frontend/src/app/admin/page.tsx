'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaChartBar, 
  FaUsers, 
  FaBuilding, 
  FaBell,
  FaCreditCard,
  FaExclamationTriangle,
  FaUserCheck,
  FaShieldAlt,
  FaChartLine,
  FaCog,
  FaQrcode,
  FaFileAlt,
  FaCogs,
  FaDatabase,
  FaLock,
  FaChartPie,
  FaGlobe
} from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function SuperAdminDashboard() {
  const { restaurants, fetchRestaurants } = useRestaurantStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchRestaurants();
      } catch (error) {
        console.error('Dashboard data loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchRestaurants]);

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const totalUsers = restaurants.length; // Restaurant owners as users
  const monthlyRevenue = 0; // TODO: Calculate from orders

  return (
    <AdminLayout title="Süper Yönetici Paneli" description="Sistem genel durumu ve yönetim paneli">
      {/* System Status */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-4 animate-pulse"></div>
          <span className="text-emerald-800 font-bold text-lg">Sistem: Online</span>
          <div className="ml-auto">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Toplam Restoran</p>
                <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{isLoading ? '...' : totalRestaurants}</h3>
                <p className="text-sm text-gray-500 mt-2">{totalRestaurants > 0 ? `${totalRestaurants} restoran kayıtlı` : 'Henüz veri yok'}</p>
              </div>
              <div className="h-20 w-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaBuilding className="text-3xl text-blue-600" />
              </div>
            </div>
          </div>
            
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Aktif Restoran</p>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{isLoading ? '...' : activeRestaurants}</h3>
                  <p className="text-sm text-gray-500 mt-2">{activeRestaurants > 0 ? `${activeRestaurants} aktif restoran` : 'Henüz veri yok'}</p>
                </div>
                <div className="h-20 w-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartBar className="text-3xl text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Toplam Kullanıcı</p>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{isLoading ? '...' : totalUsers}</h3>
                  <p className="text-sm text-gray-500 mt-2">{totalUsers > 0 ? `${totalUsers} kullanıcı` : 'Henüz veri yok'}</p>
                </div>
                <div className="h-20 w-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-3xl text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Aylık Gelir</p>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">₺{isLoading ? '...' : monthlyRevenue.toLocaleString()}</h3>
                  <p className="text-sm text-gray-500 mt-2">{monthlyRevenue > 0 ? 'Bu ay toplam gelir' : 'Henüz veri yok'}</p>
                </div>
                <div className="h-20 w-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-3xl text-amber-600" />
                </div>
              </div>
            </div>
          </div>

        {/* Hızlı Eylemler */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Hızlı Eylemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/restaurants/add" className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaBuilding className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Restoran Ekle</h3>
              <p className="text-sm text-gray-600">Yeni restoran kaydı</p>
            </Link>
            
            <Link href="/admin/users" className="group p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaUsers className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Kullanıcı Yönet</h3>
              <p className="text-sm text-gray-600">Kullanıcı hesapları</p>
            </Link>
            
            <Link href="/admin/notifications" className="group p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaBell className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Bildirim Gönder</h3>
              <p className="text-sm text-gray-600">Toplu bildirim</p>
            </Link>
            
            <Link href="/admin/system" className="group p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaCog className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Sistem Ayarları</h3>
              <p className="text-sm text-gray-600">Genel ayarlar</p>
            </Link>
            
            <Link href="/admin/qr-management/generate" className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaQrcode className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">QR Oluştur</h3>
              <p className="text-sm text-gray-600">QR kod üretimi</p>
            </Link>
            
            <Link href="/admin/subscriptions" className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaChartLine className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Raporlar</h3>
              <p className="text-sm text-gray-600">Sistem raporları</p>
            </Link>
            
            <Link href="/admin/payment-errors" className="group p-6 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaExclamationTriangle className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ödeme Hataları</h3>
              <p className="text-sm text-gray-600">Hata takibi</p>
            </Link>
            
            <Link href="/admin/system" className="group p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-left">
              <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Güvenlik</h3>
              <p className="text-sm text-gray-600">Güvenlik ayarları</p>
            </Link>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Son Aktiviteler</h2>
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaChartBar className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz aktivite bulunmuyor</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Sistem kullanılmaya başlandığında aktiviteler burada görünecek
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
