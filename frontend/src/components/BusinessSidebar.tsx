'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaChartLine,
  FaUtensils,
  FaUsers,
  FaQrcode,
  FaChartBar,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaRocket,
  FaTruck,
  FaCashRegister,
  FaCalculator,
  FaRobot,
  FaVideo,
  FaCalendarAlt,
  FaBox,
  FaGlobe,
  FaCreditCard,
  FaBuilding,
  FaCode
} from 'react-icons/fa';
import { useFeature } from '@/hooks/useFeature';
import { useAuthStore } from '@/store/useAuthStore';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { useEffect, useState } from 'react';

interface BusinessSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function BusinessSidebar({ sidebarOpen, setSidebarOpen, onLogout }: BusinessSidebarProps) {
  const pathname = usePathname();
  const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
  const { settings } = useBusinessSettingsStore();
  const [brandColors, setBrandColors] = useState({
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#F59E0B'
  });
  
  // Feature kontrolü - Temel
  const hasQrMenu = useFeature('qr_menu');
  const hasTableManagement = useFeature('table_management');
  const hasBasicReports = useFeature('basic_reports');
  
  // Premium özellikler
  const hasAdvancedAnalytics = useFeature('advanced_analytics');
  const hasInventoryManagement = useFeature('inventory_management');
  const hasMultiLanguage = useFeature('multi_language');
  const hasPaymentIntegration = useFeature('payment_integration');
  
  // Enterprise özellikler
  const hasMultiBranch = useFeature('multi_branch');
  const hasFranchiseManagement = useFeature('franchise_management');
  const hasApiAccess = useFeature('api_access');
  const hasDataExport = useFeature('data_export');
  
  // Özel özellikler
  const hasDeliveryIntegration = useFeature('delivery_integration');
  const hasPosIntegration = useFeature('pos_integration');
  const hasAccountingSoftware = useFeature('accounting_software');
  const hasAiRecommendations = useFeature('ai_recommendations');
  const hasVideoMenu = useFeature('video_menu');
  const hasEventManagement = useFeature('event_management');

  // Brand renklerini ayarla
  useEffect(() => {
    if (settings?.branding) {
      setBrandColors({
        primary: settings.branding.primaryColor || '#3B82F6',
        secondary: settings.branding.secondaryColor || '#1D4ED8',
        accent: settings.branding.accentColor || '#F59E0B'
      });
    }
  }, [settings?.branding]);

