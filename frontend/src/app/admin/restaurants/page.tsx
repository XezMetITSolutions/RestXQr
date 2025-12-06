'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaPlus, 
  FaSearch, 
  FaGlobe,
  FaCrown,
  FaUsers,
  FaUtensils,
  FaQrcode,
  FaEdit,
  FaTrash,
  FaEye,
  FaChartLine,
  FaLock
} from 'react-icons/fa';

interface Restaurant {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  maxTables: number;
  maxMenuItems: number;
  maxStaff: number;
  isActive: boolean;
  createdAt: string;
}

export default function RestaurantsManagement() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Restoranları yükle
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/restaurants`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setRestaurants(data.data);
      }
    } catch (error) {
      console.error('Restoranlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Arama filtresi
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Plan badge rengi
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'enterprise':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return plan;
    }
  };

  return (
    <AdminLayout title="Restoran Yönetimi">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restoran Yönetimi</h1>
            <p className="text-gray-600 mt-1">Tüm restoranları görüntüleyin ve yönetin</p>
          </div>
          <button
            onClick={() => router.push('/admin/restaurants/create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaPlus />
            <span className="font-semibold">Yeni Restoran</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Toplam Restoran</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{restaurants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <FaUtensils className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Aktif</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {restaurants.filter(r => r.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Premium</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {restaurants.filter(r => r.subscriptionPlan === 'premium').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <FaCrown className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Enterprise</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {restaurants.filter(r => r.subscriptionPlan === 'enterprise').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FaCrown className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Restoran ara... (isim, subdomain, email)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Restaurant Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Restoranlar yükleniyor...</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Restoran bulunamadı' : 'Henüz restoran yok'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Arama kriterlerinizi değiştirin' : 'Yeni bir restoran ekleyin'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden group"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-blue-100">
                      <FaGlobe className="text-sm" />
                      <span className="text-sm font-medium">{restaurant.username}.restxqr.com</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getPlanBadge(restaurant.subscriptionPlan)}`}>
                    {getPlanName(restaurant.subscriptionPlan)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="mr-2 text-gray-400" />
                    <span>Email: {restaurant.email}</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="mr-2 text-gray-400" />
                      <span>Tel: {restaurant.phone}</span>
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <FaQrcode className="text-blue-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Masa</div>
                    <div className="text-lg font-bold text-gray-900">{restaurant.maxTables}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <FaUtensils className="text-purple-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Menü</div>
                    <div className="text-lg font-bold text-gray-900">{restaurant.maxMenuItems}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <FaUsers className="text-green-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-600">Personel</div>
                    <div className="text-lg font-bold text-gray-900">{restaurant.maxStaff}</div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Durum:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    restaurant.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {restaurant.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://${restaurant.username}.restxqr.com`, '_blank')}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FaEye />
                      Görüntüle
                    </button>
                    <button
                      onClick={() => router.push(`/admin/restaurants/${restaurant.id}/edit`)}
                      className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FaEdit />
                      Düzenle
                    </button>
                  </div>
                  <button
                    onClick={() => window.open(`https://${restaurant.username}.restxqr.com/isletme-giris?superadmin=true`, '_blank')}
                    className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 font-bold shadow-md"
                    title="Süper Admin olarak bu restoranın paneline giriş yap"
                  >
                    <FaLock />
                    🔐 Süper Admin Girişi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
