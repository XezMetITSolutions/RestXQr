'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserShield,
  FaUtensils,
  FaUser,
  FaMoneyBillWave,
  FaCheck,
  FaSave,
  FaQuestionCircle,
  FaSpinner
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import TranslatedText, { useTranslation } from '@/components/TranslatedText';
import { permissionsApi, Permission } from '@/services/permissionsApi';

type PermissionSet = {
  kitchen?: Permission[];
  waiter?: Permission[];
  cashier?: Permission[];
};

// Toggle Switch Component
const ToggleSwitch = ({
  isOn,
  handleToggle,
  colorClass = 'bg-blue-500',
  disabled = false
}: {
  isOn: boolean;
  handleToggle: () => void;
  colorClass?: string;
  disabled?: boolean;
}) => {
  const id = React.useId();

  return (
    <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name="toggle"
        id={id}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10"
        checked={isOn}
        onChange={handleToggle}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={`toggle-label block overflow-hidden h-6 rounded-full ${disabled ? 'bg-gray-300' : (isOn ? colorClass : 'bg-gray-300')} cursor-pointer transition-colors duration-200`}
      ></label>
      <style jsx>{`
        .toggle-checkbox {
          left: 0;
          transition: all 0.3s ease-in-out;
          border-color: #d1d5db;
        }
        .toggle-checkbox:checked {
          left: 100%;
          transform: translateX(-100%);
          border-color: white;
        }
        .toggle-label {
          transition: background-color 0.2s ease-in;
        }
      `}</style>
    </div>
  );
};

// Tooltip Component
const Tooltip = ({ text }: { text: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <FaInfoCircle
        className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-700 -left-32 top-6">
          {text}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-t border-l border-gray-200"></div>
        </div>
      )}
    </div>
  );
};

// Permission Item Component
const PermissionItem = ({
  label,
  description,
  isEnabled,
  onChange,
  colorClass,
  disabled = false
}: {
  label: string;
  description: string;
  isEnabled: boolean;
  onChange: () => void;
  colorClass: string;
  disabled?: boolean;
}) => {
  return (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center">
        <span className="text-gray-700">{label}</span>
        <Tooltip text={description} />
      </div>
      <ToggleSwitch
        isOn={isEnabled}
        handleToggle={onChange}
        colorClass={colorClass}
        disabled={disabled}
      />
    </div>
  );
};

