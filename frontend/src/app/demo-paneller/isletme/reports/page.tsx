'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaStore, 
  FaUtensils, 
  FaUsers, 
  FaShoppingCart,
  FaChartLine,
  FaChartBar,
  FaQrcode,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useFeature } from '@/hooks/useFeature';

export default function ReportsPage() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  
  // Feature kontrolü
  const hasBasicReports = useFeature('basic_reports');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');
  
  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';
  const displayEmail = authenticatedRestaurant?.email || authenticatedStaff?.email || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'revenue' | 'hours'>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Feature kontrolü - erişim yok sayfası göster
  if (!hasBasicReports && !hasAdvancedAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />
        <div className="ml-0 lg:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Erişim Yok</h1>
            <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
            <p className="text-sm text-gray-500 mb-6">Raporlama özelliğine erişmek için lütfen yöneticinizle iletişime geçin.</p>
            <button
              onClick={() => router.push('/business/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Kontrol Paneline Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SheetJS yükleyici (UMD)
  const loadXLSX = () => {
    return new Promise<any>((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).XLSX) {
        resolve((window as any).XLSX);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => resolve((window as any).XLSX);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Excel indirme (gerçek .xlsx)
  const handleExcelExport = async () => {
    const XLSX: any = await loadXLSX();
    const wb = XLSX.utils.book_new();
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (activeTab === 'overview') {
      const rows = [
        ['Metrik', 'Değer'],
        ['Bugünkü Ciro (TRY)', currentDailyReport.totalSales],
        ['Toplam Sipariş', currentDailyReport.totalOrders],
        ['Ortalama Sipariş (TRY)', currentDailyReport.averageOrderValue],
        ['Aktif Masa', currentDailyReport.totalTables],
        ['Ortalama Masa Süresi (dk)', currentDailyReport.averageTableTime]
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Genel Bakış');
    }

    if (activeTab === 'products') {
      const rows = [
        ['Ürün', 'Adet', 'Toplam (TRY)', 'Sipariş', 'Birim Fiyat (TRY)'],
        ...topProducts.map(p => [
          p.productName,
          p.totalQuantity,
          p.totalRevenue,
          p.orderCount,
          (p.totalRevenue / p.totalQuantity).toFixed(2)
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
    }

    if (activeTab === 'revenue') {
      const dailyWs = XLSX.utils.aoa_to_sheet([
        ['Tarih', 'Ciro (TRY)', 'Sipariş'],
        ...dailyTrend.map(d => [d.date, d.revenue, d.orders])
      ]);
      XLSX.utils.book_append_sheet(wb, dailyWs, 'Günlük Trend');

      const weeklyWs = XLSX.utils.aoa_to_sheet([
        ['Hafta', 'Ciro (TRY)', 'Sipariş'],
        ...weeklyTrend.map(w => [w.week, w.revenue, w.orders])
      ]);
      XLSX.utils.book_append_sheet(wb, weeklyWs, 'Haftalık');

      const monthlyWs = XLSX.utils.aoa_to_sheet([
        ['Ay', 'Ciro (TRY)', 'Sipariş'],
        ...monthlyTrend.map(m => [m.month, m.revenue, m.orders])
      ]);
      XLSX.utils.book_append_sheet(wb, monthlyWs, 'Aylık');
    }

    if (activeTab === 'hours') {
      const ws = XLSX.utils.aoa_to_sheet([
        ['Saat Aralığı', 'Sipariş'],
        // Gerçek veriler API'den gelecek
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Yoğun Saatler');
    }

    const arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masapp-rapor-${activeTab}-${currentDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Yazdırma fonksiyonu
  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>RestXQr Rapor - ${activeTab}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
                .metric-title { font-weight: bold; color: #333; }
                .metric-value { font-size: 18px; color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .print-date { text-align: right; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>RestXQr İşletme Raporu</h1>
                <p>Rapor Türü: ${activeTab === 'overview' ? 'Genel Bakış' : 
                  activeTab === 'products' ? 'Ürün Performansı' : 
                  activeTab === 'revenue' ? 'Ciro Analizi' : 'Saat Analizi'}</p>
                <div class="print-date">Yazdırma Tarihi: ${new Date().toLocaleString('tr-TR')}</div>
              </div>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };
  
  // Demo veriler
  const currentDailyReport = {
    totalSales: 45680,
    totalOrders: 127,
    averageOrderValue: 359.68,
    totalTables: 18,
    averageTableTime: 52
  };

  const revenueData = {
    daily: { today: 45680, yesterday: 40850, change: 12 },
    weekly: { thisWeek: 285400, lastWeek: 263200, change: 8 },
    monthly: { thisMonth: 1245000, lastMonth: 1150000, change: 8 }
  };

  const dailyTrend: { date: string; revenue: number; orders: number }[] = [
    { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], revenue: 38500, orders: 105 },
    { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], revenue: 42300, orders: 118 },
    { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], revenue: 39800, orders: 112 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], revenue: 44200, orders: 125 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], revenue: 41500, orders: 115 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], revenue: 40850, orders: 114 },
    { date: new Date().toISOString().split('T')[0], revenue: 45680, orders: 127 }
  ];
  const maxDailyRevenue = Math.max(...dailyTrend.map(d => d.revenue));
  
  const weeklyTrend: { week: string; revenue: number; orders: number }[] = [
    { week: 'Bu Hafta', revenue: 285400, orders: 816 },
    { week: 'Geçen Hafta', revenue: 263200, orders: 752 },
    { week: '2 Hafta Önce', revenue: 278900, orders: 798 },
    { week: '3 Hafta Önce', revenue: 255600, orders: 731 }
  ];
  
  const monthlyTrend: { month: string; revenue: number; orders: number }[] = [
    { month: 'Bu Ay', revenue: 1245000, orders: 3560 },
    { month: 'Geçen Ay', revenue: 1150000, orders: 3280 },
    { month: '2 Ay Önce', revenue: 1198000, orders: 3420 }
  ];
  
  const topProducts: { productId: string; productName: string; totalQuantity: number; totalRevenue: number; orderCount: number }[] = [
    { productId: '1', productName: 'Karışık Pizza', totalQuantity: 156, totalRevenue: 23400, orderCount: 89 },
    { productId: '2', productName: 'Izgara Köfte', totalQuantity: 142, totalRevenue: 21300, orderCount: 78 },
    { productId: '3', productName: 'Tavuk Şiş', totalQuantity: 128, totalRevenue: 19200, orderCount: 71 },
    { productId: '4', productName: 'Çoban Salata', totalQuantity: 98, totalRevenue: 7350, orderCount: 98 },
    { productId: '5', productName: 'Adana Kebap', totalQuantity: 87, totalRevenue: 15660, orderCount: 52 },
    { productId: '6', productName: 'Lahmacun', totalQuantity: 76, totalRevenue: 6080, orderCount: 45 },
    { productId: '7', productName: 'Mercimek Çorbası', totalQuantity: 65, totalRevenue: 3250, orderCount: 65 },
    { productId: '8', productName: 'Künefe', totalQuantity: 54, totalRevenue: 6480, orderCount: 54 }
  ];
  
  const hourlySales: number[] = [12, 18, 25, 42, 68, 95, 87, 76, 58, 45, 32, 28];
  const maxHourly = Math.max(...hourlySales);
  const hourLabels = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);
  const profitableHours = new Set<number>([4, 5, 6]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-0 lg:ml-72 relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <FaBars className="text-xl text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaChartBar className="text-2xl text-white" />
                </div>
              <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    İşletme Raporları
                  </h2>
                  <p className="text-gray-600 text-lg font-semibold mt-1">Performans analizi ve detaylı raporlar</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExcelExport}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                📥 <span>Excel İndir</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                🖨️ <span>Yazdır</span>
              </button>
            </div>
          </div>
        </header>

        <div id="report-content" className="p-6 lg:p-12">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <div className="inline-flex whitespace-nowrap space-x-2 bg-white/80 backdrop-blur-lg p-2 rounded-2xl shadow-xl border border-white/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🍽️ Ürün Performansı
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                activeTab === 'revenue' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              💰 Ciro Analizi
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                activeTab === 'hours' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ⏰ Saat Analizi
            </button>
            </div>
          </div>
        </div>

        {/* Date Selectors */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTab === 'overview' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bugün ({new Date().toLocaleDateString('tr-TR')})
              </label>
              <div className="text-sm text-gray-500">
                Günlük performans özeti
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Genel Bakış */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Ana Metrikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bugünkü Ciro</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(currentDailyReport?.totalSales || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +12% dün</span>
                    </div>
                  </div>
                  <span className="text-green-600 text-2xl">💰</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentDailyReport?.totalOrders || 0}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +8% dün</span>
                    </div>
                  </div>
                  <span className="text-blue-600 text-2xl">🛒</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ortalama Sipariş</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(currentDailyReport?.averageOrderValue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +5% dün</span>
                    </div>
                  </div>
                  <span className="text-purple-600 text-2xl">📊</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif Masa</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentDailyReport?.totalTables || 0}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-600">👁️ Şu anda</span>
                    </div>
                  </div>
                  <span className="text-orange-600 text-2xl">🪑</span>
                </div>
              </div>
            </div>

            {/* Hızlı İstatistikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* En Çok Satan Ürünler */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  🏆 En Çok Satan Ürünler
                </h3>
                <div className="space-y-3">
                  {topProducts.slice(0, 3).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.productName}</p>
                          <p className="text-xs text-gray-600">{product.totalQuantity} adet</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(product.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Masa Performansı */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  ⏰ Masa Performansı
                </h3>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatTime(currentDailyReport?.averageTableTime || 0)}
                  </div>
                  <p className="text-gray-600 text-sm">Ortalama Masa Süresi</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 font-bold">En Hızlı</p>
                      <p className="text-xs text-gray-600">25 dk</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-red-600 font-bold">En Yavaş</p>
                      <p className="text-xs text-gray-600">1s 15dk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ürün Analizi */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🏆 En Çok Satan Ürünler
                </h3>
              </div>
              
              <div className="p-6">
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Bu tarih aralığında veri bulunamadı.</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        <div>
                            <h4 className="font-medium text-gray-800">{product.productName}</h4>
                            <p className="text-sm text-gray-600">
                              {product.totalQuantity} adet • {product.orderCount} sipariş
                            </p>
                          </div>
                        </div>
                                <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(product.totalRevenue)}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(product.totalRevenue / product.totalQuantity)} / adet
                          </p>
                                </div>
                              </div>
                            ))}
                          </div>
                )}
                          </div>
                        </div>
                      </div>
                    )}

        {/* Ciro Analizi */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Ana Ciro Metrikleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Günlük Ciro</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(revenueData.daily.today)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +{revenueData.daily.change}% dün</span>
                    </div>
                  </div>
                  <span className="text-green-600 text-2xl">💰</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Haftalık Ciro</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(revenueData.weekly.thisWeek)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +{revenueData.weekly.change}% geçen hafta</span>
                    </div>
                  </div>
                  <span className="text-blue-600 text-2xl">📊</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aylık Ciro</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(revenueData.monthly.thisMonth)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-green-600">📈 +{revenueData.monthly.change}% geçen ay</span>
                    </div>
                  </div>
                  <span className="text-purple-600 text-2xl">📈</span>
                </div>
              </div>
            </div>

            {/* Günlük Ciro Trendi */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  📈 Günlük Ciro Trendi (Son 7 Gün)
                </h3>
                </div>
              <div className="p-6">
                {/* Mobil: dikey şema (satır bazlı barlar) */}
                <div className="sm:hidden space-y-3">
                  {dailyTrend.map((day, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-12 shrink-0 text-xs font-medium text-gray-600 text-right">
                        {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500/80"
                            style={{ width: `${Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100))}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[11px] text-gray-600">
                          <span className="font-semibold text-green-600">{formatCurrency(day.revenue)}</span>
                          <span>{day.orders} sipariş</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet/Masaüstü: responsive ızgara */}
                <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                  {dailyTrend.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-green-600 mb-1">
                          {formatCurrency(day.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {day.orders} sipariş
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </div>

            {/* Haftalık ve Aylık Karşılaştırma */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Haftalık Trend */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📊 Haftalık Ciro Karşılaştırması
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {weeklyTrend.map((week, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{week.week}</p>
                          <p className="text-sm text-gray-600">{week.orders} sipariş</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(week.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aylık Trend */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📈 Aylık Ciro Karşılaştırması
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {monthlyTrend.map((month, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{month.month}</p>
                          <p className="text-sm text-gray-600">{month.orders} sipariş</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(month.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

        {/* Saat Analizi */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⏰ Saatlik Performans Analizi
                </h3>
              </div>
              <div className="p-6">
                {/* Özet analiz kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">En Yoğun Saatler</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-sm">12:00 - 13:00</span><span className="text-sm font-bold text-blue-600">45 sipariş</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">19:00 - 20:00</span><span className="text-sm font-bold text-blue-600">38 sipariş</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">20:00 - 21:00</span><span className="text-sm font-bold text-blue-600">32 sipariş</span></div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">En Karlı Saatler</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-sm">19:00 - 20:00</span><span className="text-sm font-bold text-green-600">₺2,450</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">20:00 - 21:00</span><span className="text-sm font-bold text-green-600">₺2,180</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">12:00 - 13:00</span><span className="text-sm font-bold text-green-600">₺1,890</span></div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">Masa Süreleri</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-sm">Öğle (12-15)</span><span className="text-sm font-bold text-purple-600">35 dk</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">Akşam (18-22)</span><span className="text-sm font-bold text-purple-600">65 dk</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm">Gece (22-24)</span><span className="text-sm font-bold text-purple-600">45 dk</span></div>
                    </div>
                  </div>
                </div>

                {/* Tek bir grafik: saatlik yoğunluk + kârlı saat vurgusu */}
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <div className="flex items-end gap-2 h-56 min-w-[640px] sm:min-w-0">
                    {hourlySales.map((val, idx) => {
                      const pct = maxHourly === 0 ? 0 : Math.round((val / maxHourly) * 100);
                      const height = val === 0 ? 2 : Math.max(12, pct);
                      const hour = idx + 8;
                      const isProfit = profitableHours.has(hour);
                      return (
                        <div key={idx} className="flex flex-col items-center w-10 sm:w-12 h-full">
                          <div
                            className={`w-full rounded-t ${isProfit ? 'bg-green-500' : 'bg-blue-500'} hover:opacity-90 transition-opacity`}
                            style={{ height: `${height}%` }}
                            title={`${hourLabels[idx]} - ${val} sipariş`}
                          />
                          <span className="mt-2 text-[10px] sm:text-xs text-gray-700 select-none">{hourLabels[idx]}</span>
                          {isProfit && <span className="text-[10px] sm:text-xs text-green-600 font-semibold">kârlı</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm"></span> Sipariş yoğunluğu</div>
                  <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-green-500 rounded-sm"></span> En kârlı saatler</div>
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

