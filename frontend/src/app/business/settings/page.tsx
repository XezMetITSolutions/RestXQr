'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaCog,
  FaChartLine,
  FaChartBar,
  FaQrcode,
  FaBell,
  FaPalette,
  FaUpload,
  FaSave,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWifi,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaSignOutAlt,
  FaTimes,
  FaHeadset,
  FaUtensils,
  FaUsers,
  FaImage,
  FaCreditCard,
  FaRocket,
  FaStar,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
  FaBars,
  FaCrown,
  FaPlug,
  FaGlobe,
  FaCheck,
  FaExclamationTriangle,
  FaDownload,
  FaSync,
  FaPlus,
  FaTrash,
  FaPrint,
  FaLock
} from 'react-icons/fa';
import AnnouncementQuickModal from '@/components/AnnouncementQuickModal';
import BusinessSidebar from '@/components/BusinessSidebar';
import LanguageSelector from '@/components/LanguageSelector';

import PhonePreview from '@/components/PhonePreview';
import { useAuthStore } from '@/store/useAuthStore';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
// import { useRestaurantSettings } from '@/hooks/useRestaurantSettings'; // Geçici olarak devre dışı - otomatik reset problemi


import apiService from '@/services/api';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { printReceiptViaBridge } from '@/lib/printerHelpers';