  // Restoran bilgileri - subdomain'e göre kişiselleştir
  const getRestaurantInfo = () => {
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      switch (subdomain) {
        case 'lezzet':
          return {
            name: 'Lezzet Restaurant',
            email: 'info@lezzetrestaurant.com'
          };
        case 'kardesler':
          return {
            name: 'Kardeşler Lokantası', 
            email: 'iletisim@kardeslerlokantasi.com'
          };
        case 'pizza':
          return {
            name: 'Pizza Palace',
            email: 'orders@pizzapalace.com'
          };
        case 'cafe':
          return {
            name: 'Cafe Central',
            email: 'hello@cafecentral.com'
          };
        default:
          return {
            name: authenticatedRestaurant?.name || authenticatedStaff?.name || 'RestXQr',
            email: authenticatedRestaurant?.email || authenticatedStaff?.email || 'info@restxqr.com'
          };
      }
    }
    return {
      name: authenticatedRestaurant?.name || authenticatedStaff?.name || 'RestXQr',
      email: authenticatedRestaurant?.email || authenticatedStaff?.email || 'info@restxqr.com'
    };
  };
  
  const { name: restaurantName, email: restaurantEmail } = getRestaurantInfo();

  // Demo sayfasında mıyız?
  const isDemo = pathname?.includes('/demo-paneller/isletme');
  
  // Base path'i belirle
  const basePath = isDemo ? '/demo-paneller/isletme' : '/business';
  
  const allMenuItems = [
    {
      href: `${basePath}/dashboard`,
      icon: FaChartLine,
      label: 'Kontrol Paneli',
      active: pathname === `${basePath}/dashboard`,
      visible: isDemo ? true : true // Demo'da hepsi görünür
    },
    {
      href: `${basePath}/menu`,
      icon: FaUtensils,
      label: 'Menü Yönetimi',
      active: pathname === `${basePath}/menu`,
      visible: isDemo ? true : hasQrMenu // Demo'da hepsi görünür
    },
    {
      href: `${basePath}/staff`,
      icon: FaUsers,
      label: 'Personel',
      active: pathname === `${basePath}/staff`,
      visible: true
    },
    {
      href: `${basePath}/qr-codes`,
      icon: FaQrcode,
      label: 'QR Kodlar',
      active: pathname === `${basePath}/qr-codes`,
      visible: isDemo ? true : (hasQrMenu || hasTableManagement)
    },
    {
      href: `${basePath}/reports`,
      icon: FaChartBar,
      label: 'Raporlar',
      active: pathname === `${basePath}/reports`,
      visible: isDemo ? true : (hasBasicReports || hasAdvancedAnalytics)
    },
    {
      href: `${basePath}/settings`,
      icon: FaCog,
      label: 'Ayarlar',
      active: pathname === `${basePath}/settings`,
      visible: true
    },
    {
      href: `${basePath}/support`,
      icon: FaHeadset,
      label: 'Destek',
      active: pathname === `${basePath}/support`,
      visible: true
    },
    // Premium Özellikler
    {
      href: `${basePath}/inventory`,
      icon: FaBox,
      label: 'Stok Yönetimi',
      active: pathname === `${basePath}/inventory`,
      visible: isDemo ? true : hasInventoryManagement,
      badge: 'Premium'
    },
    // Enterprise Özellikler
    {
      href: `${basePath}/branches`,
      icon: FaBuilding,
      label: 'Şube Yönetimi',
      active: pathname === `${basePath}/branches`,
      visible: isDemo ? true : hasMultiBranch,
      badge: 'Enterprise'
    },
    {
      href: `${basePath}/api`,
      icon: FaCode,
      label: 'API Yönetimi',
      active: pathname === `${basePath}/api`,
      visible: isDemo ? true : hasApiAccess,
      badge: 'Enterprise'
    },
    // Özel Özellikler
    {
      href: `${basePath}/delivery`,
      icon: FaTruck,
      label: 'Paket Servis',
      active: pathname === `${basePath}/delivery`,
      visible: isDemo ? true : hasDeliveryIntegration,
      badge: 'Özel'
    },
    {
      href: `${basePath}/pos`,
      icon: FaCashRegister,
      label: 'POS Entegrasyonu',
      active: pathname === `${basePath}/pos`,
      visible: isDemo ? true : hasPosIntegration,
      badge: 'Özel'
    },
    {
      href: `${basePath}/accounting`,
      icon: FaCalculator,
      label: 'Muhasebe',
      active: pathname === `${basePath}/accounting`,
      visible: isDemo ? true : hasAccountingSoftware,
      badge: 'Özel'
    },
    {
      href: `${basePath}/ai`,
      icon: FaRobot,
      label: 'AI Önerileri',
      active: pathname === `${basePath}/ai`,
      visible: isDemo ? true : hasAiRecommendations,
      badge: 'Özel'
    },
    {
      href: `${basePath}/video-menu`,
      icon: FaVideo,
      label: 'Video Menü',
      active: pathname === `${basePath}/video-menu`,
      visible: isDemo ? true : hasVideoMenu,
      badge: 'Özel'
    },
    {
      href: `${basePath}/events`,
      icon: FaCalendarAlt,
      label: 'Etkinlikler',
      active: pathname === `${basePath}/events`,
      visible: isDemo ? true : hasEventManagement,
      badge: 'Özel'
    }
  ];

  // Sadece görünür menüleri filtrele
  const menuItems = allMenuItems.filter(item => item.visible);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 text-white transform transition-all duration-500 ease-in-out z-40 shadow-2xl flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          animation: 'float 20s ease-in-out infinite',
        }}></div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/10 backdrop-blur-sm bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 cursor-pointer"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
                  boxShadow: `0 10px 30px -10px ${brandColors.primary}50`
                }}
              >
                <FaRocket className="text-white text-2xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent tracking-tight">
                  {restaurantName}
                </h1>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Yönetim Paneli</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
            >
              <FaBars className="text-lg" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:translate-x-1 ${
                  item.active
                    ? 'shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                style={{
                  background: item.active 
                    ? `linear-gradient(135deg, ${brandColors.primary}20, ${brandColors.secondary}20, ${brandColors.primary}10)` 
                    : 'transparent',
                  borderLeft: item.active ? `4px solid ${brandColors.accent}` : '4px solid transparent',
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6 ${
                    item.active ? 'shadow-2xl transform scale-110' : 'group-hover:shadow-xl'
                  }`}
                  style={{
                    background: item.active 
                      ? `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`
                      : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: item.active ? `0 8px 20px -5px ${brandColors.primary}40` : 'none'
                  }}
                >
                  <Icon className={`text-xl transition-all duration-300 ${
                    item.active ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`} />
                </div>
                <span className={`text-base font-bold transition-all duration-300 ${
                  item.active ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`ml-auto px-3 py-1 text-xs font-black rounded-full backdrop-blur-sm ${
                    item.badge === 'Premium' ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border border-yellow-500/50' :
                    item.badge === 'Enterprise' ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/50' :
                    'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.active && !item.badge && (
                  <div 
                    className="ml-auto w-3 h-3 rounded-full animate-pulse shadow-lg"
                    style={{ 
                      backgroundColor: brandColors.accent,
                      boxShadow: `0 0 10px ${brandColors.accent}`
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 p-6 border-t border-white/10 backdrop-blur-sm bg-gradient-to-r from-transparent to-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 cursor-pointer"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.secondary}, ${brandColors.accent})`,
                  boxShadow: `0 10px 30px -10px ${brandColors.accent}50`
                }}
              >
                <span className="text-white font-black text-xl">
                  {restaurantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-black text-sm">{restaurantName}</p>
                <p className="text-white/50 text-xs font-semibold">{restaurantEmail}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-3 hover:bg-red-500/30 rounded-xl transition-all duration-300 hover:scale-110 group border border-transparent hover:border-red-500/50"
              title="Çıkış Yap"
            >
              <FaSignOutAlt className="text-xl text-white/60 group-hover:text-red-400 transition-all duration-300 transform group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
