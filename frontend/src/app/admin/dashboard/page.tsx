'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaStore, 
  FaUsers, 
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaDatabase
} from 'react-icons/fa';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

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
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalTables: 0,
    recentRestaurants: []
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    const accessToken = localStorage.getItem('admin_access_token');
    
    if (!adminUser || !accessToken) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      fetchDashboardData(accessToken);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('https://masapp-backend.onrender.com/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold">RestXQr Admin</h1>
          <p className="text-blue-200 text-sm mt-1">Sistem Yönetimi</p>
        </div>

        <nav className="mt-6">
          <Link href="/admin/dashboard" className="flex items-center px-6 py-3 bg-blue-700 bg-opacity-50 border-l-4 border-white">
            <FaChartLine className="mr-3" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/restaurants" className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors">
            <FaStore className="mr-3" />
            <span className="font-medium">Restoranlar</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 hover:bg-blue-700 transition-colors">
            <FaCog className="mr-3" />
            <span className="font-medium">Ayarlar</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border-t border-blue-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-200">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-blue-700 rounded-lg">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-0 lg:ml-64">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaChartLine className="text-lg text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Sistem Genel Bakış</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <FaBell />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Yükleniyor...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Toplam Restoran</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalRestaurants}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaStore className="text-blue-600 text-2xl" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Aktif Restoranlar</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeRestaurants}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FaCheckCircle className="text-green-600 text-2xl" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Toplam Masa</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTables}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FaDatabase className="text-purple-600 text-2xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Son Eklenen Restoranlar</h3>
                  <Link href="/admin/restaurants" className="text-blue-600 text-sm hover:underline">
                    Tümünü Gör
                  </Link>
                </div>
                {stats.recentRestaurants.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FaStore className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{restaurant.name}</p>
                            <p className="text-sm text-gray-500">{restaurant.subdomain}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          restaurant.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {restaurant.status === 'active' ? 'Aktif' : 'Beklemede'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Henüz restoran eklenmemiş
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