function SettingsPageContent() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();

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

  const LANGUAGE_OPTIONS = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', description: getStatic('Varsayılan dil') },
    { code: 'en', label: 'English', flag: '🇺🇸', description: getStatic('Global müşteriler için') },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', description: getStatic('Almanca menü') },
    { code: 'fr', label: 'Français', flag: '🇫🇷', description: getStatic('Fransızca menü') },
    { code: 'es', label: 'Español', flag: '🇪🇸', description: getStatic('İspanyolca menü') },
    { code: 'it', label: 'Italiano', flag: '🇮🇹', description: getStatic('İtalyanca menü') },
    { code: 'ru', label: 'Русский', flag: '🇷🇺', description: getStatic('Rusça menü') },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', description: getStatic('Arapça menü') },
    { code: 'zh', label: '中文', flag: '🇨🇳', description: getStatic('Çince menü') }
  ];

  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const {
    settings,
    accountInfo,
    stats,
    isLoading,
    activeTab,
    expandedSections,
    updateSettings,
    updateBasicInfo,
    updateBranding,
    updateStaffCredentials,
    generateStaffCredentials,
    updateMenuSettings,
    updatePaymentSettings,
    updateTechnicalSettings,
    updateCustomerExperience,
    updateNotificationSettings,
    updateIntegrations,
    updateSecuritySettings,
    updateBackupSettings,
    updatePrinterSettings,
    updateAccountInfo,
    setActiveTab,
    toggleSection,
    setLoading,
    exportSettings,
    validateSubdomain,
    fetchSettings,
    saveSettings,
    uploadLogo
  } = useBusinessSettingsStore();

  const [isClient, setIsClient] = useState(false);

  // Sayfa yüklendiğinde auth'u initialize et ve ayarları çek
  useEffect(() => {
    setIsClient(true);
    initializeAuth();
    fetchSettings();
  }, [initializeAuth, fetchSettings]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [subdomainValidation, setSubdomainValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    message: string;
  }>({ isValid: true, isChecking: false, message: '' });

  // Emoji picker dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null);
      }
    };

    if (showEmojiPicker !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);


  // Popüler emojiler listesi
  const popularEmojis = ['⭐', '🎉', '🍲', '🍕', '🍔', '🍟', '🌮', '🌯', '🥗', '🍝', '🍜', '🍱', '🍣', '🍤', '🍗', '🍖', '🥩', '🍳', '🥘', '🍲', '🥣', '🍨', '🍧', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🥤', '🍹', '🍸', '🍷', '🍺', '☕', '🥛', '💯', '🔥', '✨', '🎊', '🎈', '🎁', '🏆', '🥇', '💎', '🌟', '💫', '🎯', '🎪'];

  // Simple integration connect modal state
  const [integrationModal, setIntegrationModal] = useState<null | { name: string }>(null);

  // Yazıcı önizleme tipi
  const [previewType, setPreviewType] = useState<'kitchen' | 'customer'>('kitchen');

  // Service counts state for one-time services
  const [serviceCounts, setServiceCounts] = useState({
    personel: 0,
    siparis: 0,
    genel: 0,
    menu: 0,
    qr: 0,
    rapor: 0
  });

  const setServiceCount = (service: keyof typeof serviceCounts, count: number) => {
    setServiceCounts(prev => ({
      ...prev,
      [service]: count
    }));
  };

  const selectedLanguages = settings?.menuSettings?.language || ['tr'];

  const toggleLanguage = (code: string) => {
    const current = settings?.menuSettings?.language || ['tr'];
    if (current.includes(code)) {
      if (current.length === 1) {
        alert(getStatic('En az bir dil aktif olmalı.'));
        return;
      }
      updateMenuSettings({ language: current.filter(lang => lang !== code) });
    } else {
      updateMenuSettings({ language: [...current, code] });
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Restaurant bilgilerini settings'e senkronize et
  useEffect(() => {
    if (authenticatedRestaurant) {
      // Admin panelinden gelen restaurant bilgilerini settings'e aktar
      // Sadece boş olan alanları doldur, kullanıcı değiştirdiyse üzerine yazma
      const updates: any = {};

      if (!settings?.basicInfo?.name && authenticatedRestaurant.name) {
        updates.name = authenticatedRestaurant.name;
      }
      if (!settings?.basicInfo?.subdomain && authenticatedRestaurant.username) {
        updates.subdomain = authenticatedRestaurant.username;
      }
      if (!settings?.basicInfo?.address && authenticatedRestaurant.address) {
        updates.address = authenticatedRestaurant.address;
      }
      if (!settings?.basicInfo?.phone && authenticatedRestaurant.phone) {
        updates.phone = authenticatedRestaurant.phone;
      }
      if (!settings?.basicInfo?.email && authenticatedRestaurant.email) {
        updates.email = authenticatedRestaurant.email;
      }

      if (Object.keys(updates).length > 0) {
        updateBasicInfo(updates);
      }

      // Logo varsa ve settings'de logo yoksa branding'e ekle
      if (authenticatedRestaurant.logo && !settings?.branding?.logo) {
        updateBranding({
          logo: authenticatedRestaurant.logo
        });
      }

      // Renkler varsa ve settings'de yoksa branding'e ekle
      if (authenticatedRestaurant.primaryColor && !settings?.branding?.primaryColor) {
        updateBranding({
          primaryColor: authenticatedRestaurant.primaryColor
        });
      }
      if (authenticatedRestaurant.secondaryColor && !settings?.branding?.secondaryColor) {
        updateBranding({
          secondaryColor: authenticatedRestaurant.secondaryColor
        });
      }
    }
  }, [authenticatedRestaurant?.id]); // Sadece restaurant değiştiğinde çalışsın

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast notification could be added here
  };

  // Payment UI state
  type BillingCycle = 'monthly' | 'semiannual' | 'annual';
  type PlanId = 'free' | 'premium';
  type ExtraId = 'extraUsers' | 'aiMenuTranslate' | 'prioritySupport' | 'customDomain' | 'apiAccess';
  type MonthlyServiceId = 'extraUsers' | 'aiMenuTranslate' | 'prioritySupport';
  type OneTimeServiceId = 'customDomain' | 'apiAccess';
  type IntegrationServiceId = 'posIntegration' | 'accountingIntegration';

  const PLANS: Record<PlanId, { name: string; priceMonthly: number; features: string[]; description?: string; highlight?: boolean }> = {
    free: { name: getStatic('Ücretsiz Plan'), priceMonthly: 0, features: [getStatic('Temel menü'), getStatic('Sınırlı görüntüleme')], description: getStatic('Başlamak için ideal') },
    premium: { name: getStatic('Premium Paket'), priceMonthly: 4980, features: [getStatic('Sınırsız kategori'), getStatic('Çoklu şube'), getStatic('Gelişmiş raporlar')], highlight: true },
  };
  const BILLING: Record<BillingCycle, { months: number; discount: number; label: string }> = {
    monthly: { months: 1, discount: 0, label: getStatic('Aylık') },
    semiannual: { months: 6, discount: 0.17, label: getStatic('6 Aylık') },
    annual: { months: 12, discount: 0.2, label: getStatic('Yıllık') },
  };

  // Service definitions
  const EXTRAS: Record<ExtraId, { name: string; desc: string; priceMonthly: number }> = {
    extraUsers: { name: getStatic('Ek Kullanıcı'), desc: getStatic('Her 5 kullanıcı için'), priceMonthly: 500 },
    aiMenuTranslate: { name: getStatic('AI Menü Çevirisi'), desc: getStatic('Otomatik çoklu dil desteği'), priceMonthly: 200 },
    prioritySupport: { name: getStatic('Öncelikli Destek'), desc: getStatic('7/24 öncelikli müşteri desteği'), priceMonthly: 300 },
    customDomain: { name: getStatic('Özel Domain'), desc: getStatic('Kendi domain adresiniz'), priceMonthly: 100 },
    apiAccess: { name: getStatic('API Erişimi'), desc: getStatic('Gelişmiş API entegrasyonları'), priceMonthly: 400 },
  };

  const MONTHLY_SERVICES: Record<MonthlyServiceId, { name: string; priceMonthly: number; desc: string; icon: any }> = {
    extraUsers: { name: getStatic('Ek Kullanıcı'), priceMonthly: 500, desc: getStatic('+10 kullanıcı'), icon: '👥' },
    aiMenuTranslate: { name: getStatic('AI Menü Çevirisi'), priceMonthly: 200, desc: getStatic('Sınırsız çeviri'), icon: '🤖' },
    prioritySupport: { name: getStatic('Öncelikli Destek'), priceMonthly: 300, desc: getStatic('7/24 destek'), icon: '🎧' },
  };

  const ONETIME_SERVICES: Record<OneTimeServiceId, { name: string; basePrice: number; changePrice: number; desc: string; icon: any }> = {
    customDomain: { name: getStatic('Özel Domain'), basePrice: 1000, changePrice: 0, desc: getStatic('Kendi domain adresiniz'), icon: '🌐' },
    apiAccess: { name: getStatic('API Erişimi'), basePrice: 2000, changePrice: 0, desc: getStatic('Gelişmiş API entegrasyonları'), icon: '🔌' },
  };

  const INTEGRATION_SERVICES: Record<IntegrationServiceId, { name: string; price: number; desc: string; icon: any }> = {
    posIntegration: { name: getStatic('POS Entegrasyonu'), price: 1500, desc: getStatic('Sunmi/Ingenico vb.'), icon: '💳' },
    accountingIntegration: { name: getStatic('Muhasebe Entegrasyonu'), price: 1200, desc: getStatic('Logo/Netsis/Mikro'), icon: '📊' },
  };

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('premium');
  const [billingCycleUI, setBillingCycleUI] = useState<BillingCycle>('monthly');
  const [selectedExtras, setSelectedExtras] = useState<Record<ExtraId, boolean>>({
    extraUsers: false,
    aiMenuTranslate: false,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
  });
  const [selectedMonthlyServices, setSelectedMonthlyServices] = useState<Record<MonthlyServiceId, boolean>>({
    extraUsers: false,
    aiMenuTranslate: false,
    prioritySupport: false,
  });
  const [selectedOneTimeServices, setSelectedOneTimeServices] = useState<Record<OneTimeServiceId, boolean>>({
    customDomain: false,
    apiAccess: false,
  });
  const [selectedIntegrationServices, setSelectedIntegrationServices] = useState<Record<IntegrationServiceId, boolean>>({
    posIntegration: false,
    accountingIntegration: false,
  });

  const planMonthly = PLANS[selectedPlan].priceMonthly;
  const months = BILLING[billingCycleUI].months;

  // Calculate pricing
  const extrasMonthly = Object.entries(selectedExtras)
    .filter(([, selected]) => selected)
    .reduce((total, [id]) => total + EXTRAS[id as ExtraId].priceMonthly, 0);

  const monthlyServicesTotal = Object.entries(selectedMonthlyServices)
    .filter(([, selected]) => selected)
    .reduce((total, [id]) => total + MONTHLY_SERVICES[id as MonthlyServiceId].priceMonthly, 0);

  const oneTimeServicesTotal = Object.entries(selectedOneTimeServices)
    .filter(([, selected]) => selected)
    .reduce((total, [id]) => total + ONETIME_SERVICES[id as OneTimeServiceId].basePrice, 0);

  const integrationServicesTotal = Object.entries(selectedIntegrationServices)
    .filter(([, selected]) => selected)
    .reduce((total, [id]) => total + INTEGRATION_SERVICES[id as IntegrationServiceId].price, 0);

  const totalMonthly = planMonthly + extrasMonthly + monthlyServicesTotal;
  const discount = totalMonthly * BILLING[billingCycleUI].discount * BILLING[billingCycleUI].months;
  const grand = Math.round((totalMonthly * BILLING[billingCycleUI].months) - discount + oneTimeServicesTotal + integrationServicesTotal);

  const startCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          billing: billingCycleUI,
          items: [
            { name: PLANS[selectedPlan].name, unit_amount: planMonthly },
            ...Object.entries(selectedMonthlyServices)
              .filter(([, v]) => v)
              .map(([id]) => ({ name: MONTHLY_SERVICES[id as MonthlyServiceId].name, unit_amount: MONTHLY_SERVICES[id as MonthlyServiceId].priceMonthly })),
            ...Object.entries(selectedOneTimeServices)
              .filter(([, v]) => v)
              .map(([id]) => ({ name: ONETIME_SERVICES[id as OneTimeServiceId].name, unit_amount: ONETIME_SERVICES[id as OneTimeServiceId].basePrice })),
            ...Object.entries(selectedIntegrationServices)
              .filter(([, v]) => v)
              .map(([id]) => ({ name: INTEGRATION_SERVICES[id as IntegrationServiceId].name, unit_amount: INTEGRATION_SERVICES[id as IntegrationServiceId].price })),
          ],
        }),
      });
      if (!response.ok) throw new Error('stripe_disabled');
      const data = await response.json();
      if (data?.url) window.location.href = data.url; else throw new Error('no_url');
    } catch {
      alert(getStatic('Canlı ödeme yapılandırılmadı. Demo akışında başarıya yönlendirileceksiniz.'));
      window.location.href = '/admin/payment/success';
    }
  };

  const handleSave = async (section: string) => {
    setLoading(true);
    console.log(`💾 ${section} ayarları kaydediliyor...`);

    try {
      // Backend'e kaydet
      await saveSettings();
      console.log(`✅ ${section} ayarları kaydedildi`);
      alert(getStatic('Ayarlar başarıyla kaydedildi.'));
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error);
      alert(getStatic('Ayarlar kaydedilirken bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  // Tek alan kaydetme fonksiyonu
  const handleSaveField = async (fieldName: string, value: any) => {
    console.log(`💾 ${fieldName} alanı kaydediliyor:`, value);

    try {
      // Store'u güncelle
      if (fieldName in (settings?.basicInfo || {})) {
        updateBasicInfo({ [fieldName]: value });
      }

      // Backend'e kaydet
      await saveSettings();
      console.log(`✅ ${fieldName} alanı kaydedildi`);
    } catch (error) {
      console.error('❌ Alan kaydetme hatası:', error);
    }
  };

  const handleSubdomainChange = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainValidation({ isValid: false, isChecking: false, message: getStatic('Subdomain en az 3 karakter olmalıdır') });
      return;
    }

    setSubdomainValidation({ isValid: false, isChecking: true, message: getStatic('Kontrol ediliyor...') });

    try {
      const isValid = await validateSubdomain(subdomain);
      setSubdomainValidation({
        isValid,
        isChecking: false,
        message: isValid ? getStatic('Subdomain kullanılabilir') : getStatic('Bu subdomain zaten kullanımda')
      });
    } catch (error) {
      setSubdomainValidation({
        isValid: false,
        isChecking: false,
        message: getStatic('Kontrol sırasında hata oluştu')
      });
    }
  };

  const BRIDGE_URL = 'http://localhost:3005';

  const handleTestPrint = async (type: 'kitchen' | 'customer' = previewType) => {
    const ip = settings?.printerSettings?.testIpAddress;
    if (!ip) {
      alert(getStatic('Lütfen geçerli bir IP adresi girin.'));
      return;
    }

    try {
      const dummyData = {
        orderNumber: "8521-4569",
        tableNumber: "1",
        checkNumber: "50",
        staffName: "Sukru",
        logo: settings.branding?.logo || authenticatedRestaurant?.logo,
        type: type === 'kitchen' ? 'KITCHEN' : 'BILL',
        header: type === 'kitchen' ? (settings.printerSettings?.kitchenHeader || settings.basicInfo?.name) : (settings.printerSettings?.customerHeader || settings.basicInfo?.name),
        footer: type === 'kitchen' ? settings.printerSettings?.kitchenFooter : settings.printerSettings?.customerFooter,
        showPrices: type === 'customer' ? settings.printerSettings?.showPricesOnCustomer : false,
        subtotal: 65.00,
        items: [
          { name: "Sprite", quantity: 1, price: 65.00 }
        ],
        taxDetails: {
          name: "Icecek",
          rate: 10,
          amount: 5.91,
          net: 59.09
        },
        total: 65.00
      };

      const success = await printReceiptViaBridge(BRIDGE_URL, ip, dummyData as any);

      if (success) {
        alert(`${getStatic('✅ Test yazdırma başarılı!')} (${type === 'kitchen' ? getStatic('Mutfak') : getStatic('Kasa')})`);
      } else {
        throw new Error('Local bridge request failed');
      }
    } catch (error: any) {
      console.error('Test print error:', error);
      alert(`${getStatic('❌ Test yazdırma hatası')}: ${error.message}\n${getStatic('Local Printer Bridge (Port 3005) çalışıyor mu?')}`);
    }
  };

  const handleRestaurantPasswordChange = async () => {
    if (!accountInfo.currentPassword || !accountInfo.newPassword) {
      alert(getStatic('Tüm alanları doldurun.'));
      return;
    }

    if (accountInfo.newPassword !== accountInfo.confirmPassword) {
      alert(getStatic('Yeni şifreler eşleşmiyor.'));
      return;
    }

    if (accountInfo.newPassword.length < 6) {
      alert(getStatic('Şifre en az 6 karakter olmalıdır.'));
      return;
    }

    setLoading(true);
    try {
      const restaurantId = authenticatedRestaurant?.id;
      console.log('🗝️ Changing password for restaurant ID:', restaurantId);
      if (!restaurantId) throw new Error('Restaurant ID not found');

      const response = await apiService.changeRestaurantPassword(
        restaurantId,
        accountInfo.currentPassword,
        accountInfo.newPassword
      );

      if (response.success) {
        alert(getStatic('Şifreniz başarıyla değiştirildi.'));
        updateAccountInfo({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(response.message || getStatic('Şifre değiştirilemedi.'));
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      alert(getStatic('Şifre değiştirilirken bir hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: getStatic('Genel Ayarlar'), icon: FaCog },
    { id: 'branding', name: getStatic('Görsel Kimlik'), icon: FaPalette },
    { id: 'languages', name: getStatic('Diller'), icon: FaGlobe },
    { id: 'payment', name: getStatic('Ödeme Yöntemleri'), icon: FaCreditCard },
    { id: 'printer', name: getStatic('Yazıcı Ayarları'), icon: FaPrint },
    { id: 'security', name: getStatic('Güvenlik'), icon: FaLock }
    // Ödeme & Abonelik, Entegrasyonlar, Bildirimler - Kaldırıldı
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Integration Connect Modal */}
      {integrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIntegrationModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{integrationModal.name} <TranslatedText>Bağlantısı</TranslatedText></h3>
                <p className="text-sm text-gray-600 mt-1"><TranslatedText>Test aşamasında bilgileri buraya gireceksiniz. Şimdilik sahte verilerle bağlantıyı simüle ediyoruz.</TranslatedText></p>
              </div>
              <button onClick={() => setIntegrationModal(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Sağlayıcı</TranslatedText></label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option><TranslatedText>Seçiniz (ör. Sunmi / Ingenico / Netsis / Logo)</TranslatedText></option>
                  <option><TranslatedText>Demo Sağlayıcı</TranslatedText></option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>API Anahtarı / Kimlik</TranslatedText></label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder={getStatic('Testte paylaşacağınız anahtar')} />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setIntegrationModal(null)} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"><TranslatedText>Vazgeç</TranslatedText></button>
              <button onClick={() => { alert(getStatic('Bağlantı testi başarılı (demo)')); setIntegrationModal(null); }} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"><TranslatedText>Bağla</TranslatedText></button>
            </div>
          </div>
        </div>
      )}
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      {/* Main Content */}
      <div className="ml-0 lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaBars className="text-lg text-gray-600" />
              </button>
              <button className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg">
                <FaCog className="text-xl text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-800"><TranslatedText>Ayarlar</TranslatedText></h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block"><TranslatedText>İşletme ayarlarınızı yönetin</TranslatedText></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector enabledLanguages={settings?.menuSettings?.language} />
              <button
                onClick={() => setShowAnnModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <span>📰</span>
                <TranslatedText>Duyurular</TranslatedText>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-3 sm:p-6 lg:p-8">
          <AnnouncementQuickModal isOpen={showAnnModal} onClose={() => setShowAnnModal(false)} />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sol Kolon - Tab Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4"><TranslatedText>Ayarlar</TranslatedText></h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="mr-3" />
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Sağ Kolon - Tab Content */}
            <div className="lg:col-span-3">
              {/* Genel Ayarlar */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Hızlı Başlangıç Rehberi */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaQrcode className="text-2xl text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2"><TranslatedText>RestXQr'e Hoş Geldiniz!</TranslatedText></h3>
                        <p className="text-purple-700 text-sm mb-4">
                          <TranslatedText>İşletmenizi RestXQr ile dijitalleştirin.</TranslatedText>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const subdomain = authenticatedRestaurant?.username || settings?.basicInfo?.subdomain || 'kroren';
                              window.open(`https://${subdomain}.restxqr.com/menu`, '_blank');
                            }}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                          >
                            <FaQrcode className="inline mr-1" /> <TranslatedText>QR Kod Menü</TranslatedText>
                          </button>
                          <button
                            onClick={() => window.open('/business/kitchen', '_blank')}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
                          >
                            <FaUtensils className="inline mr-1" /> <TranslatedText>Mutfak Paneli</TranslatedText>
                          </button>
                          <button
                            onClick={() => window.open('/business/waiter', '_blank')}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            <FaUsers className="inline mr-1" /> <TranslatedText>Garson Paneli</TranslatedText>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* İşletme Bilgileri */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800"><TranslatedText>İşletme Bilgileri</TranslatedText></h3>
                      <button
                        onClick={() => handleSave('basicInfo')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        <TranslatedText>Kaydet</TranslatedText>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>İşletme Adı *</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={settings?.basicInfo?.name}
                            onChange={(e) => updateBasicInfo({ name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('İşletme Adı')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>İşletme Türü *</TranslatedText>
                          </label>
                          <select
                            value={settings?.basicInfo?.businessType}
                            onChange={(e) => updateBasicInfo({ businessType: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="cafe"><TranslatedText>Cafe & Kahvehane</TranslatedText></option>
                            <option value="restaurant"><TranslatedText>Restoran</TranslatedText></option>
                            <option value="fastfood"><TranslatedText>Fast Food</TranslatedText></option>
                            <option value="bar"><TranslatedText>Bar & Pub</TranslatedText></option>
                            <option value="bakery"><TranslatedText>Fırın & Pastane</TranslatedText></option>
                            <option value="pizzeria"><TranslatedText>Pizzeria</TranslatedText></option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1"><TranslatedText>İşletme türü menü tasarımını ve özelliklerini etkiler.</TranslatedText></p>
                        </div>
                      </div>

                      {/* Subdomain - Read Only */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Subdomain</TranslatedText>
                          <span className="ml-2 text-xs text-gray-500">(<TranslatedText>Değiştirilemez</TranslatedText>)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={settings?.basicInfo?.subdomain || authenticatedRestaurant?.username || ''}
                              readOnly
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                              placeholder="aksaray"
                            />
                          </div>
                          <span className="text-gray-500 font-medium">.restxqr.com</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <TranslatedText>Menü adresiniz:</TranslatedText> <span className="font-medium text-purple-600">https://{settings?.basicInfo?.subdomain || authenticatedRestaurant?.username || 'aksaray'}.restxqr.com</span>
                        </p>
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <FaExclamationTriangle size={12} />
                          <TranslatedText>Subdomain değişikliği için lütfen destek ekibi ile iletişime geçin.</TranslatedText>
                        </p>
                      </div>

                      {/* Açıklama ve Slogan */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Açıklama</TranslatedText>
                          </label>
                          <textarea
                            value={settings?.basicInfo?.description}
                            onChange={(e) => updateBasicInfo({ description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={3}
                            placeholder={getStatic('Örn: Lezzetin Adresi')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Slogan</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={settings?.basicInfo?.slogan || ''}
                            onChange={(e) => updateBasicInfo({ slogan: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('Örn: En taze malzemelerle...')}
                          />
                        </div>
                      </div>

                      {/* İletişim Bilgileri */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-800"><TranslatedText>İletişim Bilgileri</TranslatedText></h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Adres</TranslatedText>
                          </label>
                          <textarea
                            value={settings?.basicInfo?.address}
                            onChange={(e) => updateBasicInfo({ address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={2}
                            placeholder={getStatic('Açık adresiniz')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Telefon</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={settings?.basicInfo?.phone}
                            onChange={(e) => updateBasicInfo({ phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('Telefon numaranız')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>E-posta</TranslatedText>
                          </label>
                          <input
                            type="email"
                            value={settings?.basicInfo?.email}
                            onChange={(e) => updateBasicInfo({ email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('E-posta adresiniz')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Web Sitesi</TranslatedText>
                          </label>
                          <input
                            type="url"
                            value={settings?.basicInfo?.website || ''}
                            onChange={(e) => updateBasicInfo({ website: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('Web sitenizin adresi')}
                          />
                        </div>
                      </div>

                      {/* WiFi Bilgileri */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                          <FaWifi />
                          <TranslatedText>WiFi Şifresi</TranslatedText>
                        </h4>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={settings?.basicInfo?.wifiPassword || ''}
                            onChange={(e) => updateBasicInfo({ wifiPassword: e.target.value })}
                            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={getStatic('Ücretsiz Wi-Fi şifresi: 12345678')}
                          />
                          <button
                            onClick={() => handleSaveField('wifiPassword', settings?.basicInfo?.wifiPassword)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title={getStatic('WiFi Şifresini Kaydet')}
                          >
                            <FaSave size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showWifiInMenu"
                            checked={settings?.basicInfo?.showWifiInMenu || false}
                            onChange={(e) => {
                              updateBasicInfo({ showWifiInMenu: e.target.checked });
                              handleSaveField('showWifiInMenu', e.target.checked);
                            }}
                            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showWifiInMenu" className="text-sm text-blue-800">
                            <TranslatedText>Menüde WiFi şifresini göster</TranslatedText>
                          </label>
                        </div>
                      </div>

                      {/* Çalışma Saatleri */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-800 flex items-center gap-2">
                            <TranslatedText>Çalışma Saatleri (7 Gün)</TranslatedText>
                          </h4>
                          <button
                            onClick={() => handleSaveField('workingHours', settings?.basicInfo?.workingHours)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <TranslatedText>Çalışma Saatlerini Kaydet</TranslatedText>
                          </button>
                        </div>
                        <div className="space-y-3 mb-4">
                          {[
                            { key: 'monday', label: getStatic('Pazartesi'), day: 'monday' },
                            { key: 'tuesday', label: getStatic('Salı'), day: 'tuesday' },
                            { key: 'wednesday', label: getStatic('Çarşamba'), day: 'wednesday' },
                            { key: 'thursday', label: getStatic('Perşembe'), day: 'thursday' },
                            { key: 'friday', label: getStatic('Cuma'), day: 'friday' },
                            { key: 'saturday', label: getStatic('Cumartesi'), day: 'saturday' },
                            { key: 'sunday', label: getStatic('Pazar'), day: 'sunday' }
                          ].map((dayInfo) => {
                            const workingHours = settings?.basicInfo?.workingHours ?
                              (typeof settings?.basicInfo?.workingHours === 'string'
                                ? JSON.parse(settings?.basicInfo?.workingHours || '{}')
                                : settings?.basicInfo?.workingHours)
                              : {};
                            const dayData = workingHours[dayInfo.key] || { isOpen: true, openTime: '09:00', closeTime: '22:00' };

                            return (
                              <div key={dayInfo.key} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="w-24 text-sm font-medium text-gray-700">{dayInfo.label}</div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={dayData.isOpen !== false}
                                    onChange={(e) => {
                                      const newHours = { ...workingHours };
                                      newHours[dayInfo.key] = { ...dayData, isOpen: e.target.checked };
                                      updateBasicInfo({ workingHours: JSON.stringify(newHours) });
                                    }}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-xs text-gray-500 w-12"><TranslatedText>Açık</TranslatedText></span>
                                </div>
                                {dayData.isOpen !== false && (
                                  <>
                                    <input
                                      type="time"
                                      value={dayData.openTime || '09:00'}
                                      onChange={(e) => {
                                        const newHours = { ...workingHours };
                                        newHours[dayInfo.key] = { ...dayData, openTime: e.target.value };
                                        updateBasicInfo({ workingHours: JSON.stringify(newHours) });
                                      }}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                      type="time"
                                      value={dayData.closeTime || '22:00'}
                                      onChange={(e) => {
                                        const newHours = { ...workingHours };
                                        newHours[dayInfo.key] = { ...dayData, closeTime: e.target.value };
                                        updateBasicInfo({ workingHours: JSON.stringify(newHours) });
                                      }}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                                    />
                                  </>
                                )}
                                {dayData.isOpen === false && (
                                  <span className="text-sm text-gray-400"><TranslatedText>Kapalı</TranslatedText></span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showHoursInMenu"
                            checked={settings?.basicInfo?.showHoursInMenu || false}
                            onChange={(e) => {
                              updateBasicInfo({ showHoursInMenu: e.target.checked });
                              handleSaveField('showHoursInMenu', e.target.checked);
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="showHoursInMenu" className="text-sm text-gray-700">
                            <TranslatedText>Menüde çalışma saatlerini göster</TranslatedText>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 pl-6">
                          <TranslatedText>Çalışma saatleri menünün alt kısmında gösterilecektir.</TranslatedText>
                        </p>
                      </div>

                      {/* Google Değerlendirme */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">
                              <TranslatedText>Google Değerlendirme</TranslatedText>
                            </h4>
                            <p className="text-sm text-gray-600">
                              <TranslatedText>Müşterilerin Google'da işletmenizi değerlendirmesini sağlayın</TranslatedText>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <TranslatedText>Google Değerlendirme URL'si</TranslatedText>
                            </label>
                            <input
                              type="url"
                              value={settings?.basicInfo?.googleReviewLink || ''}
                              onChange={(e) => updateBasicInfo({ googleReviewLink: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              placeholder="https://www.google.com/maps/place/restoranadi/reviews"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              <TranslatedText>Google Maps'teki işletmenizin değerlendirme sayfası URL'si</TranslatedText>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="showReviewInMenu"
                              checked={settings?.basicInfo?.showReviewInMenu || false}
                              onChange={(e) => updateBasicInfo({ showReviewInMenu: e.target.checked })}
                              className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor="showReviewInMenu" className="text-sm text-gray-700">
                              <TranslatedText>Menüde Google değerlendirme butonunu göster</TranslatedText>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 pl-6">
                            <TranslatedText>Müşteriler menünün alt kısmında "Google'da Değerlendir" butonunu görebilecek</TranslatedText>
                          </p>
                        </div>
                      </div>

                      {/* Menü Özel İçerik */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <span className="text-2xl">🎉</span>
                              Menü Özel İçerikler
                            </h4>
                            <p className="text-sm text-gray-600 mt-2">Müşteri menüsünde gösterilen günlük duyurular ve özel içerikler</p>
                          </div>
                          <button
                            onClick={() => {
                              const currentContents = settings?.basicInfo?.menuSpecialContents || [];
                              const newContent = {
                                id: Date.now().toString(),
                                emoji: '⭐',
                                title: '',
                                description: ''
                              };
                              updateBasicInfo({ menuSpecialContents: [...currentContents, newContent] });
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <FaPlus />
                            <TranslatedText>Yeni İçerik Ekle</TranslatedText>
                          </button>
                        </div>

                        {/* Dinamik İçerikler */}
                        {(!settings?.basicInfo?.menuSpecialContents || settings?.basicInfo?.menuSpecialContents.length === 0) ? (
                          <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4"><TranslatedText>Henüz içerik eklenmemiş</TranslatedText></p>
                            <button
                              onClick={() => {
                                const newContent = {
                                  id: Date.now().toString(),
                                  emoji: '⭐',
                                  title: '',
                                  description: ''
                                };
                                updateBasicInfo({ menuSpecialContents: [newContent] });
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                            >
                              <FaPlus />
                              <TranslatedText>İlk İçeriği Ekle</TranslatedText>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(settings?.basicInfo?.menuSpecialContents || []).map((content: any, index: number) => (
                              <div key={content.id || index} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative" ref={emojiPickerRef}>
                                      <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}
                                        className="w-12 h-12 text-2xl border border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center bg-white cursor-pointer"
                                        title={getStatic('Emoji Seç')}
                                      >
                                        {content.emoji || '⭐'}
                                      </button>
                                      {showEmojiPicker === index && (
                                        <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-64 max-h-64 overflow-y-auto">
                                          <div className="grid grid-cols-8 gap-2">
                                            {popularEmojis.map((emoji) => (
                                              <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => {
                                                  const contents = [...(settings?.basicInfo?.menuSpecialContents || [])];
                                                  contents[index] = { ...contents[index], emoji: emoji };
                                                  updateBasicInfo({ menuSpecialContents: contents });
                                                  setShowEmojiPicker(null);
                                                }}
                                                className="w-8 h-8 text-xl hover:bg-purple-100 rounded transition-colors flex items-center justify-center"
                                              >
                                                {emoji}
                                              </button>
                                            ))}
                                          </div>
                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                            <input
                                              type="text"
                                              value={content.emoji || '⭐'}
                                              onChange={(e) => {
                                                const contents = [...(settings?.basicInfo?.menuSpecialContents || [])];
                                                contents[index] = { ...contents[index], emoji: e.target.value };
                                                updateBasicInfo({ menuSpecialContents: contents });
                                              }}
                                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                              placeholder="Emoji yazın veya seçin"
                                              maxLength={2}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <TranslatedText>Başlık</TranslatedText>
                                      </label>
                                      <input
                                        type="text"
                                        value={content.title || ''}
                                        onChange={(e) => {
                                          const contents = [...(settings?.basicInfo?.menuSpecialContents || [])];
                                          contents[index] = { ...contents[index], title: e.target.value };
                                          updateBasicInfo({ menuSpecialContents: contents });
                                        }}
                                        placeholder={getStatic('Örn: Bugüne Özel!')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const contents = (settings?.basicInfo?.menuSpecialContents || []).filter((_: any, i: number) => i !== index);
                                      updateBasicInfo({ menuSpecialContents: contents });
                                    }}
                                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={getStatic('Sil')}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <TranslatedText>Detaylı Açıklama</TranslatedText>
                                  </label>
                                  <input
                                    type="text"
                                    value={content.description || ''}
                                    onChange={(e) => {
                                      const contents = [...(settings?.basicInfo?.menuSpecialContents || [])];
                                      contents[index] = { ...contents[index], description: e.target.value };
                                      updateBasicInfo({ menuSpecialContents: contents });
                                    }}
                                    placeholder={getStatic('Örn: Tüm tatlılarda %20 indirim - Sadece bugün geçerli')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSaveField('menuSpecialContents', settings?.basicInfo?.menuSpecialContents)}
                                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  <FaSave size={14} className="inline mr-2" />
                                  <TranslatedText>Kaydet</TranslatedText>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            💡 <TranslatedText>Bu içerikler müşteri menüsünün en üstünde slider olarak gösterilecektir.</TranslatedText>
                          </p>
                        </div>
                      </div>

                      {/* Sosyal Medya Linkleri */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-800"><TranslatedText>Sosyal Medya Linkleri</TranslatedText></h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Facebook</TranslatedText>
                          </label>
                          <input
                            type="url"
                            value={settings?.basicInfo?.facebook || ''}
                            onChange={(e) => updateBasicInfo({ facebook: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('Facebook profil linkiniz')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Instagram</TranslatedText>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={settings?.basicInfo?.instagram || ''}
                              onChange={(e) => updateBasicInfo({ instagram: e.target.value })}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder={getStatic('Instagram profil linkiniz')}
                            />
                            <button
                              onClick={() => handleSaveField('instagram', settings?.basicInfo?.instagram)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title={getStatic('Instagram Linkini Kaydet')}
                            >
                              <FaSave size={14} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="showInstagramInMenu"
                              checked={settings?.basicInfo?.showInstagramInMenu || false}
                              onChange={(e) => {
                                updateBasicInfo({ showInstagramInMenu: e.target.checked });
                                handleSaveField('showInstagramInMenu', e.target.checked);
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="showInstagramInMenu" className="text-sm text-gray-600">
                              <TranslatedText>Menüde Instagram linkini göster</TranslatedText>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Twitter</TranslatedText>
                          </label>
                          <input
                            type="url"
                            value={settings?.basicInfo?.twitter || ''}
                            onChange={(e) => updateBasicInfo({ twitter: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={getStatic('Twitter profil linkiniz')}
                          />
                        </div>
                      </div>

                      {/* Durum */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Durum</TranslatedText>
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="status"
                              value="active"
                              checked={settings?.basicInfo?.status === 'active'}
                              onChange={(e) => updateBasicInfo({ status: e.target.value as any })}
                              className="text-purple-600"
                            />
                            <span className="text-sm font-medium"><TranslatedText>Aktif</TranslatedText></span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="status"
                              value="inactive"
                              checked={settings?.basicInfo?.status === 'inactive'}
                              onChange={(e) => updateBasicInfo({ status: e.target.value as any })}
                              className="text-purple-600"
                            />
                            <span className="text-sm font-medium"><TranslatedText>Pasif</TranslatedText></span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          <TranslatedText>Pasif durumda menü görüntülenmeyecektir.</TranslatedText>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Görsel Kimlik */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800"><TranslatedText>Görsel Kimlik</TranslatedText></h3>
                      <button
                        onClick={() => handleSave('branding')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        <TranslatedText>Kaydet</TranslatedText>
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Ayarlar */}
                      <div className="space-y-8">
                        {/* Logo Yükleme */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaImage className="text-purple-600" />
                            <TranslatedText>Logo (Splash Ekranı)</TranslatedText>
                          </h4>
                          <p className="text-sm text-gray-500 mb-4">
                            <TranslatedText>Logo sadece uygulama açılış ekranında (splash) görünür. Menü tasarımında logo gösterilmez.</TranslatedText>
                          </p>
                          <input id="logoFileInput" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert(getStatic('Logo boyutu 2MB\'dan küçük olmalıdır.'));
                              return;
                            }

                            try {
                              console.log('🚀 Logo yükleniyor...');
                              await uploadLogo(file);
                              // URL güncellendikten sonra mutlaka genel ayarları da kaydet
                              await saveSettings();
                              console.log('✅ Logo başarıyla yüklendi ve kaydedildi');
                            } catch (error) {
                              console.error('❌ Logo yükleme hatası:', error);
                              alert(getStatic('Logo yüklenirken bir hata oluştu.'));
                            }
                          }} />
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                            onClick={() => (document.getElementById('logoFileInput') as HTMLInputElement)?.click()}
                          >
                            {settings?.branding?.logo ? (
                              <div className="flex flex-col items-center">
                                <img src={settings?.branding?.logo} alt="Logo" className="max-h-24 object-contain mb-3" />
                                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                                  <FaUpload className="inline mr-2" />
                                  <TranslatedText>Logoyu Değiştir</TranslatedText>
                                </button>
                              </div>
                            ) : (
                              <>
                                <FaImage className="text-4xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4"><TranslatedText>Logo yüklemek için tıklayın</TranslatedText></p>
                                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                                  <FaUpload className="inline mr-2" />
                                  <TranslatedText>Logo Yükle</TranslatedText>
                                </button>
                                <p className="text-xs text-gray-500 mt-2"><TranslatedText>PNG, JPG veya SVG (Max: 2MB)</TranslatedText></p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Renk Seçimi */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaPalette className="text-purple-600" />
                            <TranslatedText>Menü Renk Paleti</TranslatedText>
                          </h4>
                          <p className="text-sm text-gray-500 mb-4">
                            <TranslatedText>Seçtiğiniz renkler menü tasarımında butonlar, kategoriler ve vurgular için kullanılır.</TranslatedText>
                          </p>

                          {/* Ana Renk */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Ana Renk</TranslatedText></label>
                            <div className="flex flex-wrap gap-3 mb-3">
                              {[
                                { name: 'Mor', value: '#8B5CF6' },
                                { name: 'Mavi', value: '#3B82F6' },
                                { name: 'Yeşil', value: '#10B981' },
                                { name: 'Turuncu', value: '#F59E0B' },
                                { name: 'Kırmızı', value: '#EF4444' },
                                { name: 'Pembe', value: '#EC4899' },
                                { name: 'İndigo', value: '#6366F1' },
                                { name: 'Teal', value: '#14B8A6' }
                              ].map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => updateBranding({ primaryColor: color.value })}
                                  className={`w-12 h-12 rounded-lg border-2 transition-colors ${settings?.branding?.primaryColor === color.value ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-400'}`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={settings?.branding?.primaryColor}
                                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                                className="w-12 h-10 p-0 border rounded cursor-pointer"
                              />
                              <span className="text-sm text-gray-600">{settings?.branding?.primaryColor}</span>
                            </div>
                          </div>

                          {/* İkinci Renk */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>İkinci Renk</TranslatedText></label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={settings?.branding?.secondaryColor}
                                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                                className="w-12 h-10 p-0 border rounded cursor-pointer"
                              />
                              <span className="text-sm text-gray-600">{settings?.branding?.secondaryColor}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1"><TranslatedText>Arka plan ve vurgu renkleri otomatik hesaplanacak</TranslatedText></p>
                          </div>
                        </div>

                        {/* Font Ayarları */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Font Ailesi</TranslatedText></label>
                          <select
                            value={settings?.branding?.fontFamily}
                            onChange={(e) => updateBranding({ fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="Poppins">Poppins (Şık)</option>
                            <option value="Inter">Inter (Modern)</option>
                            <option value="Roboto">Roboto (Klasik)</option>
                            <option value="Open Sans">Open Sans (Temiz)</option>
                            <option value="Montserrat">Montserrat (Elegant)</option>
                            <option value="Lato">Lato (Profesyonel)</option>
                            <option value="Nunito">Nunito (Dostane)</option>
                            <option value="Source Sans Pro">Source Sans Pro (Okunabilir)</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1"><TranslatedText>Menüde kullanılacak font ailesi</TranslatedText></p>
                        </div>

                        {/* Font Boyutu */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Temel Font Boyutu</TranslatedText></label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'small', name: 'Küçük', size: '14px' },
                              { id: 'medium', name: 'Orta', size: '16px' },
                              { id: 'large', name: 'Büyük', size: '18px' }
                            ].map((size) => (
                              <button
                                key={size.id}
                                onClick={() => updateBranding({ fontSize: size.id as any })}
                                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${settings?.branding?.fontSize === size.id
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 hover:border-gray-400'
                                  }`}
                              >
                                {getStatic(size.name)} ({size.size})
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1"><TranslatedText>Temel metin boyutu</TranslatedText></p>
                        </div>

                        {/* Stil Ayarları */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaPalette className="text-purple-600" />
                            <TranslatedText>Stil Ayarları</TranslatedText>
                          </h4>

                          {/* Header Stili */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>Header Stili</TranslatedText></label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'gradient', name: 'Gradyan', desc: 'Renk geçişli' },
                                { id: 'solid', name: 'Düz', desc: 'Tek renk' },
                                { id: 'outline', name: 'Çerçeveli', desc: 'Sadece kenarlık' },
                                { id: 'minimal', name: 'Minimal', desc: 'Sade ve temiz' }
                              ].map((style) => (
                                <button
                                  key={style.id}
                                  onClick={() => updateBranding({ headerStyle: style.id as any })}
                                  className={`p-3 text-left rounded-lg border transition-colors ${settings?.branding?.headerStyle === style.id
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                  <div className="font-medium text-sm"><TranslatedText>{style.name}</TranslatedText></div>
                                  <div className="text-xs text-gray-500"><TranslatedText>{style.desc}</TranslatedText></div>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1"><TranslatedText>Sayfa başlığının görünüm stili</TranslatedText></p>
                          </div>
                        </div>
                      </div>

                      {/* Canlı Önizleme - Aşağıda */}
                      <div className="mt-8">
                        <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 rounded-2xl shadow-xl border border-purple-100/50 p-8 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <FaEye className="text-white text-lg" />
                                </div>
                                <TranslatedText>Canlı Önizleme</TranslatedText>
                              </h4>
                              <p className="text-sm text-gray-600 ml-12">
                                <TranslatedText>Değişikliklerinizi anlık olarak görüntüleyin</TranslatedText>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open('/menu', '_blank')}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-medium"
                                title={getStatic('Yeni Sekmede Aç')}
                              >
                                <FaEye className="text-sm" />
                                <span className="text-sm"><TranslatedText>Aç</TranslatedText></span>
                              </button>
                              <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 font-medium border border-gray-200"
                                title={getStatic('Yenile')}
                              >
                                <FaSync className="text-sm" />
                                <span className="text-sm"><TranslatedText>Yenile</TranslatedText></span>
                              </button>
                            </div>
                          </div>

                          {/* Modern Telefon Önizleme */}
                          <div className="relative flex items-center justify-center">
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 via-blue-200/40 to-pink-200/40 rounded-3xl blur-3xl animate-pulse"></div>

                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-pink-400/20 rounded-3xl"></div>

                            {/* Phone Frame Container */}
                            <div className="relative z-10 p-12">
                              {/* Phone Shadow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/20 rounded-[4rem] blur-2xl transform scale-90"></div>

                              {/* Modern Phone Frame */}
                              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[4rem] shadow-2xl p-3 mx-auto max-w-sm transform hover:scale-105 transition-transform duration-300">
                                {/* Top Bezel with Dynamic Island */}
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gray-900 rounded-full flex items-center justify-center gap-2 px-4 z-20">
                                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                  <div className="w-16 h-5 bg-black rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                </div>

                                {/* Screen with Glass Effect */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-[3.5rem] overflow-hidden h-[650px] relative shadow-inner border-2 border-gray-200/50">
                                  {/* Modern Status Bar */}
                                  <div className="bg-gradient-to-r from-white/95 to-gray-50/95 backdrop-blur-md px-6 py-4 flex items-center justify-between text-xs font-semibold border-b border-gray-200/50">
                                    <span className="text-gray-900">9:41</span>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex gap-0.5">
                                        <div className="w-1 h-1.5 bg-gray-900 rounded-full"></div>
                                        <div className="w-1 h-1.5 bg-gray-900 rounded-full"></div>
                                        <div className="w-1 h-1.5 bg-gray-900 rounded-full"></div>
                                      </div>
                                      <div className="w-5 h-3 border border-gray-900 rounded-sm relative overflow-hidden">
                                        <div className="absolute inset-0.5 bg-gray-900 rounded-sm"></div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content with Smooth Scroll */}
                                  <div className="p-4 overflow-y-auto h-[calc(100%-3.5rem)]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#c084fc #f3f4f6' }}>
                                    <PhonePreview className="w-full" />
                                  </div>
                                </div>

                                {/* Modern Home Indicator */}
                                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-36 h-1.5 bg-gray-900 rounded-full shadow-lg"></div>

                                {/* Side Buttons */}
                                <div className="absolute left-0 top-24 w-1 h-16 bg-gray-700 rounded-r-full"></div>
                                <div className="absolute left-0 top-44 w-1 h-10 bg-gray-700 rounded-r-full"></div>
                                <div className="absolute right-0 top-24 w-1 h-16 bg-gray-700 rounded-l-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* Info Footer */}
                          <div className="mt-8 text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                              <span className="text-2xl">✨</span>
                              <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                <TranslatedText>Canlı Önizleme Aktif</TranslatedText>
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              <TranslatedText>Değişiklikleriniz anında yansıtılır</TranslatedText>
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Diller */}
              {activeTab === 'languages' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <FaGlobe className="text-purple-600" />
                          Dil Ayarları
                        </h3>
                        <p className="text-sm text-gray-500">
                          Menüde göstermek istediğiniz dilleri seçin. En az bir dil aktif olmalıdır.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-semibold">
                          Aktif Dil: {selectedLanguages.length}
                        </div>
                        <button
                          onClick={() => handleSave('languages')}
                          disabled={isLoading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                        >
                          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          Kaydet
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LANGUAGE_OPTIONS.map((language) => {
                        const isActive = selectedLanguages.includes(language.code);
                        return (
                          <div
                            key={language.code}
                            className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${isActive ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-200'
                              }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{language.flag}</span>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{language.label}</p>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">{language.code}</p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{language.description}</p>
                            </div>
                            <button
                              onClick={() => toggleLanguage(language.code)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}
                            >
                              {isActive ? 'Aktif' : 'Aktifleştir'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Varsayılan Dil</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Müşteriler menüyü açtığında ilk görecekleri dili seçin.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {LANGUAGE_OPTIONS.filter(lang => selectedLanguages.includes(lang.code)).map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              updateMenuSettings({ defaultLanguage: language.code });
                            }}
                            className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${settings?.menuSettings?.defaultLanguage === language.code
                              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                              : 'border-gray-200 hover:border-purple-200'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{language.flag}</span>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900">{language.label}</p>
                                {settings?.menuSettings?.defaultLanguage === language.code && (
                                  <span className="text-xs text-purple-600 font-medium">Varsayılan</span>
                                )}
                              </div>
                            </div>
                            {settings?.menuSettings?.defaultLanguage === language.code && (
                              <FaCheckCircle className="text-purple-600 text-xl" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                      💡 Dil çevirileri otomatik olarak oluşturulur. Menüde seçtiğiniz diller arasında geçiş yapılabilir.
                    </div>
                  </div>
                </div>
              )}

              {/* Ödeme Ayarları */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800"><TranslatedText>Ödeme Yöntemleri</TranslatedText></h3>
                      <button
                        onClick={() => handleSave('paymentSettings')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        <TranslatedText>Kaydet</TranslatedText>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Nakit Ödeme */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
                              💵
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800"><TranslatedText>Nakit Ödeme (POS)</TranslatedText></h4>
                              <p className="text-sm text-gray-500"><TranslatedText>Müşterilerin kasada veya kapıda nakit ödeme yapmasına izin ver</TranslatedText></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="allowCashPayment"
                              checked={settings?.paymentSettings?.allowCashPayment}
                              onChange={(e) => updatePaymentSettings({ allowCashPayment: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="allowCashPayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                              {settings?.paymentSettings?.allowCashPayment ? <TranslatedText>Aktif</TranslatedText> : <TranslatedText>Pasif</TranslatedText>}
                            </label>
                          </div>
                        </div>

                        {/* Kredi Kartı */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                              💳
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800"><TranslatedText>Kredi Kartı</TranslatedText></h4>
                              <p className="text-sm text-gray-500"><TranslatedText>Kredi kartı ile ödeme seçeneğini göster</TranslatedText></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="allowCardPayment"
                              checked={settings?.paymentSettings?.allowCardPayment}
                              onChange={(e) => updatePaymentSettings({ allowCardPayment: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="allowCardPayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                              {settings?.paymentSettings?.allowCardPayment ? <TranslatedText>Aktif</TranslatedText> : <TranslatedText>Pasif</TranslatedText>}
                            </label>
                          </div>
                        </div>

                        {/* Bahşiş */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-xl">
                              💰
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800"><TranslatedText>Bahşiş (Tip)</TranslatedText></h4>
                              <p className="text-sm text-gray-500"><TranslatedText>Müşterilerin bahşiş bırakmasına izin ver</TranslatedText></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="allowTips"
                              checked={settings?.paymentSettings?.allowTips}
                              onChange={(e) => updatePaymentSettings({ allowTips: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="allowTips" className="text-sm font-medium text-gray-700 cursor-pointer">
                              {settings?.paymentSettings?.allowTips ? <TranslatedText>Aktif</TranslatedText> : <TranslatedText>Pasif</TranslatedText>}
                            </label>
                          </div>
                        </div>

                        {/* Bağış */}
                        <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl">
                              ❤️
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800"><TranslatedText>Bağış (Donation)</TranslatedText></h4>
                              <p className="text-sm text-gray-500"><TranslatedText>Bağış seçeneğini aktif et</TranslatedText></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="allowDonations"
                              checked={settings?.paymentSettings?.allowDonations}
                              onChange={(e) => updatePaymentSettings({ allowDonations: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="allowDonations" className="text-sm font-medium text-gray-700 cursor-pointer">
                              {settings?.paymentSettings?.allowDonations ? <TranslatedText>Aktif</TranslatedText> : <TranslatedText>Pasif</TranslatedText>}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                        <p>ℹ️ <TranslatedText>Eğer tüm ödeme yöntemlerini kapatırsanız, müşteri ödeme adımını atlayarak doğrudan sipariş onayı ekranına yönlendirilir (Ödeme kasada yapılır varsayılır).</TranslatedText></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Entegrasyonlar */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Entegrasyonlar</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          name: 'POS Sistemleri',
                          icon: FaCreditCard,
                          status: 'available',
                          desc: 'Yazar kasa ve POS sistemleri ile entegrasyon'
                        },
                        {
                          name: 'Muhasebe',
                          icon: FaSync,
                          status: 'available',
                          desc: 'Muhasebe programları ile otomatik senkronizasyon'
                        },
                        {
                          name: 'Online Ödeme',
                          icon: FaCreditCard,
                          status: 'active',
                          desc: 'Kredi kartı ve online ödeme sistemleri'
                        },
                        {
                          name: 'Stok Yönetimi',
                          icon: FaSync,
                          status: 'coming',
                          desc: 'Stok takip sistemleri ile entegrasyon'
                        },
                        {
                          name: 'CRM Sistemleri',
                          icon: FaUsers,
                          status: 'coming',
                          desc: 'Müşteri ilişkileri yönetimi'
                        },
                        {
                          name: 'Rezervasyon',
                          icon: FaSync,
                          status: 'coming',
                          desc: 'Rezervasyon sistemleri ile entegrasyon'
                        }
                      ].map((integration, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <integration.icon className="text-purple-600" />
                              </div>
                              <h4 className="font-semibold text-gray-800">{integration.name}</h4>
                            </div>
                            {integration.status === 'active' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Aktif
                              </span>
                            )}
                            {integration.status === 'available' && (
                              <button onClick={() => setIntegrationModal({ name: integration.name })} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium hover:bg-purple-200 transition-colors">
                                Bağla
                              </button>
                            )}
                            {integration.status === 'coming' && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                Yakında
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{integration.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bildirimler */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Bildirim Ayarları</h3>
                      <button
                        onClick={() => handleSave('notifications')}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        Kaydet
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* E-posta Bildirimleri */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">E-posta Bildirimleri</h4>
                        <div className="space-y-3">
                          {[
                            { id: 'new_orders', label: 'Yeni siparişler', desc: 'Yeni sipariş geldiğinde e-posta gönder' },
                            { id: 'daily_reports', label: 'Günlük raporlar', desc: 'Her gün sonunda satış raporu gönder' },
                            { id: 'system_updates', label: 'Sistem güncellemeleri', desc: 'Yeni özellikler hakkında bilgi ver' }
                          ].map((notification) => (
                            <label key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                className="mt-1"
                                defaultChecked
                              />
                              <div>
                                <div className="font-medium text-gray-800">{notification.label}</div>
                                <div className="text-sm text-gray-600">{notification.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* SMS Bildirimleri */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">SMS Bildirimleri</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FaCrown className="text-yellow-600" />
                            <span className="font-medium text-yellow-800">Premium Özellik</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">
                            SMS bildirimleri Premium plan ile kullanılabilir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Yazıcı Ayarları */}
              {activeTab === 'printer' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <FaPrint className="text-purple-600" />
                          <TranslatedText>Yazıcı & Fiş Ayarları</TranslatedText>
                        </h3>
                        <p className="text-sm text-gray-500">
                          <TranslatedText>Mutfak dökümlerini ve müşteri fişlerini bu bölümden özelleştirin.</TranslatedText>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave('printer')}
                          disabled={isLoading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                        >
                          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          <TranslatedText>Kaydet</TranslatedText>
                        </button>
                      </div>
                    </div>

                    {/* Tab Selection for Preview & Settings */}
                    <div className="flex border-b mb-6">
                      <button
                        onClick={() => setPreviewType('kitchen')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${previewType === 'kitchen' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <div className="flex items-center gap-2">
                          <FaUtensils size={14} />
                          <TranslatedText>Mutfak Fişi (Sipariş)</TranslatedText>
                        </div>
                        {previewType === 'kitchen' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>}
                      </button>
                      <button
                        onClick={() => setPreviewType('customer')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${previewType === 'customer' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <div className="flex items-center gap-2">
                          <FaCreditCard size={14} />
                          <TranslatedText>Kasa Fişi (Müşteri)</TranslatedText>
                        </div>
                        {previewType === 'customer' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Sol Kolon - Ayarlar */}
                      <div className="space-y-8">
                        {previewType === 'kitchen' ? (
                          <div className="space-y-6 animate-fadeIn">
                            <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider flex items-center gap-2">
                              <FaUtensils className="text-purple-500" />
                              <TranslatedText>Mutfak Fişi Yapılandırması</TranslatedText>
                            </h4>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Fiş Üst Bilgi (Mutfak İçin Ekstra)</TranslatedText></label>
                                <textarea
                                  value={settings.printerSettings?.kitchenHeader || ''}
                                  onChange={(e) => updatePrinterSettings({ kitchenHeader: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder={getStatic('Örn: ACİL SİPARİŞ, MUTFAK KOPYASI')}
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Fiş Alt Bilgi (Mutfak İçin Ekstra)</TranslatedText></label>
                                <textarea
                                  value={settings.printerSettings?.kitchenFooter || ''}
                                  onChange={(e) => updatePrinterSettings({ kitchenFooter: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder={getStatic('Örn: Afiyet olsun, kontrollü teslim ediniz.')}
                                  rows={2}
                                />
                              </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                              <p className="text-xs text-gray-600 italic">
                                * <TranslatedText>Mutfak fişinde ürün fiyatları ve toplam tutar varsayılan olarak gösterilmez.</TranslatedText>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6 animate-fadeIn">
                            <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider flex items-center gap-2">
                              <FaCreditCard className="text-purple-500" />
                              <TranslatedText>Kasa Fişi Yapılandırması</TranslatedText>
                            </h4>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Müşteri Fişi Üst Bilgi</TranslatedText></label>
                                <textarea
                                  value={settings.printerSettings?.customerHeader || ''}
                                  onChange={(e) => updatePrinterSettings({ customerHeader: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder={getStatic('Mağaza Adı, Vergi Bilgileri vb.')}
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Müşteri Fişi Alt Bilgi</TranslatedText></label>
                                <textarea
                                  value={settings.printerSettings?.customerFooter || ''}
                                  onChange={(e) => updatePrinterSettings({ customerFooter: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                  placeholder={getStatic('Teşekkür ederiz, tekrar bekleriz.')}
                                  rows={2}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={settings.printerSettings?.showPricesOnCustomer !== false}
                                  onChange={(e) => updatePrinterSettings({ showPricesOnCustomer: e.target.checked })}
                                  className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm font-medium"><TranslatedText>Fiyatları Göster</TranslatedText></span>
                              </label>
                              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={settings.printerSettings?.showTotalOnCustomer !== false}
                                  onChange={(e) => updatePrinterSettings({ showTotalOnCustomer: e.target.checked })}
                                  className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm font-medium"><TranslatedText>Toplam Tutarı Göster</TranslatedText></span>
                              </label>
                              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={settings.printerSettings?.showTaxOnCustomer !== false}
                                  onChange={(e) => updatePrinterSettings({ showTaxOnCustomer: e.target.checked })}
                                  className="w-4 h-4 text-purple-600"
                                />
                                <span className="text-sm font-medium"><TranslatedText>KDV Detayı Göster</TranslatedText></span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Ortak Ayarlar */}
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-bold text-gray-500 uppercase text-[10px] tracking-widest"><TranslatedText>Genel Yazdırma Ayarları</TranslatedText></h4>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={settings.printerSettings?.showLogo}
                                onChange={(e) => updatePrinterSettings({ showLogo: e.target.checked })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm font-medium"><TranslatedText>Logo Göster</TranslatedText></span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={settings.printerSettings?.showTableNumber}
                                onChange={(e) => updatePrinterSettings({ showTableNumber: e.target.checked })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm font-medium"><TranslatedText>Masa No Göster</TranslatedText></span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={settings.printerSettings?.showDateTime}
                                onChange={(e) => updatePrinterSettings({ showDateTime: e.target.checked })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm font-medium"><TranslatedText>Tarih/Saat Göster</TranslatedText></span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={settings.printerSettings?.showOrderNumber}
                                onChange={(e) => updatePrinterSettings({ showOrderNumber: e.target.checked })}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm font-medium"><TranslatedText>Sipariş No Göster</TranslatedText></span>
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Kağıt Genişliği</TranslatedText></label>
                              <select
                                value={settings.printerSettings?.paperWidth || '80mm'}
                                onChange={(e) => updatePrinterSettings({ paperWidth: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                              >
                                <option value="80mm">80mm (Standart)</option>
                                <option value="58mm">58mm (Mobil/Küçük)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1"><TranslatedText>Test Yazıcı IP</TranslatedText></label>
                              <input
                                type="text"
                                value={settings.printerSettings?.testIpAddress || ''}
                                onChange={(e) => updatePrinterSettings({ testIpAddress: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                placeholder="192.168.1.100"
                              />
                            </div>
                          </div>

                          <button
                            onClick={(e) => { e.preventDefault(); handleTestPrint(previewType); }}
                            className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                          >
                            <FaPrint />
                            <TranslatedText>Test Çıktısı Al</TranslatedText>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                              {previewType === 'kitchen' ? getStatic('Mutfak') : getStatic('Kasa')}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Sağ Kolon - Fiş Önizleme */}
                      <div className="bg-gray-100 p-8 rounded-2xl flex flex-col items-center">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          {previewType === 'kitchen' ? getStatic('Mutfak Fişi Önizleme') : getStatic('Kasa Fişi Önizleme')}
                        </div>

                        {/* Termal Kağıt Görünümü */}
                        <div className={`bg-white shadow-2xl p-6 min-h-[500px] transition-all duration-300 ${settings.printerSettings?.paperWidth === '58mm' ? 'w-[250px]' : 'w-[320px]'} relative overflow-hidden flex flex-col font-mono`}>
                          {/* Kağıt Kesik Çizgisi */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200" style={{ backgroundImage: 'linear-gradient(to right, white 50%, #f3f4f6 50%)', backgroundSize: '10px 100%' }}></div>

                          <div className="space-y-4 text-black flex-1">
                            {/* Logo */}
                            {settings.printerSettings?.showLogo && (settings.branding?.logo || authenticatedRestaurant?.logo) && (
                              <div className="flex justify-center mb-4">
                                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                                  <img
                                    src={settings.branding?.logo || authenticatedRestaurant?.logo || ''}
                                    alt="Logo"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Restaurant Name */}
                            <div className="text-center font-bold text-sm tracking-widest uppercase mb-2">
                              {settings.basicInfo?.name || 'KROREN KADIKOY'}
                            </div>

                            {/* Separator Line */}
                            <div className="border-b border-dashed border-gray-400"></div>

                            {previewType === 'customer' ? (
                              <>
                                {/* Check & Table Info */}
                                <div className="space-y-1 py-2">
                                  <div className="text-xl font-bold">Cek : 50</div>
                                  <div className="text-xl font-bold">Masa : MASA - 1</div>
                                </div>

                                {/* Info Grid */}
                                <div className="text-[10px] space-y-1 py-2">
                                  <div className="flex justify-between">
                                    <span>Tarih</span>
                                    <span>{new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Kullanici</span>
                                    <span>Sukru</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Gelir Merkezi</span>
                                    <span>Restoran</span>
                                  </div>
                                </div>

                                <div className="border-b border-dashed border-gray-400"></div>

                                {/* Items */}
                                <div className="py-2 text-xs space-y-2">
                                  <div className="flex justify-between">
                                    <span>1 x Sprite</span>
                                    <span>65.00 TL</span>
                                  </div>
                                </div>

                                {/* Summary */}
                                <div className="mt-4">
                                  <div className="flex justify-between font-bold text-xs mb-2">
                                    <span>ARA TOPLAM</span>
                                    <span>65.00 TL</span>
                                  </div>

                                  <div className="border-b border-dashed border-gray-400 my-2"></div>

                                  <div className="text-[10px] space-y-1 py-1">
                                    <div className="font-bold">Icecek (10%)</div>
                                    <div className="flex justify-between">
                                      <span>65.00 TL</span>
                                      <span className="font-bold">5.91 KDV 59.09 NET</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed border-gray-400 mt-2">
                                    <span>TOPLAM</span>
                                    <span>65.00 TL</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Kitchen View */}
                                <div className="text-center font-bold text-2xl py-4 border-b-2 border-dashed border-gray-800">
                                  MASA 12
                                </div>
                                <div className="py-4 space-y-3">
                                  <div className="font-bold">2x Karışık Ramen</div>
                                  <div className="italic text-red-600 text-[10px]">⚠ Acılı, Soğansız</div>
                                  <div className="font-bold">1x Dana Etli Ramen</div>
                                  <div className="italic text-red-600 text-[10px]">⚠ Çok Acılı</div>
                                </div>
                              </>
                            )}

                            {/* Footer Text */}
                            {(previewType === 'kitchen' ? settings.printerSettings?.kitchenFooter : settings.printerSettings?.customerFooter) && (
                              <div className="text-center text-[10px] text-gray-500 border-t border-dashed border-gray-400 pt-4 mt-8">
                                {previewType === 'kitchen' ? settings.printerSettings?.kitchenFooter : settings.printerSettings?.customerFooter}
                              </div>
                            )}

                            <div className="text-[8px] opacity-30 text-center mt-12 font-sans tracking-widest leading-relaxed">
                              RESTXQR CLOUD PRINTING SYSTEM<br />
                              E-ARSIV FATURA DEGILDIR
                            </div>
                          </div>
                          {/* Kağıt Alt Kesik Çizgisi */}
                          <div className="absolute bottom-0 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Güvenlik Ayarları */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FaLock className="text-purple-600" />
                        <TranslatedText>Güvenlik ve Giriş</TranslatedText>
                      </h3>
                    </div>

                    <div className="space-y-8">
                      {/* Giriş Bilgileri */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Kullanıcı Adı</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={authenticatedRestaurant?.username || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Email Adresi</TranslatedText>
                          </label>
                          <input
                            type="text"
                            value={authenticatedRestaurant?.email || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" />

                      {/* Şifre Değiştirme Formu */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-4"><TranslatedText>Şifre Değiştir</TranslatedText></h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <TranslatedText>Mevcut Şifre</TranslatedText>
                            </label>
                            <input
                              type="password"
                              value={accountInfo.currentPassword}
                              onChange={(e) => updateAccountInfo({ currentPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <TranslatedText>Yeni Şifre</TranslatedText>
                            </label>
                            <input
                              type="password"
                              value={accountInfo.newPassword}
                              onChange={(e) => updateAccountInfo({ newPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <TranslatedText>Yeni Şifre (Tekrar)</TranslatedText>
                            </label>
                            <input
                              type="password"
                              value={accountInfo.confirmPassword}
                              onChange={(e) => updateAccountInfo({ confirmPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleRestaurantPasswordChange}
                            disabled={isLoading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            <TranslatedText>Şifreyi Güncelle</TranslatedText>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <LanguageProvider>
      <SettingsPageContent />
    </LanguageProvider>
  );
}

