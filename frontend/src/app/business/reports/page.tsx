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
import TranslatedText, { useTranslation } from '@/components/TranslatedText';
import apiService from '@/services/api';

export default function ReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();

  // Feature kontrolü
  const hasBasicReports = useFeature('basic_reports');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');

  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';
  const displayEmail = authenticatedRestaurant?.email || authenticatedStaff?.email || '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'revenue' | 'hours' | 'endOfDay' | 'tables'>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  useEffect(() => {
    // Default to showing all orders or maybe just today's orders depending on UX? 
    // Usually reports might start empty or with today. 
    // The existing code does calculation on 'orders' which contains everything.
    // Let's initialize filteredOrders with orders so it shows everything by default or we can filter by default range.
    // The default range is today (lines 39-42).
    setFilteredOrders(orders);
  }, [orders]);

  const handleFilter = () => {
    if (!dateRange.start || !dateRange.end) return;
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      return orderDate >= start && orderDate <= end;
    });
    setFilteredOrders(filtered);
  };

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  const hasFeatureAccess = hasBasicReports || hasAdvancedAnalytics;

  // API'den siparişleri çek
  useEffect(() => {
    const fetchOrders = async () => {
      if (!authenticatedRestaurant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getOrders(authenticatedRestaurant.id);

        if (response.success && response.data) {
          const normalized = (response.data || []).map((o: any) => ({
            ...o,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (Array.isArray(o.items) ? o.items : [])
          }));
          setOrders(normalized);
        }
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authenticatedRestaurant?.id]);

  if (!hasFeatureAccess) {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2"><TranslatedText>Erişim Yok</TranslatedText></h1>
            <p className="text-gray-600 mb-6"><TranslatedText>Bu sayfaya erişim yetkiniz bulunmamaktadır.</TranslatedText></p>
            <p className="text-sm text-gray-500 mb-6"><TranslatedText>Raporlama özelliğine erişmek için lütfen yöneticinizle iletişime geçin.</TranslatedText></p>
            <button
              onClick={() => router.push('/business/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TranslatedText>Kontrol Paneline Dön</TranslatedText>
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
    try {
      const XLSX: any = await loadXLSX();
      if (!XLSX) {
        throw new Error('XLSX kütüphanesi yüklenemedi');
      }

      const wb = XLSX.utils.book_new();
      const currentDate = new Date().toISOString().split('T')[0];

      if (activeTab === 'overview') {
        const rows = [
          [t('Metrik'), t('Değer')],
          [t('Bugünkü Ciro (TRY)'), currentDailyReport?.totalSales || 0],
          [t('Toplam Sipariş'), currentDailyReport?.totalOrders || 0],
          [t('Ortalama Sipariş (TRY)'), currentDailyReport?.averageOrderValue || 0],
          [t('Aktif Masa'), currentDailyReport?.totalTables || 0],
          [t('Ortalama Masa Süresi (dk)'), currentDailyReport?.averageTableTime || 0]
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, t('Genel Bakış'));
      }

      if (activeTab === 'products') {
        const rows = [
          [t('Ürün'), t('Adet'), t('Toplam (TRY)'), t('Sipariş'), t('Birim Fiyat (TRY)')],
          ...(topProducts || []).map(p => [
            p.productName || '',
            p.totalQuantity || 0,
            p.totalRevenue || 0,
            p.orderCount || 0,
            p.totalQuantity > 0 ? ((p.totalRevenue || 0) / p.totalQuantity).toFixed(2) : '0.00'
          ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, t('Ürünler'));
      }

      if (activeTab === 'revenue') {
        const dailyWs = XLSX.utils.aoa_to_sheet([
          [t('Tarih'), t('Ciro (TRY)'), t('Sipariş')],
          ...(dailyTrend || []).map(d => [d.date || '', d.revenue || 0, d.orders || 0])
        ]);
        XLSX.utils.book_append_sheet(wb, dailyWs, t('Günlük Trend'));

        const weeklyWs = XLSX.utils.aoa_to_sheet([
          [t('Hafta'), t('Ciro (TRY)'), t('Sipariş')],
          ...(weeklyTrend || []).map(w => [w.week || '', w.revenue || 0, w.orders || 0])
        ]);
        XLSX.utils.book_append_sheet(wb, weeklyWs, t('Haftalık'));

        const monthlyWs = XLSX.utils.aoa_to_sheet([
          [t('Ay'), t('Ciro (TRY)'), t('Sipariş')],
          ...(monthlyTrend || []).map(m => [m.month || '', m.revenue || 0, m.orders || 0])
        ]);
        XLSX.utils.book_append_sheet(wb, monthlyWs, t('Aylık'));
      }

      if (activeTab === 'hours') {
        const ws = XLSX.utils.aoa_to_sheet([
          [t('Saat Aralığı'), t('Sipariş')],
          // Gerçek veriler API'den gelecek
        ]);
        XLSX.utils.book_append_sheet(wb, ws, t('Yoğun Saatler'));
      }

      if (activeTab === 'endOfDay') {
        // Z-Report logic for Excel
        const rows = [
          [t('Z-Raporu'), new Date().toLocaleDateString('tr-TR')],
          [],
          [t('Metrik'), t('Değer')],
          [t('Toplam Ciro (Gross)'), displayReport?.totalSales || 0],
          [t('KDV Toplam (%10)'), (displayReport?.totalSales || 0) * 0.10],
          [t('Net Ciro'), (displayReport?.totalSales || 0) * 0.90],
          [t('Toplam Sipariş'), displayReport?.totalOrders || 0],
          [],
          [t('Ödeme Dağılımı')],
          [t('Yöntem'), t('Tutar')],
          // Add payment breakdown loops here if needed for excel
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, t('Gün Sonu'));
      }

      if (activeTab === 'tables') {
        const rows = [
          [t('Masa'), t('Sipariş Sayısı'), t('Toplam Ciro (TRY)'), t('Ort. Süre (dk)')],
          // Data will be filled in rendering logic, but duplicating logic here for export might be complex. 
          // For now, let's export empty or simple list if we don't refactor calculation out.
          // Ideally we calculate stats outside render.
        ];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, t('Masa Analizi'));
      }

      const arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = `restxqr-rapor-${activeTab}-${currentDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Excel export hatası:', error);
      alert(t('Excel dosyası indirilirken bir hata oluştu. Lütfen tekrar deneyin.'));
    }
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
                <h1>${t('RestXQr İşletme Raporu')}</h1>
                <p>${t('Rapor Türü')}: ${activeTab === 'overview' ? t('Genel Bakış') :
            activeTab === 'products' ? t('Ürün Performansı') :
              activeTab === 'revenue' ? t('Ciro Analizi') :
                activeTab === 'tables' ? t('Masa Analizi') :
                  activeTab === 'endOfDay' ? t('Gün Sonu (Z-Raporu)') : t('Saat Analizi')}</p>
                <div class="print-date">${t('Yazdırma Tarihi')}: ${new Date().toLocaleString('tr-TR')}</div>
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


  // Bugünkü siparişleri filtrele
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  // Dünkü siparişleri filtrele
  const yesterdayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate.toDateString() === yesterday.toDateString();
  });

  // Bu haftanın siparişleri
  const thisWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return orderDate >= weekStart;
  });

  // Geçen haftanın siparişleri
  const lastWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - today.getDay());
    return orderDate >= lastWeekStart && orderDate < lastWeekEnd;
  });

  // Bu ayın siparişleri
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const today = new Date();
    return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
  });

  // Geçen ayın siparişleri
  const lastMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return orderDate >= lastMonth && orderDate < thisMonth;
  });

  // Günlük rapor hesapla (Today only)
  const todayStats = {
    totalSales: todayOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0),
    totalOrders: todayOrders.length,
    averageOrderValue: todayOrders.length > 0
      ? todayOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0) / todayOrders.length
      : 0,
    totalTables: new Set(todayOrders.map(order => order.tableNumber || order.table_id || order.id)).size,
    averageTableTime: 0
  };

  const currentDailyReport = todayStats; // Keep name for backward compatibility in Overview

  // Filtered stats for other tabs
  const filteredReportStats = {
    totalSales: filteredOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0),
    totalOrders: filteredOrders.length,
    averageOrderValue: filteredOrders.length > 0
      ? filteredOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0) / filteredOrders.length
      : 0,
    totalTables: new Set(filteredOrders.map(order => order.tableNumber || order.table_id || order.id)).size,
    averageTableTime: 0
  };

  const displayReport = activeTab === 'overview' ? currentDailyReport : filteredReportStats;


  // Gelir verileri (İndirimler düşülmüş net rakamlar)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);
  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);
  const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);
  const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0);

  const revenueData = {
    daily: {
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      change: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    },
    weekly: {
      thisWeek: thisWeekRevenue,
      lastWeek: lastWeekRevenue,
      change: lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0
    },
    monthly: {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      change: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
    }
  };

  // Uygulamanın başlangıç tarihi (ilk siparişin tarihi veya restoran oluşturulma tarihi)
  const getStartDate = () => {
    if (orders.length === 0) {
      // Eğer sipariş yoksa, restoran oluşturulma tarihini kullan
      const restaurantCreatedAt = authenticatedRestaurant?.createdAt || authenticatedRestaurant?.created_at;
      if (restaurantCreatedAt) {
        return new Date(restaurantCreatedAt);
      }
      // Eğer o da yoksa, bugünden itibaren
      return new Date();
    }
    // İlk siparişin tarihini bul
    const firstOrder = orders.reduce((earliest, order) => {
      const orderDate = new Date(order.createdAt || order.created_at);
      const earliestDate = new Date(earliest.createdAt || earliest.created_at);
      return orderDate < earliestDate ? order : earliest;
    });
    return new Date(firstOrder.createdAt || firstOrder.created_at);
  };

  const startDate = getStartDate();
  const today = new Date();
  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Günlük trend (uygulamanın başladığı tarihten itibaren, maksimum son 30 gün)
  const dailyTrend: { date: string; revenue: number; orders: number }[] = [];
  const daysToShow = Math.min(daysSinceStart, 30);
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Başlangıç tarihinden önceki günleri atla
    if (date < startDate) continue;
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      return orderDate.toISOString().split('T')[0] === dateStr;
    });
    dailyTrend.push({
      date: dateStr,
      revenue: dayOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0),
      orders: dayOrders.length
    });
  }
  const maxDailyRevenue = Math.max(...dailyTrend.map(d => d.revenue), 1);

  // Haftalık trend (uygulamanın başladığı tarihten itibaren, maksimum son 12 hafta)
  const weeklyTrend: { week: string; revenue: number; orders: number }[] = [];
  const weeksSinceStart = Math.ceil(daysSinceStart / 7);
  const weeksToShow = Math.min(weeksSinceStart, 12);
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
    // Başlangıç tarihinden önceki haftaları atla
    if (weekStart < startDate) continue;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      return orderDate >= weekStart && orderDate <= weekEnd;
    });
    weeklyTrend.push({
      week: `${weekStart.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}`,
      revenue: weekOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0),
      orders: weekOrders.length
    });
  }

  // Aylık trend (uygulamanın başladığı tarihten itibaren, maksimum son 12 ay)
  const monthlyTrend: { month: string; revenue: number; orders: number }[] = [];
  const monthsSinceStart = Math.ceil(daysSinceStart / 30);
  const monthsToShow = Math.min(monthsSinceStart, 12);
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    // Başlangıç tarihinden önceki ayları atla
    if (monthDate < startDate) continue;
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      return orderDate.getMonth() === monthDate.getMonth() && orderDate.getFullYear() === monthDate.getFullYear();
    });
    monthlyTrend.push({
      month: monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      revenue: monthOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0),
      orders: monthOrders.length
    });
  }

  // Calculate filtered daily trend based on dateRange
  const filteredDailyTrend: { date: string; revenue: number; orders: number }[] = [];
  if (dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at);
        return orderDate.toISOString().split('T')[0] === dateStr;
      });
      filteredDailyTrend.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, order) => sum + ((Number(order.totalAmount) || Number(order.total) || 0) - (Number(order.discountAmount) || 0)), 0),
        orders: dayOrders.length
      });
    }
  }

  // Determine which trend to show based on active tab
  const displayDailyTrend = activeTab === 'revenue' ? filteredDailyTrend : dailyTrend;
  const maxDisplayRevenue = Math.max(...displayDailyTrend.map(d => d.revenue), 1);
  const displayTotalRevenue = filteredReportStats.totalSales;
  const displayTotalOrders = filteredReportStats.totalOrders;
  const displayAvgOrder = filteredReportStats.averageOrderValue;

  // En çok satan ürünler (based on filteredOrders if not overview, but overview doesn't show top products list usually? 
  // Actually the code uses 'orders' for topProducts which is shown in 'products' tab. 
  // We should switches to filteredOrders for 'products' tab.
  const sourceOrders = activeTab === 'overview' ? orders : filteredOrders;

  const productMap = new Map<string, { productName: string; totalQuantity: number; totalRevenue: number; orderCount: number }>();

  sourceOrders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const productName = item.name || item.menuItem?.name || 'Bilinmeyen Ürün';
        const productId = item.menuItemId || item.id || productName;
        const quantity = item.quantity || 1;
        const price = item.unitPrice || item.price || 0;
        const revenue = quantity * price;

        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.totalQuantity += quantity;
          existing.totalRevenue += revenue;
          existing.orderCount += 1;
        } else {
          productMap.set(productId, {
            productName,
            totalQuantity: quantity,
            totalRevenue: revenue,
            orderCount: 1
          });
        }
      });
    }
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // Saatlik satışlar (8:00 - 20:00)
  const hourlySales: number[] = Array(12).fill(0);
  const hourlyOrders: number[] = Array(12).fill(0);
  // Use filteredOrders for hours tab
  const hoursSourceOrders = activeTab === 'hours' ? filteredOrders : orders;

  hoursSourceOrders.forEach(order => {
    const orderDate = new Date(order.createdAt || order.created_at);
    const hour = orderDate.getHours();
    if (hour >= 8 && hour < 20) {
      hourlySales[hour - 8] += Number(order.totalAmount) || Number(order.total) || 0;
      hourlyOrders[hour - 8] += 1;
    }
  });
  const maxHourly = Math.max(...hourlySales, 1);
  const hourLabels = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);
  const profitableHours = new Set<number>();
  hourlySales.forEach((sales, index) => {
    if (sales > maxHourly * 0.5) {
      profitableHours.add(index + 8);
    }
  });

  // En yoğun saatler (sipariş sayısına göre)
  const topHoursByOrders = hourlyOrders
    .map((count, index) => ({ hour: index + 8, count, revenue: hourlySales[index] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // En karlı saatler (ciroya göre)
  const topHoursByRevenue = hourlySales
    .map((revenue, index) => ({ hour: index + 8, revenue, count: hourlyOrders[index] }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  // Masa Analizi Hesaplamaları
  const tableStats = activeTab === 'tables' || activeTab === 'overview' ? (() => {
    const source = activeTab === 'overview' ? orders : filteredOrders;
    const stats = new Map<string, { tableId: string; orderCount: number; totalRevenue: number; sessions: { start: number; end: number }[] }>();

    // Group orders by table
    source.forEach(order => {
      const tableId = order.tableNumber || order.table_id || 'Bilinmiyor';
      // Skip takeaway/delivery if table is not relevant
      if (order.orderType === 'takeaway' || order.orderType === 'delivery') return;

      if (!stats.has(tableId)) {
        stats.set(tableId, { tableId, orderCount: 0, totalRevenue: 0, sessions: [] });
      }
      const entry = stats.get(tableId)!;
      entry.orderCount += 1;
      entry.totalRevenue += (Number(order.totalAmount) || Number(order.total) || 0);
    });

    const tableTimes = new Map<string, number[]>();
    source.forEach(order => {
      const tableId = order.tableNumber || order.table_id || 'Bilinmiyor';
      if (order.orderType === 'takeaway' || order.orderType === 'delivery') return;
      if (!tableTimes.has(tableId)) tableTimes.set(tableId, []);
      tableTimes.get(tableId)!.push(new Date(order.createdAt || order.created_at).getTime());
    });

    const finalStats: any[] = [];

    stats.forEach((val, key) => {
      const times = tableTimes.get(key) || [];
      times.sort((a, b) => a - b);

      let totalDurationMinutes = 0;
      let sessionsCount = 0;

      if (times.length > 0) {
        let sessionStart = times[0];
        let sessionEnd = times[0];
        sessionsCount = 1;

        for (let i = 1; i < times.length; i++) {
          if (times[i] - sessionEnd < 2 * 60 * 60 * 1000) { // 2 hours
            sessionEnd = times[i];
          } else {
            // Start new session
            totalDurationMinutes += (sessionEnd - sessionStart) / (1000 * 60); // minutes

            if (sessionEnd === sessionStart) totalDurationMinutes += 30; // Assume 30 min for single order

            sessionStart = times[i];
            sessionEnd = times[i];
            sessionsCount++;
          }
        }
        // Add last session
        totalDurationMinutes += (sessionEnd - sessionStart) / (1000 * 60);
        if (sessionEnd === sessionStart) totalDurationMinutes += 30;
      }

      const avgDuration = sessionsCount > 0 ? Math.round(totalDurationMinutes / sessionsCount) : 0;

      finalStats.push({
        tableId: val.tableId,
        orderCount: val.orderCount,
        totalRevenue: val.totalRevenue,
        avgDuration
      });
    });

    return finalStats.sort((a, b) => b.totalRevenue - a.totalRevenue); // Default Revenue sort
  })() : [];

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
                    <TranslatedText>İşletme Raporları</TranslatedText>
                  </h2>
                  <p className="text-gray-600 text-lg font-semibold mt-1"><TranslatedText>Performans analizi ve detaylı raporlar</TranslatedText></p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExcelExport}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                📥 <span><TranslatedText>Excel İndir</TranslatedText></span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                🖨️ <span><TranslatedText>Yazdır</TranslatedText></span>
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
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  📊 <TranslatedText>Genel Bakış</TranslatedText>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'products'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  🍽️ <TranslatedText>Ürün Performansı</TranslatedText>
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'revenue'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  💰 <TranslatedText>Ciro Analizi</TranslatedText>
                </button>
                <button
                  onClick={() => setActiveTab('endOfDay')}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'endOfDay'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  📑 <TranslatedText>Gün Sonu</TranslatedText>
                </button>
                <button
                  onClick={() => setActiveTab('hours')}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'hours'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  ⏰ <TranslatedText>Saat Analizi</TranslatedText>
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`flex items-center gap-2 px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 ${activeTab === 'tables'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  🪑 <TranslatedText>Masa Analizi</TranslatedText>
                </button>
              </div>
            </div>
          </div>

          {/* Date Selectors */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'overview' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TranslatedText>Bugün</TranslatedText> ({new Date().toLocaleDateString('tr-TR')})
                </label>
                <div className="text-sm text-gray-500">
                  <TranslatedText>Günlük performans özeti</TranslatedText>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TranslatedText>Başlangıç Tarihi</TranslatedText>
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
                    <TranslatedText>Bitiş Tarihi</TranslatedText>
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleFilter}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                  >
                    <TranslatedText>Filtrele</TranslatedText>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Genel Bakış */}
          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Ana Metrikler */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Bugünkü Ciro</TranslatedText></p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(currentDailyReport?.totalSales || 0)}
                      </p>
                      {revenueData.daily.change !== 0 && (
                        <div className="flex items-center mt-1">
                          <span className={`text-xs ${revenueData.daily.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenueData.daily.change > 0 ? '📈' : '📉'} {revenueData.daily.change > 0 ? '+' : ''}{revenueData.daily.change.toFixed(1)}% {t('dün')}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-green-600 text-2xl">💰</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam Sipariş</TranslatedText></p>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentDailyReport?.totalOrders || 0}
                      </p>
                      {yesterdayOrders.length > 0 && (
                        <div className="flex items-center mt-1">
                          {(() => {
                            const orderChange = yesterdayOrders.length > 0
                              ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
                              : 0;
                            return (
                              <span className={`text-xs ${orderChange > 0 ? 'text-green-600' : orderChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {orderChange > 0 ? '📈' : orderChange < 0 ? '📉' : '➡️'} {orderChange > 0 ? '+' : ''}{orderChange.toFixed(1)}% {t('dün')}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <span className="text-blue-600 text-2xl">🛒</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Ortalama Sipariş</TranslatedText></p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(currentDailyReport?.averageOrderValue || 0)}
                      </p>
                      {yesterdayOrders.length > 0 && todayOrders.length > 0 && (
                        <div className="flex items-center mt-1">
                          {(() => {
                            const yesterdayAvg = yesterdayOrders.length > 0
                              ? yesterdayOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0) / yesterdayOrders.length
                              : 0;
                            const todayAvg = currentDailyReport.averageOrderValue;
                            const avgChange = yesterdayAvg > 0 ? ((todayAvg - yesterdayAvg) / yesterdayAvg) * 100 : 0;
                            return (
                              <span className={`text-xs ${avgChange > 0 ? 'text-green-600' : avgChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {avgChange > 0 ? '📈' : avgChange < 0 ? '📉' : '➡️'} {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}% {t('dün')}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <span className="text-purple-600 text-2xl">📊</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Aktif Masa</TranslatedText></p>
                      <p className="text-2xl font-bold text-orange-600">
                        {currentDailyReport?.totalTables || 0}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-600">👁️ <TranslatedText>Şu anda</TranslatedText></span>
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
                    🏆 <TranslatedText>En Çok Satan Ürünler</TranslatedText>
                  </h3>
                  <div className="space-y-3">
                    {topProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{product.productName}</p>
                            <p className="text-xs text-gray-600">{product.totalQuantity} <TranslatedText>adet</TranslatedText></p>
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
                    <p className="text-gray-600 text-sm"><TranslatedText>Ortalama Masa Süresi</TranslatedText></p>
                    {todayOrders.length === 0 && (
                      <div className="mt-4 text-sm text-gray-500">
                        <TranslatedText>Bugün henüz sipariş bulunmamaktadır.</TranslatedText>
                      </div>
                    )}
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
                    🏆 <TranslatedText>En Çok Satan Ürünler</TranslatedText>
                  </h3>
                </div>

                <div className="p-6">
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8"><TranslatedText>Bu tarih aralığında veri bulunamadı.</TranslatedText></p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{product.productName}</h4>
                              <p className="text-sm text-gray-600">
                                {product.totalQuantity} <TranslatedText>adet</TranslatedText> • {product.orderCount} <TranslatedText>sipariş</TranslatedText>
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
          {!loading && activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Ana Ciro Metrikleri (Filtreli) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam Ciro (Seçilen Tarih)</TranslatedText></p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(displayTotalRevenue)}
                      </p>
                    </div>
                    <span className="text-green-600 text-2xl">💰</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam Sipariş</TranslatedText></p>
                      <p className="text-2xl font-bold text-blue-600">
                        {displayTotalOrders}
                      </p>
                    </div>
                    <span className="text-blue-600 text-2xl">📊</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600"><TranslatedText>Ortalama Sipariş</TranslatedText></p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(displayAvgOrder)}
                      </p>
                    </div>
                    <span className="text-purple-600 text-2xl">📈</span>
                  </div>
                </div>
              </div>

              {/* Günlük Ciro Trendi (Filtered) */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    📈 <TranslatedText>Ciro Trendi (Seçilen Tarih Aralığı)</TranslatedText>
                  </h3>
                </div>
                <div className="p-6">
                  {/* Mobil: dikey şema (satır bazlı barlar) */}
                  <div className="sm:hidden space-y-3">

                    {displayDailyTrend.map((day, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 shrink-0 text-xs font-medium text-gray-600 text-right">
                          {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500/80"
                              style={{ width: `${maxDisplayRevenue > 0 ? Math.max(8, Math.round((day.revenue / maxDisplayRevenue) * 100)) : 8}%` }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-[11px] text-gray-600">
                            <span className="font-semibold text-green-600">{formatCurrency(day.revenue)}</span>
                            <span>{day.orders} <TranslatedText>sipariş</TranslatedText></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tablet/Masaüstü: responsive ızgara */}
                  <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                    {displayDailyTrend.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm font-medium text-gray-600 mb-2">
                            {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {formatCurrency(day.revenue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.orders} <TranslatedText>sipariş</TranslatedText>
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
                      📊 <TranslatedText>Haftalık Ciro Karşılaştırması</TranslatedText>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {weeklyTrend.map((week, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{week.week}</p>
                            <p className="text-sm text-gray-600">{week.orders} <TranslatedText>sipariş</TranslatedText></p>
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
                      📈 <TranslatedText>Aylık Ciro Karşılaştırması</TranslatedText>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {monthlyTrend.map((month, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{month.month}</p>
                            <p className="text-sm text-gray-600">{month.orders} <TranslatedText>sipariş</TranslatedText></p>
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
          {!loading && activeTab === 'hours' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    ⏰ <TranslatedText>Saatlik Performans Analizi</TranslatedText>
                  </h3>
                </div>
                <div className="p-6">
                  {/* Özet analiz kartları */}
                  {orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-3"><TranslatedText>En Yoğun Saatler</TranslatedText></h4>
                        <div className="space-y-2">
                          {topHoursByOrders.length > 0 ? (
                            topHoursByOrders.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm">{item.hour}:00 - {item.hour + 1}:00</span>
                                <span className="text-sm font-bold text-blue-600">{item.count} <TranslatedText>sipariş</TranslatedText></span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500"><TranslatedText>Veri bulunamadı</TranslatedText></p>
                          )}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-3"><TranslatedText>En Karlı Saatler</TranslatedText></h4>
                        <div className="space-y-2">
                          {topHoursByRevenue.length > 0 ? (
                            topHoursByRevenue.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm">{item.hour}:00 - {item.hour + 1}:00</span>
                                <span className="text-sm font-bold text-green-600">{formatCurrency(item.revenue)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500"><TranslatedText>Veri bulunamadı</TranslatedText></p>
                          )}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-3"><TranslatedText>Saatlik Özet</TranslatedText></h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm"><TranslatedText>Toplam Sipariş</TranslatedText></span>
                            <span className="text-sm font-bold text-purple-600">{orders.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm"><TranslatedText>Toplam Ciro</TranslatedText></span>
                            <span className="text-sm font-bold text-purple-600">{formatCurrency(orders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0))}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm"><TranslatedText>Ortalama Sipariş</TranslatedText></span>
                            <span className="text-sm font-bold text-purple-600">{formatCurrency(orders.length > 0 ? orders.reduce((sum, order) => sum + (Number(order.totalAmount) || Number(order.total) || 0), 0) / orders.length : 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 mb-6">
                      <TranslatedText>Henüz sipariş verisi bulunmamaktadır.</TranslatedText>
                    </div>
                  )}

                  {/* Tek bir grafik: saatlik yoğunluk + kârlı saat vurgusu */}
                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <div className="flex items-end gap-2 h-56 min-w-[640px] sm:min-w-0">
                      {(hourlySales || []).map((val, idx) => {
                        const pct = maxHourly > 0 ? Math.round((val / maxHourly) * 100) : 0;
                        const height = val === 0 ? 2 : Math.max(12, pct);
                        const hour = idx + 8;
                        const isProfit = profitableHours?.has(hour) || false;
                        return (
                          <div key={idx} className="flex flex-col items-center w-10 sm:w-12 h-full">
                            <div
                              className={`w-full rounded-t ${isProfit ? 'bg-green-500' : 'bg-blue-500'} hover:opacity-90 transition-opacity`}
                              style={{ height: `${height}%` }}
                              title={`${hourLabels[idx]} - ${val} sipariş`}
                            />
                            <span className="mt-2 text-[10px] sm:text-xs text-gray-700 select-none">{hourLabels[idx]}</span>
                            {isProfit && <span className="text-[10px] sm:text-xs text-green-600 font-semibold"><TranslatedText>kârlı</TranslatedText></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm"></span> <TranslatedText>Sipariş yoğunluğu</TranslatedText></div>
                    <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-green-500 rounded-sm"></span> <TranslatedText>En kârlı saatler</TranslatedText></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Masa Analizi Tab */}
          {!loading && activeTab === 'tables' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>En Çok Kullanılan Masa</TranslatedText></p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tableStats.sort((a, b) => b.orderCount - a.orderCount)[0]?.tableId || '-'}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>En Çok Ciro Yapan Masa</TranslatedText></p>
                  <p className="text-2xl font-bold text-green-600">
                    {tableStats.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.tableId || '-'}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Ortalama Oturma Süresi</TranslatedText></p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tableStats.length > 0 ? Math.round(tableStats.reduce((acc, curr) => acc + curr.avgDuration, 0) / tableStats.length) : 0} dk
                  </p>
                </div>
              </div>

              {/* Detailed Table List */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800"><TranslatedText>Detaylı Masa İstatistikleri</TranslatedText></h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-medium text-gray-500"><TranslatedText>Masa No</TranslatedText></th>
                        <th className="p-4 text-right font-medium text-gray-500"><TranslatedText>Sipariş Sayısı</TranslatedText></th>
                        <th className="p-4 text-right font-medium text-gray-500"><TranslatedText>Toplam Ciro</TranslatedText></th>
                        <th className="p-4 text-right font-medium text-gray-500"><TranslatedText>Ort. Süre</TranslatedText></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableStats.length > 0 ? (
                        tableStats.map((stat, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-800">{stat.tableId}</td>
                            <td className="p-4 text-right text-gray-600">{stat.orderCount}</td>
                            <td className="p-4 text-right font-semibold text-green-600">{formatCurrency(stat.totalRevenue)}</td>
                            <td className="p-4 text-right text-blue-600">{stat.avgDuration} dk</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500"><TranslatedText>Görüntülenecek veri yok</TranslatedText></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Gün Sonu Raporları (End of Day) */}
          {activeTab === 'endOfDay' && (
            <div className="space-y-8">
              {/* Z-Raporu Kartı */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    📑 <TranslatedText>Gün Sonu Z-Raporu</TranslatedText>
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-500"><TranslatedText>Tarih</TranslatedText></p>
                    <p className="font-bold text-lg text-gray-800">{new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Sol Kolon: Finansal Özet */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-700 border-b pb-2"><TranslatedText>Finansal Özet</TranslatedText></h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-600"><TranslatedText>Toplam Satış (Brüt)</TranslatedText></span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(displayReport?.totalSales || 0)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-600"><TranslatedText>KDV (%10)</TranslatedText></span>
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrency((displayReport?.totalSales || 0) * 0.10)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <span className="font-bold text-green-800 text-lg"><TranslatedText>Net Satış</TranslatedText></span>
                        <span className="text-2xl font-black text-green-600">
                          {formatCurrency((displayReport?.totalSales || 0) * 0.90)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4"><TranslatedText>Satış Detayları</TranslatedText></h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border rounded-xl p-4 text-center">
                          <p className="text-gray-500 text-sm mb-1"><TranslatedText>Fiş Sayısı</TranslatedText></p>
                          <p className="text-xl font-bold">{displayReport?.totalOrders || 0}</p>
                        </div>
                        <div className="bg-white border rounded-xl p-4 text-center">
                          <p className="text-gray-500 text-sm mb-1"><TranslatedText>İptal/İade</TranslatedText></p>
                          <p className="text-xl font-bold text-red-500">0</p>
                          {/* Backend'den iptal verisi gelince burası güncellenebilir */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon: Ödeme Dağılımı */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-gray-700 border-b pb-2"><TranslatedText>Ödeme Yöntemi Dağılımı</TranslatedText></h4>

                    <div className="space-y-4">
                      {/* Ödeme yöntemlerini hesapla */}
                      {(() => {
                        // Bu hesaplama render içinde yapılıyor, normalde useMemo kullanmak daha iyi olabilir ama basitlik için burada
                        const paymentStats = {
                          cash: 0,
                          card: 0,
                          online: 0
                        };

                        todayOrders.forEach(order => {
                          const gross = Number(order.totalAmount) || Number(order.total) || 0;
                          const discount = Number(order.discountAmount) || 0;
                          const amount = gross - discount;
                          const note = order.cashierNote || '';

                          // Hibrit ödeme kontrolü
                          const cashMatch = note.match(/\[NAKİT:\s*([\d.]+)₺/);
                          const cardMatch = note.match(/\[KART:\s*([\d.]+)₺/);

                          if (cashMatch || cardMatch) {
                            if (cashMatch) paymentStats.cash += parseFloat(cashMatch[1]);
                            if (cardMatch) paymentStats.card += parseFloat(cardMatch[1]);
                          } else if (note.includes('[KART]')) {
                            paymentStats.card += amount;
                          } else if (note.includes('[NAKİT]')) {
                            paymentStats.cash += amount;
                          } else {
                            // Eski usul veya diğer yöntemler
                            const method = order.paymentMethod || (order.orderType === 'dine_in' ? 'cash' : 'online');
                            if (method === 'card' || method === 'kredi_karti') paymentStats.card += amount;
                            else if (method === 'online') paymentStats.online += amount;
                            else paymentStats.cash += amount;
                          }
                        });

                        const total = paymentStats.cash + paymentStats.card + paymentStats.online;

                        return (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span className="font-medium text-gray-700"><TranslatedText>Nakit</TranslatedText></span>
                                </div>
                                <span className="font-bold">{formatCurrency(paymentStats.cash)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${total > 0 ? (paymentStats.cash / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <span className="font-medium text-gray-700"><TranslatedText>Kredi Kartı</TranslatedText></span>
                                </div>
                                <span className="font-bold">{formatCurrency(paymentStats.card)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${total > 0 ? (paymentStats.card / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                  <span className="font-medium text-gray-700"><TranslatedText>Online Ödeme</TranslatedText></span>
                                </div>
                                <span className="font-bold">{formatCurrency(paymentStats.online)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${total > 0 ? (paymentStats.online / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ürün & Stok Raporu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Satılan Ürünler */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📦 <TranslatedText>Satılan Ürünler (Stok Çıkışı)</TranslatedText>
                  </h3>
                  <div className="overflow-y-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase"><TranslatedText>Ürün</TranslatedText></th>
                          <th className="text-right p-3 text-xs font-bold text-gray-500 uppercase"><TranslatedText>Adet</TranslatedText></th>
                          <th className="text-right p-3 text-xs font-bold text-gray-500 uppercase"><TranslatedText>Toplam</TranslatedText></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {topProducts.map((product, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 text-sm font-medium text-gray-800">{product.productName}</td>
                            <td className="p-3 text-sm text-right font-bold text-blue-600">{product.totalQuantity}</td>
                            <td className="p-3 text-sm text-right font-bold text-gray-900">{formatCurrency(product.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Az Satanlar (Uyarı) */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    ⚠️ <TranslatedText>Hareket Görmeyen / Az Satanlar</TranslatedText>
                  </h3>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mb-4">
                    <p className="text-sm text-yellow-800">
                      <TranslatedText>Bu liste, menüde olup bugün hiç satılmayan veya çok az satılan ürünleri gösterir. Stok takibi ve fire kontrolü için önemlidir.</TranslatedText>
                    </p>
                  </div>
                  {/* Burada normalde tüm menüden satılmayanlar çıkarılır ama şimdilik en az satanları gösterelim */}
                  <div className="overflow-y-auto max-h-60">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase"><TranslatedText>Ürün</TranslatedText></th>
                          <th className="text-right p-3 text-xs font-bold text-gray-500 uppercase"><TranslatedText>Adet</TranslatedText></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {/* Reverse sort topProducts to get least sold from the active sales list used as proxy for now */}
                        {[...topProducts].reverse().slice(0, 5).map((product, idx) => (
                          <tr key={idx}>
                            <td className="p-3 text-sm text-gray-600">{product.productName}</td>
                            <td className="p-3 text-sm text-right font-bold text-gray-400">{product.totalQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

