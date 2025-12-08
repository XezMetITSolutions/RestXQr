'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnnouncementQuickModal from '@/components/AnnouncementQuickModal';
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
  FaClipboardList,
  FaTimes,
  FaBullhorn,
  FaBars,
  FaMoneyBillWave,
  FaPlus,
  FaEye,
  FaEdit,
  FaRocket
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import BusinessPaymentModal from '@/components/BusinessPaymentModal';
import { useFeature } from '@/hooks/useFeature';
import LanguageSelector from '@/components/LanguageSelector';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import BusinessSidebar from '@/components/BusinessSidebar';

export default function BusinessDashboard() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const {
    categories,
    menuItems,
    orders,
    activeOrders,
    fetchRestaurantMenu,
    loading: restaurantLoading
  } = useRestaurantStore();

  const { currentLanguage } = useLanguage(); // Need this for getStatic

  // Helper for synchronous translation
  const getStatic = (text: string) => {
    const langCode = currentLanguage === 'German' ? 'de' :
      (currentLanguage === 'English' ? 'en' :
        (currentLanguage === 'Turkish' ? 'tr' :
          (currentLanguage === 'Arabic' ? 'ar' :
            (currentLanguage === 'Russian' ? 'ru' :
              (currentLanguage === 'French' ? 'fr' :
                (currentLanguage === 'Spanish' ? 'es' :
                  (currentLanguage === 'Italian' ? 'it' : 'en')))))));

    if (staticDictionary[text] && staticDictionary[text][langCode]) {
      return staticDictionary[text][langCode];
    }
    return text;
  };

  // Sayfa yüklendiginde auth'u initialize et
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Restaurant menüsünü yükle
  useEffect(() => {
    if (authenticatedRestaurant?.id) {
      fetchRestaurantMenu(authenticatedRestaurant.id);
    }
  }, [authenticatedRestaurant?.id, fetchRestaurantMenu]);

  // Giriş yapan kişinin adını al
  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';
  const displayEmail = authenticatedRestaurant?.email || authenticatedStaff?.email || '';

  // Premium plan state'leri
  const [currentPlan, setCurrentPlan] = useState('premium'); // basic, premium, enterprise
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: number }>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'sixMonths' | 'yearly'>('monthly');
  const [corporateBillingCycle, setCorporateBillingCycle] = useState<'monthly' | 'sixMonths' | 'yearly'>('monthly');
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'corporate'>('premium');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restoranlar sayfasından alınan planlar ve fiyatlar
  const plans = {
    premium: {
      name: getStatic('Premium Paket'),
      description: getStatic('Küçük ve orta ölçekli işletmeler için'),
      features: [
        getStatic('QR Menü Sistemi (Sınırsız menü, anlık güncelleme)'),
        getStatic('Mutfak Paneli (5 kullanıcı, sipariş takibi)'),
        getStatic('Garson Paneli (3 kullanıcı, masa yönetimi)'),
        getStatic('İşletme Paneli (2 kullanıcı, raporlama)'),
        getStatic('Müşteri Uygulaması (Sipariş verme, ödeme)'),
        getStatic('7/24 WhatsApp Destek'),
        getStatic('Google Yorum Entegrasyonu'),
        getStatic('Detaylı Satış Raporları'),
        getStatic('Mobil Uyumlu Tasarım'),
        getStatic('Stok Yönetimi')
      ],
      pricing: {
        monthly: 4980,
        sixMonths: 24900,
        yearly: 47900
      }
    },
    corporate: {
      name: getStatic('Kurumsal Paket'),
      description: getStatic('Büyük işletmeler ve zincirler için'),
      features: [
        getStatic('Premium Paket\'in Tüm Özellikleri'),
        getStatic('Sınırsız Kullanıcı (Tüm paneller)'),
        getStatic('Çoklu Şube Yönetimi'),
        getStatic('Özel Menü ve Logo Entegrasyonu'),
        getStatic('Özel Tema Tasarımı'),
        getStatic('API Entegrasyonları (POS, Muhasebe)'),
        getStatic('Özel Eğitim ve Danışmanlık'),
        getStatic('Öncelikli WhatsApp Destek'),
        getStatic('Gelişmiş Analitik ve Raporlama'),
        getStatic('Özel Geliştirmeler'),
        getStatic('Dedicated Account Manager'),
        getStatic('7/24 Telefon Desteği'),
        getStatic('Özel Rapor Şablonları'),
        getStatic('Beyaz Etiket Çözümü')
      ],
      pricing: {
        monthly: 9980,
        sixMonths: 49900,
        yearly: 95900
      }
    }
  };

  // Ek hizmetler ve fiyatlandırma (Türkiye şartlarına göre)
  const additionalServices = {
    'menu-customization': {
      name: getStatic('Menü Özelleştirme'),
      description: getStatic('Özel tema, logo ve tasarım değişiklikleri'),
      panel: 'Menü',
      basePrice: 2500,
      perChange: 500
    },
    'qr-design': {
      name: getStatic('QR Kod Tasarımı'),
      description: getStatic('Özel QR kod tasarımı ve yerleşimi'),
      panel: 'QR Kodlar',
      basePrice: 1500,
      perChange: 300
    },
    'report-customization': {
      name: getStatic('Rapor Özelleştirme'),
      description: getStatic('Özel rapor şablonları ve analitik'),
      panel: 'Raporlar',
      basePrice: 3000,
      perChange: 800
    },
    'staff-training': {
      name: getStatic('Personel Eğitimi'),
      description: getStatic('Panel kullanımı ve sistem eğitimi'),
      panel: 'Personel',
      basePrice: 2000,
      perChange: 500
    },
    'order-integration': {
      name: getStatic('Sipariş Entegrasyonu'),
      description: getStatic('POS ve ödeme sistem entegrasyonu'),
      panel: 'Siparişler',
      basePrice: 5000,
      perChange: 1500
    },
    'multi-branch-setup': {
      name: getStatic('Çoklu Şube Kurulumu'),
      description: getStatic('Ek şube ekleme ve yönetimi'),
      panel: 'Genel',
      basePrice: 4000,
      perChange: 2000
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  // Plan yükseltme fonksiyonları
  const handlePlanUpgrade = (planType: string) => {
    setShowUpgradeModal(true);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = { ...prev };
      if (newServices[serviceId]) {
        delete newServices[serviceId];
      } else {
        newServices[serviceId] = 1;
      }
      return newServices;
    });
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedServices(prev => {
        const newServices = { ...prev };
        delete newServices[serviceId];
        return newServices;
      });
    } else {
      setSelectedServices(prev => ({
        ...prev,
        [serviceId]: quantity
      }));
    }
  };

  const calculateTotalPrice = () => {
    const planPrice = plans[selectedPlan as keyof typeof plans].pricing[billingCycle];
    const servicesPrice = Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
      const service = additionalServices[serviceId as keyof typeof additionalServices];
      return total + (service.basePrice + (service.perChange * (quantity - 1)));
    }, 0);
    return planPrice + servicesPrice;
  };

  const getServicesByPanel = (panel: string) => {
    return Object.entries(additionalServices).filter(([_, service]) => service.panel === panel);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newServices = { ...prev };
      delete newServices[serviceId];
      return newServices;
    });
  };

  const handlePaymentComplete = (paymentData: any) => {
    console.log(`💳 Ödeme tamamlandı:`, paymentData);

    // Ödeme başarılı mesajı
    alert(`${getStatic('Ödeme Başarılı! 🎉')}\n\nPlan: ${paymentData.plan}\nFaturalandırma: ${paymentData.billingCycle}\nTutar: ₺${paymentData.total.toLocaleString('tr-TR')}\nÖdeme Yöntemi: ${paymentData.method}\n\n${getStatic('Planınız aktifleştirildi!')}`);

    // Modal'ları kapat
    setShowUpgradeModal(false);
    setShowPaymentModal(false);
    setSelectedServices({});

    console.log(`✅ Ödeme işlemi tamamlandı: ${paymentData.plan}`);
  };

  const handleCancelPlan = () => {
    setShowUpgradeModal(false);
    setSelectedFeatures([]);
  };

  // Feature kontrolü
  const hasQrMenu = useFeature('qr_menu');
  const hasTableManagement = useFeature('table_management');
  const hasOrderTaking = useFeature('order_taking');
  const hasBasicReports = useFeature('basic_reports');
  const hasStockManagement = useFeature('stock_management');
  const hasAdvancedAnalytics = useFeature('advanced_analytics');

  // Gerçek verileri kullan
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Bugünkü siparişler
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfDay && orderDate <= endOfDay;
  });

  // Bugünkü ciro
  const todayRevenue = todayOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

  // Bu ayki siparişler
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfMonth;
  });

  // Aylık ciro
  const monthlyRevenue = monthlyOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

  const stats = {
    todayOrders: todayOrders.length,
    activeOrders: activeOrders.length,
    todayRevenue,
    monthlyRevenue,
    monthlyOrders: monthlyOrders.length,
    averageRating: 0, // TODO: Rating sistemi eklendiğinde
    customerSatisfaction: 0, // TODO: Memnuniyet sistemi eklendiğinde
    totalMenuItems: menuItems.length,
    activeCategories: categories.length,
    totalWaiters: 0, // TODO: Personel sistemi eklendiğinde
    activeTables: 0 // TODO: Masa sistemi eklendiğinde
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <FaBars className="text-xl text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  <TranslatedText>Kontrol Paneli</TranslatedText>
                </h2>
                <p className="text-gray-600 text-lg font-medium mt-2 hidden sm:block">
                  <TranslatedText>Hoş geldiniz</TranslatedText>, {displayName} 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <LanguageSelector enabledLanguages={useBusinessSettingsStore(s => s.settings.menuSettings.language)} />
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:scale-105 shadow-xl ${(authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium'
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:shadow-2xl'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                  }`}
              >
                <span className="hidden sm:inline">
                  {(authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium' ? <TranslatedText>Premium Plan</TranslatedText> : <TranslatedText>Premium Plan</TranslatedText>}
                </span>
                <span className="sm:hidden">
                  {(authenticatedRestaurant?.subscription?.plan || 'premium') === 'premium' ? 'P' : 'P'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-12">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <FaShoppingCart className="text-2xl text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full"><TranslatedText>Bugün</TranslatedText></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stats.todayOrders}
                </h3>
                <p className="text-gray-600 text-lg font-bold"><TranslatedText>Bugünkü Siparişler</TranslatedText></p>
                <div className="mt-4 flex items-center text-sm text-green-600 font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  <TranslatedText>Aktif durumda</TranslatedText>
                </div>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <FaChartLine className="text-2xl text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">₺</div>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  ₺{stats.todayRevenue.toLocaleString('tr-TR')}
                </h3>
                <p className="text-gray-600 text-lg font-bold"><TranslatedText>Bugünkü Ciro</TranslatedText></p>
                <div className="mt-4 flex items-center text-sm text-green-600 font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  <TranslatedText>Artış trendi</TranslatedText>
                </div>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <FaUtensils className="text-2xl text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{stats.activeCategories} <TranslatedText>kategori</TranslatedText></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  {stats.totalMenuItems}
                </h3>
                <p className="text-gray-600 text-lg font-bold"><TranslatedText>Menü Ürünleri</TranslatedText></p>
                <div className="mt-4 flex items-center text-sm text-purple-600 font-bold">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                  {stats.activeCategories} <TranslatedText>aktif kategori</TranslatedText>
                </div>
              </div>
            </div>

            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <FaUsers className="text-2xl text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">{stats.activeTables} <TranslatedText>aktif</TranslatedText></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {authenticatedRestaurant?.tableCount || 0}
                </h3>
                <p className="text-gray-600 text-lg font-bold"><TranslatedText>Toplam Masa</TranslatedText></p>
                <div className="mt-4 flex items-center text-sm text-orange-600 font-bold">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                  <TranslatedText>Masa yönetimi aktif</TranslatedText>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Aktif Siparişler */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/3 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <FaShoppingCart className="text-xl text-white" />
                    </div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                      <TranslatedText>Aktif Siparişler</TranslatedText>
                    </h3>
                  </div>
                  <Link href="/business/orders" className="text-purple-600 hover:text-purple-700 text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all duration-300 hover:scale-105">
                    <TranslatedText>Tümünü Gör →</TranslatedText>
                  </Link>
                </div>
                <div className="space-y-6">
                  {activeOrders.map(order => (
                    <div key={order.id} className="group/item flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200/50 hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center shadow-lg group-hover/item:shadow-xl transition-all duration-300">
                          <span className="font-black text-purple-600 text-xl">{order.tableNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-xl"><TranslatedText>Masa</TranslatedText> {order.tableNumber || 'N/A'}</p>
                          <p className="text-gray-600 font-bold">{order.items?.length || 0} <TranslatedText>ürün</TranslatedText> • ₺{order.totalAmount || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-black shadow-lg ${order.status === 'ready'
                          ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800'
                          : 'bg-gradient-to-r from-yellow-100 to-orange-200 text-yellow-800'
                          }`}>
                          {order.status === 'ready' ? getStatic('Hazır') : getStatic('Hazırlanıyor')}
                        </span>
                        <span className="text-sm text-gray-500 font-bold">{new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-green-500/3 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <FaRocket className="text-xl text-white" />
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 bg-clip-text text-transparent">
                    <TranslatedText>Hızlı İşlemler</TranslatedText>
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Link href="/business/menu" className="group/btn p-8 bg-gradient-to-br from-purple-50/80 to-purple-100/80 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 flex flex-col items-center justify-center gap-4 border border-purple-200/50 hover:shadow-xl hover:scale-105 backdrop-blur-sm">
                    <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/btn:shadow-2xl transition-all duration-300">
                      <FaPlus className="text-2xl text-white" />
                    </div>
                    <span className="text-base font-black text-purple-800"><TranslatedText>Yeni Ürün</TranslatedText></span>
                  </Link>
                  <Link href="/business/orders" className="group/btn p-8 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-4 border border-blue-200/50 hover:shadow-xl hover:scale-105 backdrop-blur-sm">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/btn:shadow-2xl transition-all duration-300">
                      <FaEye className="text-2xl text-white" />
                    </div>
                    <span className="text-base font-black text-blue-800"><TranslatedText>Siparişleri Gör</TranslatedText></span>
                  </Link>
                  <Link href="/business/menu" className="group/btn p-8 bg-gradient-to-br from-green-50/80 to-green-100/80 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 flex flex-col items-center justify-center gap-4 border border-green-200/50 hover:shadow-xl hover:scale-105 backdrop-blur-sm">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/btn:shadow-2xl transition-all duration-300">
                      <FaEdit className="text-2xl text-white" />
                    </div>
                    <span className="text-base font-black text-green-800"><TranslatedText>Menüyü Düzenle</TranslatedText></span>
                  </Link>
                  <button data-open-announcements onClick={() => setShowAnnModal(true)} className="group/btn p-8 bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 rounded-2xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 flex flex-col items-center justify-center gap-4 border border-yellow-200/50 hover:shadow-xl hover:scale-105 backdrop-blur-sm">
                    <div className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/btn:shadow-2xl transition-all duration-300">
                      <FaBullhorn className="text-2xl text-white" />
                    </div>
                    <span className="text-base font-black text-yellow-800"><TranslatedText>Duyurular (Aktif)</TranslatedText></span>
                  </button>
                </div>
              </div>
            </div>
            <AnnouncementQuickModal isOpen={showAnnModal} onClose={() => setShowAnnModal(false)} />
            <script dangerouslySetInnerHTML={{
              __html: `
              (function(){
                window.addEventListener('masapp:open-announcements',function(){
                  var e = document.querySelector('[data-open-announcements]');
                  if(e){ e.click(); }
                });
              })();
            `}} />
          </div>

          {/* Aylık Özet */}
          <div className="mt-16 group bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl shadow-3xl p-12 text-white hover:shadow-4xl transition-all duration-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                    <FaChartLine className="text-3xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black mb-4"><TranslatedText>Aylık Performans</TranslatedText></h3>
                    <p className="text-purple-200 text-xl font-bold">
                      {stats.monthlyOrders > 0 ? <TranslatedText>Bu ay harika gidiyorsunuz! 🚀</TranslatedText> : <TranslatedText>Henüz veri bulunmuyor 📊</TranslatedText>}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <div className="group/metric bg-white/15 backdrop-blur-xl rounded-2xl p-8 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaMoneyBillWave className="text-xl text-white" />
                    </div>
                    <div className="text-green-200 text-sm font-bold bg-green-500/20 px-3 py-1 rounded-full"><TranslatedText>Ciro</TranslatedText></div>
                  </div>
                  <p className="text-5xl font-black mb-2">₺{stats.monthlyRevenue.toLocaleString('tr-TR')}</p>
                  <p className="text-purple-200 text-lg font-bold"><TranslatedText>Aylık Ciro</TranslatedText></p>
                </div>
                <div className="group/metric bg-white/15 backdrop-blur-xl rounded-2xl p-8 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaShoppingCart className="text-xl text-white" />
                    </div>
                    <div className="text-blue-200 text-sm font-bold bg-blue-500/20 px-3 py-1 rounded-full"><TranslatedText>Sipariş</TranslatedText></div>
                  </div>
                  <p className="text-5xl font-black mb-2">{stats.monthlyOrders}</p>
                  <p className="text-purple-200 text-lg font-bold"><TranslatedText>Toplam Sipariş</TranslatedText></p>
                </div>
                <div className="group/metric bg-white/15 backdrop-blur-xl rounded-2xl p-8 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaChartBar className="text-xl text-white" />
                    </div>
                    <div className="text-yellow-200 text-sm font-bold bg-yellow-500/20 px-3 py-1 rounded-full"><TranslatedText>Puan</TranslatedText></div>
                  </div>
                  <p className="text-5xl font-black mb-2">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}</p>
                  <p className="text-purple-200 text-lg font-bold"><TranslatedText>Ortalama Puan</TranslatedText></p>
                </div>
                <div className="group/metric bg-white/15 backdrop-blur-xl rounded-2xl p-8 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUsers className="text-xl text-white" />
                    </div>
                    <div className="text-pink-200 text-sm font-bold bg-pink-500/20 px-3 py-1 rounded-full"><TranslatedText>Memnuniyet</TranslatedText></div>
                  </div>
                  <p className="text-5xl font-black mb-2">{stats.customerSatisfaction > 0 ? `${stats.customerSatisfaction}%` : '-'}</p>
                  <p className="text-purple-200 text-lg font-bold"><TranslatedText>Müşteri Memnuniyeti</TranslatedText></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gelişmiş Paket Yönetimi Modalı */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCog className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"><TranslatedText>Paket ve Hizmet Yönetimi</TranslatedText></h3>
                  <p className="text-gray-600 text-lg"><TranslatedText>İhtiyacınıza göre plan ve ek hizmetler seçin</TranslatedText></p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-3 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <FaTimes className="text-gray-500 text-2xl" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Kolon - Plan ve Hizmet Seçimi */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Mevcut Plan */}
                  <div className={`bg-gradient-to-r border-2 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${selectedPlan === 'corporate'
                    ? 'from-purple-50 via-purple-100 to-purple-200 border-purple-300'
                    : 'from-orange-50 via-orange-100 to-orange-200 border-orange-300'
                    }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${selectedPlan === 'corporate' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
                        }`}>
                        <FaCog className="text-white text-xl" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800"><TranslatedText>Mevcut Planınız</TranslatedText></h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className={`text-3xl font-bold mb-2 ${selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                          }`}>
                          {plans[selectedPlan].name}
                        </h5>
                        <p className="text-gray-700 text-lg font-medium">
                          ₺{plans[selectedPlan].pricing[billingCycle].toLocaleString('tr-TR')}
                          {billingCycle === 'monthly' ? `/${getStatic('Ay')}` :
                            billingCycle === 'sixMonths' ? `/6 ${getStatic('Ay')}` : `/${getStatic('Yıl')}`} - <TranslatedText>Aktif</TranslatedText>
                        </p>
                      </div>
                      <div className="text-right bg-white/50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 font-medium"><TranslatedText>Sonraki ödeme</TranslatedText></div>
                        <div className="font-bold text-lg">15 January 2024</div>
                      </div>
                    </div>
                  </div>

                  {/* Faturalandırma Seçimi */}
                  <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6"><TranslatedText>Faturalandırma Dönemini Değiştir</TranslatedText></h4>
                    <p className="text-gray-600 mb-6 text-lg"><TranslatedText>Faturalandırma döneminizi değiştirerek tasarruf edebilirsiniz</TranslatedText></p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${billingCycle === 'monthly'
                          ? selectedPlan === 'corporate'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                            : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className="font-bold text-lg"><TranslatedText>Aylık</TranslatedText></div>
                        <div className="text-sm text-gray-600 mb-3"><TranslatedText>Her ay ödeme</TranslatedText></div>
                        <div className={`text-2xl font-bold ${selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                          }`}>
                          ₺{plans[selectedPlan].pricing.monthly}
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingCycle('sixMonths')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${billingCycle === 'sixMonths'
                          ? selectedPlan === 'corporate'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                            : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className="font-bold text-lg"><TranslatedText>6 Aylık</TranslatedText></div>
                        <div className="text-sm text-gray-600 mb-3"><TranslatedText>%17 indirim</TranslatedText></div>
                        <div className={`text-2xl font-bold ${selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                          }`}>
                          ₺{plans[selectedPlan].pricing.sixMonths}
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${billingCycle === 'yearly'
                          ? selectedPlan === 'corporate'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg'
                            : 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className="font-bold text-lg"><TranslatedText>Yıllık</TranslatedText></div>
                        <div className="text-sm text-gray-600 mb-3"><TranslatedText>%20 indirim</TranslatedText></div>
                        <div className={`text-2xl font-bold ${selectedPlan === 'corporate' ? 'text-purple-600' : 'text-orange-600'
                          }`}>
                          ₺{plans[selectedPlan].pricing.yearly}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Ek Hizmetler */}
                  <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6"><TranslatedText>Ek Hizmetler</TranslatedText></h4>
                    <p className="text-gray-600 mb-8 text-lg">
                      <TranslatedText>Dilediğiniz ek hizmet hangi paneldeyse hemen sepete ekleyin. Birden fazla seçebilirsiniz. Örneğin mutfak panelinde kaç tane değişiklik istiyorsanız o kadar sayı seçebilirsiniz, fiyat ona göre eklenecektir.</TranslatedText>
                    </p>

                    <div className="space-y-8">
                      {['Menü', 'QR Kodlar', 'Raporlar', 'Personel', 'Siparişler', 'Genel'].map(panel => {
                        const panelServices = getServicesByPanel(panel);
                        if (panelServices.length === 0) return null;

                        return (
                          <div key={panel} className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                            <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-xl">
                              {panel === 'Menü' && <FaUtensils className="text-pink-500 text-2xl" />}
                              {panel === 'QR Kodlar' && <FaQrcode className="text-purple-500 text-2xl" />}
                              {panel === 'Raporlar' && <FaChartBar className="text-blue-500 text-2xl" />}
                              {panel === 'Personel' && <FaUsers className="text-green-500 text-2xl" />}
                              {panel === 'Siparişler' && <FaShoppingCart className="text-orange-500 text-2xl" />}
                              {panel === 'Genel' && <FaCog className="text-gray-500 text-2xl" />}
                              <TranslatedText>{`${panel} Paneli`}</TranslatedText>
                            </h5>
                            <div className="space-y-4">
                              {panelServices.map(([serviceId, service]) => (
                                <div key={serviceId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                                  <div className="flex-1">
                                    <h6 className="font-bold text-gray-800 text-lg">{service.name}</h6>
                                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                    <div className="text-sm text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full inline-block">
                                      ₺{service.basePrice} + ₺{service.perChange}/<TranslatedText>değişiklik</TranslatedText>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateServiceQuantity(serviceId, (selectedServices[serviceId] || 0) - 1)}
                                      className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-300 transition-all duration-300 hover:scale-110"
                                    >
                                      -
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg">
                                      {selectedServices[serviceId] || 0}
                                    </span>
                                    <button
                                      onClick={() => updateServiceQuantity(serviceId, (selectedServices[serviceId] || 0) + 1)}
                                      className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-110"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - Sepet ve Ödeme */}
                <div className="space-y-8">
                  {/* Sepet */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6"><TranslatedText>Sepetiniz</TranslatedText></h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200">
                        <span className="text-gray-700 font-bold text-lg">{plans[selectedPlan].name}</span>
                        <span className="font-bold text-xl text-gray-800">₺{plans[selectedPlan].pricing[billingCycle]}</span>
                      </div>
                      {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                        const service = additionalServices[serviceId as keyof typeof additionalServices];
                        const totalPrice = service.basePrice + (service.perChange * (quantity - 1));
                        return (
                          <div key={serviceId} className="flex justify-between items-center bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="flex-1">
                              <span className="text-gray-700 font-medium">{service.name}</span>
                              <span className="text-gray-500 text-sm ml-2">({quantity}x)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-gray-800">₺{totalPrice}</span>
                              <button
                                onClick={() => removeService(serviceId)}
                                className="text-red-500 hover:text-red-700 text-lg hover:scale-110 transition-all duration-300"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="border-t-2 border-gray-300 pt-4 bg-white rounded-xl p-4">
                        <div className="flex justify-between text-2xl font-bold">
                          <span className="text-gray-800"><TranslatedText>Toplam</TranslatedText></span>
                          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">₺{calculateTotalPrice().toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-2">
                          {billingCycle === 'monthly' ? getStatic('Aylık') :
                            billingCycle === 'sixMonths' ? getStatic('6 Aylık') : getStatic('Yıllık')} <TranslatedText>ödeme</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Butonu */}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <TranslatedText>Ödeme Yap</TranslatedText> (₺{calculateTotalPrice().toLocaleString('tr-TR')})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Modalı */}
      <BusinessPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={calculateTotalPrice()}
        planName={plans[selectedPlan].name}
        billingCycle={billingCycle === 'monthly' ? getStatic('Aylık') : billingCycle === 'sixMonths' ? getStatic('6 Aylık') : getStatic('Yıllık')}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
