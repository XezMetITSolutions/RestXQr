'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  FaStore,
  FaCheckCircle,
  FaDatabase,
  FaChartLine
} from 'react-icons/fa';

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalTables: number;
  recentRestaurants: Array<{
    id: string;
    name: string;
    subdomain: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalTables: 0,
    recentRestaurants: []
  });
  const [loading, setLoading] = useState(true);

  // API URL'i normalize et
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
  const API_URL = (rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`)
    .replace(/\/+$/, '')
    .concat(rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') ? '' : '/api');

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    const accessToken = localStorage.getItem('admin_access_token');

    if (!adminUser || !accessToken) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData(accessToken);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Dashboard stats response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats data:', data);
        if (data.success) {
          setStats({
            totalRestaurants: data.totalRestaurants || 0,
            activeRestaurants: data.activeRestaurants || 0,
            totalTables: data.totalTables || 0,
            recentRestaurants: data.recentRestaurants || []
          });
        }
      } else {
        console.error('Dashboard stats failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Süper Yönetici Paneli" description="Sistem genel bakış ve istatistikler">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Toplam Restoran</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalRestaurants}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FaStore className="text-white text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Aktif Restoranlar</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.activeRestaurants}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Toplam Masa</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalTables}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <FaDatabase className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Son Eklenen Restoranlar</h3>
              <button
                onClick={() => router.push('/admin/restaurants')}
                className="text-blue-600 text-sm hover:underline font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            {stats.recentRestaurants.length > 0 ? (
              <div className="space-y-4">
                {stats.recentRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <FaStore className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{restaurant.name}</p>
                        <p className="text-sm text-gray-500">{restaurant.subdomain}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold ${restaurant.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                      {restaurant.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaStore className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>Henüz restoran eklenmemiş</p>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