// Role Card Component
const RoleCard = ({
  title,
  permissions,
  colorClass,
  headerBgClass,
  onPermissionChange,
  onSave,
  onSelectAll,
  loading
}: {
  title: string;
  permissions: any[];
  colorClass: string;
  headerBgClass: string;
  onPermissionChange: (id: string) => void;
  onSave: () => void;
  onSelectAll: () => void;
  loading: boolean;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className={`${headerBgClass} text-white p-4 text-center`}>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <div className="p-5">
        {permissions.map((permission, index) => (
          <React.Fragment key={permission.id}>
            <PermissionItem
              label={permission.label}
              description={permission.description}
              isEnabled={permission.enabled}
              onChange={() => onPermissionChange(permission.id)}
              colorClass={colorClass}
              disabled={permission.locked}
            />
            {index < permissions.length - 1 && <div className="border-b border-gray-100"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={onSelectAll}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <TranslatedText>Tümünü Seç</TranslatedText>
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className={`px-4 py-2 ${headerBgClass} text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <TranslatedText>Kaydediliyor...</TranslatedText>
            </>
          ) : (
            <>
              <FaSave />
              <TranslatedText>Ayarları Kaydet</TranslatedText>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Preset Button Component
const PresetButton = ({
  label,
  onClick,
  colorClass
}: {
  label: string;
  onClick: () => void;
  colorClass: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 ${colorClass} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
    >
      {label}
    </button>
  );
};

export default function PermissionsPanel({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const permissionsEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

  // Kitchen Permissions
  const [kitchenPermissions, setKitchenPermissions] = useState([
    {
      id: 'kitchen_view_orders',
      label: t('Siparişleri Görüntüleme'),
      description: t('Bekleyen ve hazırlanan siparişleri görüntüleyebilir'),
      enabled: true,
      locked: true // Bu izin kilitli, değiştirilemez
    },
    {
      id: 'kitchen_mark_preparing',
      label: t('Hazırlanıyor İşaretleme'),
      description: t('Siparişleri "Hazırlanıyor" olarak işaretleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'kitchen_mark_ready',
      label: t('Hazır İşaretleme'),
      description: t('Siparişleri "Hazır" olarak işaretleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'kitchen_cancel_order',
      label: t('Sipariş İptal Etme'),
      description: t('Siparişleri iptal edebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'kitchen_view_history',
      label: t('Sipariş Geçmişi Görüntüleme'),
      description: t('Tamamlanan siparişlerin geçmişini görüntüleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'kitchen_edit_menu',
      label: t('Menü Düzenleme'),
      description: t('Menü öğelerini düzenleyebilir (stok durumu, hazırlama süresi)'),
      enabled: true,
      locked: false
    },
    {
      id: 'kitchen_priority',
      label: t('Sipariş Önceliği Belirleme'),
      description: t('Siparişlerin hazırlanma önceliğini değiştirebilir'),
      enabled: true,
      locked: false
    }
  ]);

  // Waiter Permissions
  const [waiterPermissions, setWaiterPermissions] = useState([
    {
      id: 'waiter_view_orders',
      label: t('Siparişleri Görüntüleme'),
      description: t('Tüm siparişleri görüntüleyebilir'),
      enabled: true,
      locked: true
    },
    {
      id: 'waiter_create_order',
      label: t('Sipariş Oluşturma'),
      description: t('Yeni sipariş oluşturabilir'),
      enabled: true,
      locked: true
    },
    {
      id: 'waiter_mark_served',
      label: t('Servis Edildi İşaretleme'),
      description: t('Siparişleri "Servis Edildi" olarak işaretleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'waiter_mark_completed',
      label: t('Tamamlandı İşaretleme'),
      description: t('Siparişleri "Tamamlandı" olarak işaretleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'waiter_cancel_order',
      label: t('Sipariş İptal Etme'),
      description: t('Siparişleri iptal edebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'waiter_edit_order',
      label: t('Sipariş Düzenleme'),
      description: t('Mevcut siparişleri düzenleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'waiter_view_tables',
      label: t('Masa Durumu Görüntüleme'),
      description: t('Masa durumlarını ve doluluğunu görüntüleyebilir'),
      enabled: true,
      locked: false
    }
  ]);

  // Cashier Permissions
  const [cashierPermissions, setCashierPermissions] = useState([
    {
      id: 'cashier_view_orders',
      label: t('Siparişleri Görüntüleme'),
      description: t('Tüm siparişleri görüntüleyebilir'),
      enabled: true,
      locked: true
    },
    {
      id: 'cashier_approve_orders',
      label: t('Sipariş Onaylama'),
      description: t('Siparişleri onaylayabilir (mutfağa gönderme)'),
      enabled: true,
      locked: true
    },
    {
      id: 'cashier_reject_orders',
      label: t('Sipariş Reddetme'),
      description: t('Siparişleri reddedebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'cashier_process_payment',
      label: t('Ödeme Alma'),
      description: t('Tamamlanan siparişlerden ödeme alabilir'),
      enabled: true,
      locked: true
    },
    {
      id: 'cashier_apply_discount',
      label: t('İndirim Uygulama'),
      description: t('Siparişlere indirim uygulayabilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'cashier_view_reports',
      label: t('Raporları Görüntüleme'),
      description: t('Günlük/haftalık/aylık satış raporlarını görüntüleyebilir'),
      enabled: true,
      locked: false
    },
    {
      id: 'cashier_manage_refunds',
      label: t('İade İşlemleri'),
      description: t('İade işlemlerini gerçekleştirebilir'),
      enabled: true,
      locked: false
    }
  ]);

  // Check authentication and restore session
  useEffect(() => {
    // Önce normal kimlik doğrulama kontrolü
    if (!isAuthenticated()) {
      // LocalStorage'dan oturum bilgilerini kontrol et
      const staffUser = localStorage.getItem('staff_user');
      const staffToken = localStorage.getItem('staff_token');

      // Eğer localStorage'da oturum bilgileri varsa, oturumu geri yükle
      if (staffUser && staffToken) {
        try {
          console.log('🔄 Oturum bilgileri localStorage\'dan geri yükleniyor');
          // Oturum bilgilerini zaten localStorage'dan aldık, işleme devam edebiliriz
        } catch (error) {
          console.error('❌ Oturum geri yükleme hatası:', error);
          router.push('/login');
        }
      } else {
        // Oturum bilgileri yoksa login sayfasına yönlendir
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  // Load permissions when component mounts
  useEffect(() => {
    if (authenticatedRestaurant?.id) {
      loadPermissionsFromBackend();
    }
  }, [authenticatedRestaurant?.id]);

  // Handle permission changes
  const handleKitchenPermissionChange = (id: string) => {
    setKitchenPermissions(prev =>
      prev.map(p => p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleWaiterPermissionChange = (id: string) => {
    setWaiterPermissions(prev =>
      prev.map(p => p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleCashierPermissionChange = (id: string) => {
    setCashierPermissions(prev =>
      prev.map(p => p.id === id && !p.locked ? { ...p, enabled: !p.enabled } : p)
    );
  };

  // Handle select all
  const handleSelectAllKitchen = () => {
    setKitchenPermissions(prev =>
      prev.map(p => p.locked ? p : { ...p, enabled: true })
    );
  };

  const handleSelectAllWaiter = () => {
    setWaiterPermissions(prev =>
      prev.map(p => p.locked ? p : { ...p, enabled: true })
    );
  };

  const handleSelectAllCashier = () => {
    setCashierPermissions(prev =>
      prev.map(p => p.locked ? p : { ...p, enabled: true })
    );
  };

  // Load permissions from backend
  const loadPermissionsFromBackend = async () => {
    if (!authenticatedRestaurant?.id) {
      console.error('Cannot load permissions: Restaurant ID is missing');
      return;
    }

    try {
      setLoadingPermissions(true);
      console.log(`Loading permissions for restaurant ${authenticatedRestaurant.id}...`);
      
      // Get staff token or business token
      let authToken = localStorage.getItem('staff_token');
      if (!authToken) {
        // Fallback to business token if staff token is not available
        authToken = localStorage.getItem('business_token');
      }
      
      if (!authToken) {
        console.error('Cannot load permissions: No authentication token found');
        return;
      }
      
      console.log('Auth token found:', authToken.substring(0, 10) + '...');
      
      // Make direct API call to ensure it works
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Get subdomain from hostname
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0] || 'kroren';
      console.log('Using subdomain for API request:', subdomain);
      
      // Ensure token is properly formatted
      const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      console.log('Using authorization header:', token.substring(0, 15) + '...');
      
      const response = await fetch(`${API_URL}/permissions/${authenticatedRestaurant.id}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain
        }
      });
      
      // Log response status for debugging
      console.log('Permissions API response status:', response.status);
      
      if (!response.ok) {
        console.error(`API error loading permissions: ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Permissions API response:', data);
      
      if (!data.success) {
        console.error('API returned error:', data.message);
        throw new Error(data.message || 'Failed to load permissions');
      }
      
      const allPermissions = data.permissions || { kitchen: [], waiter: [], cashier: [] };
      const cacheKey = `permissions_${authenticatedRestaurant.id}`;
      const cachedPermissions = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      const parsedCache = cachedPermissions ? JSON.parse(cachedPermissions) : null;

      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(allPermissions));
      }

      if (parsedCache && !permissionsEqual(parsedCache, allPermissions)) {
        console.warn('Permissions mismatch detected; preferring local cache and syncing backend.');
        if (parsedCache.kitchen) setKitchenPermissions(parsedCache.kitchen);
        if (parsedCache.waiter) setWaiterPermissions(parsedCache.waiter);
        if (parsedCache.cashier) setCashierPermissions(parsedCache.cashier);
        await syncPermissionsToBackend(parsedCache, authenticatedRestaurant.id);
        return;
      }

      // Update state with loaded permissions if available
      if (allPermissions.kitchen?.length > 0) {
        console.log('Setting kitchen permissions:', allPermissions.kitchen);
        setKitchenPermissions(allPermissions.kitchen);
      }

      if (allPermissions.waiter?.length > 0) {
        console.log('Setting waiter permissions:', allPermissions.waiter);
        setWaiterPermissions(allPermissions.waiter);
      }

      if (allPermissions.cashier?.length > 0) {
        console.log('Setting cashier permissions:', allPermissions.cashier);
        setCashierPermissions(allPermissions.cashier);
      }

      console.log('✅ Permissions loaded from backend successfully');
    } catch (error: any) {
      console.error('❌ Error loading permissions:', error);
      setSaveStatus('error');
      setSaveMessage(`Yetkiler yüklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      // Fallback to localStorage if available
      if (typeof window !== 'undefined' && authenticatedRestaurant?.id) {
        const cachedPermissions = localStorage.getItem(`permissions_${authenticatedRestaurant.id}`);
        if (cachedPermissions) {
          try {
            const parsed = JSON.parse(cachedPermissions);
            if (parsed.kitchen) setKitchenPermissions(parsed.kitchen);
            if (parsed.waiter) setWaiterPermissions(parsed.waiter);
            if (parsed.cashier) setCashierPermissions(parsed.cashier);
          } catch (cacheError) {
            console.warn('Failed to parse cached permissions:', cacheError);
          }
        }
      }
      // Fallback to default permissions already in state
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Handle save
  const syncPermissionsToBackend = async (permissionsPayload: PermissionSet, restaurantId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0] || 'kroren';
      const staffToken = localStorage.getItem('staff_token');
      const businessToken = localStorage.getItem('business_token');
      const authToken = staffToken || businessToken;
      if (!authToken) return;
      const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

      const roles: Array<keyof PermissionSet> = ['kitchen', 'waiter', 'cashier'];
      await Promise.all(
        roles.map((role) => {
          if (!permissionsPayload[role]) return Promise.resolve();
          return fetch(`${API_URL}/permissions/${restaurantId}/${String(role)}`, {
            method: 'PUT',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
              'X-Subdomain': subdomain
            },
            body: JSON.stringify({ permissions: permissionsPayload[role] })
          });
        })
      );
    } catch (error) {
      console.warn('Failed to sync cached permissions to backend:', error);
    }
  };

  const handleSave = async (role: string) => {
    if (!authenticatedRestaurant?.id) {
      setSaveStatus('error');
      setSaveMessage(t('Restoran bilgisi bulunamadı'));
      console.error('Cannot save permissions: Restaurant ID is missing');
      return;
    }

    setLoading(true);
    setSaveStatus(null);

    try {
      let success = false;
      let roleKey = '';
      let permissions: Permission[] = [];

      // Role'e göre ilgili izinleri gönder
      if (role === 'Mutfak') {
        roleKey = 'kitchen';
        permissions = kitchenPermissions;
      } else if (role === 'Garson') {
        roleKey = 'waiter';
        permissions = waiterPermissions;
      } else if (role === 'Kasa') {
        roleKey = 'cashier';
        permissions = cashierPermissions;
      }

      // Debug log
      console.log(`Saving ${roleKey} permissions for restaurant ${authenticatedRestaurant.id}:`, {
        restaurantId: authenticatedRestaurant.id,
        role: roleKey,
        permissionsCount: permissions.length,
        permissions: permissions
      });

      // Get staff token or business token
      console.log('🔍 DEBUG: Checking localStorage for tokens...');
      console.log('🔍 DEBUG: All localStorage keys:', Object.keys(localStorage));
      
      let authToken = localStorage.getItem('staff_token');
      console.log('🔍 DEBUG: staff_token:', authToken ? authToken.substring(0, 20) + '...' : 'NOT FOUND');
      
      if (!authToken) {
        // Fallback to business token if staff token is not available
        authToken = localStorage.getItem('business_token');
        console.log('🔍 DEBUG: business_token:', authToken ? authToken.substring(0, 20) + '...' : 'NOT FOUND');
      }
      
      if (!authToken) {
        try {
          console.log('🔄 No token found, requesting bootstrap token...');
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
          const tokenResponse = await fetch(`${API_URL}/auth/token/${authenticatedRestaurant.id}`);
          const tokenData = await tokenResponse.json();
          if (tokenResponse.ok && tokenData?.data?.token) {
            authToken = tokenData.data.token;
            localStorage.setItem('business_token', tokenData.data.token);
            console.log('✅ Bootstrap token stored as business_token');
          }
        } catch (tokenError) {
          console.error('❌ Token bootstrap failed:', tokenError);
        }
      }

      if (!authToken) {
        console.error('❌ Cannot save permissions: No authentication token found');
        console.error('❌ Available localStorage keys:', Object.keys(localStorage));
        setSaveStatus('error');
        setSaveMessage(`${role} yetkileri kaydedilemedi: Oturum bilgisi eksik (Token bulunamadı)`);
        return;
      }
      
      console.log('✅ Using auth token for save:', authToken.substring(0, 10) + '...');

      // Make direct API call to ensure it works
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Get subdomain from hostname
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0] || 'kroren';
      console.log('Using subdomain for save API request:', subdomain);
      
      const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      console.log('Using authorization header for save:', token.substring(0, 15) + '...');
      
      console.log('🚀 Making API request:', {
        url: `${API_URL}/permissions/${authenticatedRestaurant.id}/${roleKey}`,
        method: 'POST',
        headers: {
          'Authorization': token.substring(0, 20) + '...',
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain
        },
        bodySize: JSON.stringify({ permissions }).length
      });

      const response = await fetch(`${API_URL}/permissions/${authenticatedRestaurant.id}/${roleKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'X-Subdomain': subdomain
        },
        body: JSON.stringify({
          permissions: permissions
        })
      });
      
      // Log response status for debugging
      console.log('📥 Save permissions API response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log(`📥 API Response for ${roleKey} permissions:`, data);

      if (response.ok && data.success) {
        success = true;
        setSaveStatus('success');
        setSaveMessage(`${role} yetkileri başarıyla kaydedildi.`);

        if (typeof window !== 'undefined' && authenticatedRestaurant?.id) {
          const cacheKey = `permissions_${authenticatedRestaurant.id}`;
          const cached = localStorage.getItem(cacheKey);
          let nextCache = cached ? JSON.parse(cached) : {};
          nextCache = {
            ...nextCache,
            [roleKey]: permissions
          };
          localStorage.setItem(cacheKey, JSON.stringify(nextCache));
        }
        
        // Reload permissions to confirm changes were saved
        setTimeout(() => {
          loadPermissionsFromBackend();
        }, 1000);
      } else {
        console.error(`API error saving ${roleKey} permissions:`, { status: response.status, data });
        setSaveStatus('error');
        setSaveMessage(`${role} yetkileri kaydedilirken hata oluştu: ${data.message || 'API hatası'}`);
      }
    } catch (error: any) {
      console.error(`Error saving ${role} permissions:`, error);
      setSaveStatus('error');
      setSaveMessage(`${role} yetkileri kaydedilirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);

      // 5 saniye sonra mesajı temizle
      setTimeout(() => {
        setSaveStatus(null);
        setSaveMessage('');
      }, 5000);
    }
  };

  // Handle presets
  const applyKitchenPreset = (preset: string) => {
    if (preset === 'minimal') {
      setKitchenPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['kitchen_view_orders', 'kitchen_mark_preparing', 'kitchen_mark_ready'].includes(p.id)) {
            return { ...p, enabled: true };
          }
          return { ...p, enabled: false };
        })
      );
    } else if (preset === 'standard') {
      setKitchenPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['kitchen_edit_menu', 'kitchen_cancel_order'].includes(p.id)) {
            return { ...p, enabled: false };
          }
          return { ...p, enabled: true };
        })
      );
    } else if (preset === 'chef') {
      setKitchenPermissions(prev =>
        prev.map(p => p.locked ? p : { ...p, enabled: true })
      );
    }
  };

  const applyWaiterPreset = (preset: string) => {
    if (preset === 'minimal') {
      setWaiterPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['waiter_mark_served', 'waiter_view_tables'].includes(p.id)) {
            return { ...p, enabled: true };
          }
          return { ...p, enabled: false };
        })
      );
    } else if (preset === 'standard') {
      setWaiterPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['waiter_cancel_order'].includes(p.id)) {
            return { ...p, enabled: false };
          }
          return { ...p, enabled: true };
        })
      );
    } else if (preset === 'head') {
      setWaiterPermissions(prev =>
        prev.map(p => p.locked ? p : { ...p, enabled: true })
      );
    }
  };

  const applyCashierPreset = (preset: string) => {
    if (preset === 'minimal') {
      setCashierPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['cashier_view_orders', 'cashier_approve_orders', 'cashier_process_payment'].includes(p.id)) {
            return { ...p, enabled: true };
          }
          return { ...p, enabled: false };
        })
      );
    } else if (preset === 'standard') {
      setCashierPermissions(prev =>
        prev.map(p => {
          if (p.locked) return p;
          if (['cashier_apply_discount', 'cashier_manage_refunds'].includes(p.id)) {
            return { ...p, enabled: false };
          }
          return { ...p, enabled: true };
        })
      );
    } else if (preset === 'manager') {
      setCashierPermissions(prev =>
        prev.map(p => p.locked ? p : { ...p, enabled: true })
      );
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const content = (
    <div className={`${isEmbedded ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
      {/* Save Status Message */}
      {saveStatus && (
        <div className={`mb-6 p-4 rounded-lg ${saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
          <div className="flex items-center">
            {saveStatus === 'success' ? (
              <FaCheckCircle className="text-green-500 mr-3" />
            ) : (
              <FaTimesCircle className="text-red-500 mr-3" />
            )}
            <p className={saveStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
              {saveMessage}
            </p>
          </div>
        </div>
      )}

      {/* Presets Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center mb-4">
          <FaUserShield className="text-purple-600 mr-2 text-lg" />
          <h2 className="text-lg font-semibold text-gray-800">
            <TranslatedText>Hazır Şablonlar</TranslatedText>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kitchen Presets */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <FaUtensils className="text-orange-500 mr-2" />
              <TranslatedText>Mutfak Şablonları</TranslatedText>
            </h3>
            <div className="flex flex-wrap gap-2">
              <PresetButton
                label={t("Minimal Mutfak")}
                onClick={() => applyKitchenPreset('minimal')}
                colorClass="bg-orange-300"
              />
              <PresetButton
                label={t("Standart Mutfak")}
                onClick={() => applyKitchenPreset('standard')}
                colorClass="bg-orange-500"
              />
              <PresetButton
                label={t("Şef Yetkisi")}
                onClick={() => applyKitchenPreset('chef')}
                colorClass="bg-orange-700"
              />
            </div>
          </div>

          {/* Waiter Presets */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <FaUser className="text-blue-500 mr-2" />
              <TranslatedText>Garson Şablonları</TranslatedText>
            </h3>
            <div className="flex flex-wrap gap-2">
              <PresetButton
                label={t("Minimal Garson")}
                onClick={() => applyWaiterPreset('minimal')}
                colorClass="bg-blue-300"
              />
              <PresetButton
                label={t("Standart Garson")}
                onClick={() => applyWaiterPreset('standard')}
                colorClass="bg-blue-500"
              />
              <PresetButton
                label={t("Baş Garson")}
                onClick={() => applyWaiterPreset('head')}
                colorClass="bg-blue-700"
              />
            </div>
          </div>

          {/* Cashier Presets */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <FaMoneyBillWave className="text-green-500 mr-2" />
              <TranslatedText>Kasa Şablonları</TranslatedText>
            </h3>
            <div className="flex flex-wrap gap-2">
              <PresetButton
                label={t("Minimal Kasa")}
                onClick={() => applyCashierPreset('minimal')}
                colorClass="bg-green-300"
              />
              <PresetButton
                label={t("Standart Kasa")}
                onClick={() => applyCashierPreset('standard')}
                colorClass="bg-green-500"
              />
              <PresetButton
                label={t("Yönetici Kasa")}
                onClick={() => applyCashierPreset('manager')}
                colorClass="bg-green-700"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <FaQuestionCircle className="text-blue-500 mt-1 mr-3" />
            <p className="text-sm text-blue-700">
              <TranslatedText>
                Hazır şablonlar, yetkileri hızlıca yapılandırmanızı sağlar. Şablonu seçtikten sonra, ihtiyacınıza göre yetkileri özelleştirebilirsiniz. Kilitli yetkiler değiştirilemez.
              </TranslatedText>
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kitchen Permissions */}
        <RoleCard
          title={t("Mutfak")}
          permissions={kitchenPermissions}
          colorClass="bg-orange-500"
          headerBgClass="bg-orange-600"
          onPermissionChange={handleKitchenPermissionChange}
          onSave={() => handleSave('Mutfak')}
          onSelectAll={handleSelectAllKitchen}
          loading={loading}
        />

        {/* Waiter Permissions */}
        <RoleCard
          title={t("Garson")}
          permissions={waiterPermissions}
          colorClass="bg-blue-500"
          headerBgClass="bg-blue-600"
          onPermissionChange={handleWaiterPermissionChange}
          onSave={() => handleSave('Garson')}
          onSelectAll={handleSelectAllWaiter}
          loading={loading}
        />

        {/* Cashier Permissions */}
        <RoleCard
          title={t("Kasa")}
          permissions={cashierPermissions}
          colorClass="bg-green-500"
          headerBgClass="bg-green-600"
          onPermissionChange={handleCashierPermissionChange}
          onSave={() => handleSave('Kasa')}
          onSelectAll={handleSelectAllCashier}
          loading={loading}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium text-gray-800 mb-3">
          <TranslatedText>Açıklamalar</TranslatedText>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              <TranslatedText>Devre dışı yetki</TranslatedText>
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              <TranslatedText>Etkin yetki</TranslatedText>
            </span>
          </div>
          <div className="flex items-center">
            <FaInfoCircle className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              <TranslatedText>Bilgi ikonu üzerine gelerek detaylı açıklama görebilirsiniz</TranslatedText>
            </span>
          </div>
          <div className="flex items-center">
            <div className="opacity-50 mr-2 flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">
              <TranslatedText>Kilitli yetkiler değiştirilemez</TranslatedText>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-0 lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  <TranslatedText>Panel Yetkilendirme ve İnce Ayarlar</TranslatedText>
                </h1>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                  <TranslatedText>Personel rollerine göre yetkilendirme ayarlarını yapılandırın</TranslatedText>
                </p>
              </div>
            </div>
          </div>
        </header>

        {content}
      </div>
    </div>
  );
}
