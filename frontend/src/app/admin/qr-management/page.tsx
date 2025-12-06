'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaQrcode, 
  FaStore,
  FaSearch,
  FaEye,
  FaChartBar
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';

export default function QRManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Demo restoranlar ve QR kod sayıları
  const restaurantQRStats = [
    { 
      id: 'rest_1', 
      name: 'Lezzet Durağı', 
      subdomain: 'lezzet-duragi',
      qrCount: 15,
      activeQR: 12,
      inactiveQR: 3,
      lastUpdated: '2024-01-15'
    },
    { 
      id: 'rest_2', 
      name: 'Deniz Restaurant', 
      subdomain: 'deniz-restaurant',
      qrCount: 8,
      activeQR: 8,
      inactiveQR: 0,
      lastUpdated: '2024-01-14'
    },
    { 
      id: 'rest_3', 
      name: 'Köfte Evi', 
      subdomain: 'kofte-evi',
      qrCount: 22,
      activeQR: 20,
      inactiveQR: 2,
      lastUpdated: '2024-01-16'
    },
    { 
      id: 'rest_4', 
      name: 'Pizza Palace', 
      subdomain: 'pizza-palace',
      qrCount: 6,
      activeQR: 6,
      inactiveQR: 0,
      lastUpdated: '2024-01-13'
    },
    { 
      id: 'rest_5', 
      name: 'Cafe Central', 
      subdomain: 'cafe-central',
      qrCount: 10,
      activeQR: 9,
      inactiveQR: 1,
      lastUpdated: '2024-01-12'
    }
  ];

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      router.push('/admin/login');
    }
  }, [user, router]);

  const filteredRestaurants = restaurantQRStats.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQRCodes = restaurantQRStats.reduce((sum, restaurant) => sum + restaurant.qrCount, 0);
  const totalActiveQR = restaurantQRStats.reduce((sum, restaurant) => sum + restaurant.activeQR, 0);
  const totalInactiveQR = restaurantQRStats.reduce((sum, restaurant) => sum + restaurant.inactiveQR, 0);

  return (
    <AdminLayout title="QR Kod Yönetimi" description="İşletme bazında QR kod istatistikleri">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          QR Kod Yönetimi
        </h1>
        <p className="text-gray-600 text-lg">İşletme bazında QR kod istatistikleri ve durumu</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Toplam QR Kod</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {totalQRCodes}
              </p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <FaQrcode className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Aktif QR Kod</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {totalActiveQR}
              </p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <FaChartBar className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pasif QR Kod</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {totalInactiveQR}
              </p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <FaStore className="text-2xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="İşletme adı veya subdomain ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      {/* İşletme Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaStore className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{restaurant.subdomain}.restxqr.com</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaEye className="text-gray-400 hover:text-blue-600" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{restaurant.qrCount}</p>
                <p className="text-xs text-gray-500">Toplam</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{restaurant.activeQR}</p>
                <p className="text-xs text-gray-500">Aktif</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{restaurant.inactiveQR}</p>
                <p className="text-xs text-gray-500">Pasif</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Son güncelleme: {restaurant.lastUpdated}</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${restaurant.inactiveQR === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>{restaurant.inactiveQR === 0 ? 'Tam Aktif' : 'Kısmi Aktif'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">İşletme bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinize uygun işletme bulunmuyor.</p>
        </div>
      )}
    </AdminLayout>
  );
}
