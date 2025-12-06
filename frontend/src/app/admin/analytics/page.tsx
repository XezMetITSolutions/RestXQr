'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaChartLine, 
  FaDownload,
  FaSync,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaArrowUp
} from 'react-icons/fa';

export default function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadAnalytics();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analitik veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Analitik" description="Sistem analitikleri ve raporları">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analitik & Raporlar</h1>
              <p className="text-gray-600 mt-1">İşletme performansını ve trendleri analiz edin</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
                <option value="1y">Son 1 Yıl</option>
              </select>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaSync className="mr-2" />
                Yenile
              </button>
              <button 
                onClick={() => alert('Rapor oluşturuluyor...')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
              >
                <FaDownload className="mr-2" />
                Rapor İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam İşletme</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-gray-500">1,189 aktif</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">3,421</p>
                <p className="text-xs text-gray-500">Aktif kullanıcılar</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺2,847,390</p>
                <p className="text-xs text-gray-500">Bu ay: ₺189,650</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <FaChartLine className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Büyüme Oranı</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">12.5%</p>
                  <FaArrowUp className="ml-2 text-green-600" />
                </div>
                <p className="text-xs text-gray-500">Geçen aya göre</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gelir Trendi</h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FaChartLine className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gelir grafiği burada görüntülenecek</p>
                <p className="text-sm text-gray-400">Chart.js entegrasyonu gerekli</p>
              </div>
            </div>
          </div>

          {/* Restaurant Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İşletme Durumu</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                  <span className="text-sm text-gray-700">Aktif</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1,189</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Beklemede</span>
                </div>
                <span className="text-sm font-medium text-gray-900">23</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-orange-500"></div>
                  <span className="text-sm text-gray-700">Askıya Alınmış</span>
                </div>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-red-500"></div>
                  <span className="text-sm text-gray-700">İptal Edilmiş</span>
                </div>
                <span className="text-sm font-medium text-gray-900">23</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performing Restaurants */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">En İyi Performans</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Pizza Palace</div>
                  <div className="text-xs text-gray-500">1,234 sipariş</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">₺45,678</div>
                  <div className="text-xs text-gray-500">Gelir</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Burger King</div>
                  <div className="text-xs text-gray-500">987 sipariş</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">₺38,945</div>
                  <div className="text-xs text-gray-500">Gelir</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Sushi Master</div>
                  <div className="text-xs text-gray-500">756 sipariş</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">₺34,567</div>
                  <div className="text-xs text-gray-500">Gelir</div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Kod Analizi</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">456,789</div>
                <div className="text-sm text-gray-500">Toplam Tarama</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Mobil</span>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Masaüstü</span>
                  <span className="text-sm font-medium text-gray-900">25%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Menü Analizi</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">1,247</div>
                  <div className="text-xs text-gray-500">Toplam Menü</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15,678</div>
                  <div className="text-xs text-gray-500">Toplam Ürün</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">12.6</div>
                <div className="text-sm text-gray-500">Ortalama Ürün/Menü</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

