'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode,
  FaPlus,
  FaTrash,
  FaCopy,
  FaDownload,
  FaPrint,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaEye,
  FaExternalLinkAlt,
  FaCheckSquare,
  FaSquare
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useQRStore, type QRCodeData } from '@/store/useQRStore';
import BusinessSidebar from '@/components/BusinessSidebar';
import apiService from '@/services/api';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

export default function QRCodesPage() {
  const router = useRouter();
  const { translate: t, currentLanguage } = useLanguage();
  const { authenticatedRestaurant, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const settingsStore = useRestaurantSettings(authenticatedRestaurant?.id);
  const { settings } = settingsStore;
  const { qrCodes, setQRCodes, clearQRCodes } = useQRStore();

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

  // States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tableCount, setTableCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedQRCodes, setSelectedQRCodes] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [menuCategories, setMenuCategories] = useState<any[]>([]);

  // Drink routing config (stored in restaurant settings)
  const [drinkCategoryId, setDrinkCategoryId] = useState('');
  const [useManualRanges, setUseManualRanges] = useState(false);
  const [floorConfigs, setFloorConfigs] = useState<
    Array<{ name: string; tableCount: number; drinkStationId: string; startTable?: number; endTable?: number }>
  >([
    { name: '1. Kat', tableCount: 10, drinkStationId: '' }
  ]);

  const getFloorRangePreview = (idx: number) => {
    if (useManualRanges) {
      const start = Number(floorConfigs[idx]?.startTable);
      const end = Number(floorConfigs[idx]?.endTable);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        return `${start}-${end}`;
      }
      return '-';
    }

    let cursor = 1;
    for (let i = 0; i < floorConfigs.length; i++) {
      const count = Number(floorConfigs[i]?.tableCount) || 0;
      const start = cursor;
      const end = count > 0 ? cursor + count - 1 : cursor - 1;
      if (i === idx) {
        return count > 0 ? `${start}-${end}` : '-';
      }
      cursor = cursor + count;
    }
    return '-';
  };

  const findFloorForTable = (tableNumber?: number) => {
    const t = Number(tableNumber);
    if (!Number.isFinite(t)) return null;
    const cfg = (settings as any)?.drinkStationRouting;
    const floors = Array.isArray(cfg?.floors) ? cfg.floors : [];
    const match = floors.find((f: any) => Number(f.startTable) <= t && t <= Number(f.endTable));
    if (!match) return null;
    return {
      name: match.name,
      startTable: match.startTable,
      endTable: match.endTable
    };
  };

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (!authenticatedRestaurant?.id) return;
        const res = await apiService.getRestaurantMenu(authenticatedRestaurant.id);
        if (res?.success && res.data?.categories) {
          setMenuCategories(res.data.categories);
        }
      } catch (e) {
        console.error('Failed to load menu categories:', e);
      }
    };

    loadCategories();
  }, [authenticatedRestaurant?.id]);

  useEffect(() => {
    // Load existing routing settings into the modal defaults
    const cfg = (settings as any)?.drinkStationRouting;
    if (cfg?.drinkCategoryId && !drinkCategoryId) {
      setDrinkCategoryId(cfg.drinkCategoryId);
    }
    if (Array.isArray(cfg?.floors) && cfg.floors.length > 0) {
      // map stored floors to editable floor configs (tableCount derived from range)
      const mapped = cfg.floors.map((f: any, idx: number) => ({
        name: f.name || `${idx + 1}. Kat`,
        tableCount: Number(f.tableCount || ((Number(f.endTable) - Number(f.startTable) + 1) || 0)) || 0,
        drinkStationId: f.stationId || '',
        startTable: f.startTable,
        endTable: f.endTable
      }));
      setFloorConfigs(mapped);
      // If stored floors have explicit ranges, default to manual range mode
      setUseManualRanges(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: reload from backend and persist to store
  const reloadQRCodes = async () => {
    try {
      if (!authenticatedRestaurant?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await apiService.getRestaurantQRTokens(authenticatedRestaurant.id);
      console.log('Backend QR response:', res);

      if (res?.success && Array.isArray(res.data)) {
        const mapped: QRCodeData[] = res.data.map((t: any) => {
          // Backend'den gelen qrUrl'i MUTLAKA kullan (backend doğru subdomain ile oluşturuyor)
          // Eğer backend'den qrUrl gelmiyorsa, frontend'de doğru subdomain ile oluştur
          const restaurantSlug = authenticatedRestaurant.username;

          console.log('🔍 Processing QR token:', {
            tableNumber: t.tableNumber,
            backendQrUrl: t.qrUrl,
            restaurantSlug: restaurantSlug,
            token: t.token?.substring(0, 20) + '...'
          });

          // Backend'den gelen qrUrl'i öncelikli kullan
          let backendQrUrl = t.qrUrl;

          // Eğer backend'den qrUrl gelmemişse veya yanlış subdomain içeriyorsa, düzelt
          if (!backendQrUrl) {
            if (!restaurantSlug) {
              console.error('❌ Cannot create QR URL without restaurant username');
              backendQrUrl = '';
            } else {
              backendQrUrl = `https://${restaurantSlug}.restxqr.com/menu/?t=${t.token}&table=${t.tableNumber}`;
              console.warn('⚠️ Backend qrUrl missing, created in frontend:', backendQrUrl);
            }
          } else if (backendQrUrl.includes('aksaray.restxqr.com') && restaurantSlug && restaurantSlug !== 'aksaray') {
            // Backend yanlış subdomain göndermişse düzelt
            console.warn('⚠️ Backend sent wrong subdomain, fixing:', {
              oldUrl: backendQrUrl,
              correctSubdomain: restaurantSlug
            });
            backendQrUrl = backendQrUrl.replace('aksaray.restxqr.com', `${restaurantSlug}.restxqr.com`);
            console.log('✅ Fixed URL:', backendQrUrl);
          }

          // QR kod resmi için URL'yi QR code generator API'ye gönder
          // QuickChart API kullanarak QR kod resmi oluştur
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(backendQrUrl)}`;

          console.log('QR Code generated:', {
            tableNumber: t.tableNumber,
            qrUrl: backendQrUrl,
            qrImageUrl,
            token: t.token
          });

          return {
            id: t.id,
            name: `Masa ${t.tableNumber} - QR Menü`,
            tableNumber: t.tableNumber,
            token: t.token,
            qrCode: qrImageUrl, // Her zaman QR kod resmi URL'i kullan
            url: backendQrUrl, // Menü URL'i
            createdAt: t.createdAt || new Date().toISOString(),
            theme: 'default',
            isActive: t.isActive !== false,
            scanCount: t.scanCount || 0,
            description: `Masa ${t.tableNumber} için QR kod`,
            type: 'table' as const,
            restaurantId: authenticatedRestaurant.id
          };
        });

        console.log('Mapped QR codes:', mapped);
        setQRCodes(mapped);
      } else {
        // Backend'de QR kod yoksa store'u temizle
        if (res?.success) {
          clearQRCodes();
        }
      }
    } catch (e) {
      console.error('Load QR tokens error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load existing QR codes from backend on mount/login
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      // Wait for auth to initialize
      if (!authenticatedRestaurant?.id && retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          if (mounted) {
            const state = useAuthStore.getState();
            if (state.authenticatedRestaurant?.id) {
              reloadQRCodes();
            } else if (retryCount < maxRetries) {
              loadWithRetry();
            } else {
              setLoading(false);
            }
          }
        }, 500 * retryCount); // Exponential backoff
        return;
      }

      if (authenticatedRestaurant?.id && mounted) {
        await reloadQRCodes();
      } else {
        setLoading(false);
      }
    };

    loadWithRetry();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedRestaurant?.id]);

  // Toplu QR kod oluşturma - Sabit QR kodları (basılabilir)
  const handleCreateBulkQRCodes = async () => {
    if (!authenticatedRestaurant) {
      showToast(getStatic('Restoran bilgisi bulunamadı!'), 'error');
      return;
    }

    try {
      setCreating(true);
      const tokens: string[] = [];

      const hasFloorSetup = Array.isArray(floorConfigs) && floorConfigs.length > 0 && floorConfigs.some(f => Number(f.tableCount) > 0);
      const totalTables = hasFloorSetup
        ? (useManualRanges
          ? Math.max(
            0,
            ...floorConfigs
              .map((f) => Number(f.endTable))
              .filter((n) => Number.isFinite(n))
          )
          : floorConfigs.reduce((sum, f) => sum + (Number(f.tableCount) || 0), 0))
        : tableCount;

      if (hasFloorSetup) {
        // Persist routing settings
        let cursor = 1;
        const routingFloors = floorConfigs
          .filter(f => {
            if (useManualRanges) {
              const s = Number(f.startTable);
              const e = Number(f.endTable);
              return Number.isFinite(s) && Number.isFinite(e) && e >= s;
            }
            return Number(f.tableCount) > 0;
          })
          .map((f) => {
            if (useManualRanges) {
              const startTable = Number(f.startTable);
              const endTable = Number(f.endTable);
              const count = endTable - startTable + 1;
              return {
                name: f.name,
                tableCount: count,
                startTable,
                endTable,
                stationId: f.drinkStationId
              };
            }

            const count = Number(f.tableCount) || 0;
            const startTable = cursor;
            const endTable = cursor + count - 1;
            cursor = endTable + 1;
            return {
              name: f.name,
              tableCount: count,
              startTable,
              endTable,
              stationId: f.drinkStationId
            };
          });

        settingsStore.updateSettings({
          drinkStationRouting: {
            drinkCategoryId: drinkCategoryId || null,
            floors: routingFloors
          }
        } as any);

        try {
          await settingsStore.saveSettings();
        } catch (e) {
          console.error('Failed to save drink station routing settings:', e);
        }
      }

      // Her masa için token oluştur
      for (let i = 1; i <= totalTables; i++) {
        try {
          const response = await apiService.generateQRToken({
            restaurantId: authenticatedRestaurant.id,
            tableNumber: i,
            duration: 24 // 24 saat geçerli
          });
          if (response.success && response.data?.token) {
            tokens.push(response.data.token);
          } else {
            throw new Error(getStatic('Token oluşturulamadı'));
          }
        } catch (error) {
          console.error('Token oluşturma hatası:', error);
          showToast(getStatic('Token oluşturulurken hata oluştu'), 'error');
          setCreating(false);
          return;
        }
      }

      // Backend'den QR kodları yeniden yükle (backend'de kaydedildi)
      await reloadQRCodes();
      setShowCreateModal(false);

      showToast(`${totalTables} ${getStatic('adet QR kod başarıyla oluşturuldu!')}`, 'success');
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      showToast(getStatic('QR kod oluşturulurken hata oluştu'), 'error');
    } finally {
      setCreating(false);
    }
  };

  // QR kod silme (backend deactivate + listeyi yenile)
  const handleDeleteQRCode = async (id: string, token?: string) => {
    try {
      if (token) {
        await apiService.deactivateQRToken(token);
      }
    } catch (e) {
      console.error('Deactivate QR error:', e);
    }
    await reloadQRCodes();
    showToast(getStatic('QR kod silindi.'), 'success');
  };

  // URL kopyalama - backend'in ürettiği qrUrl varsa onu kullan
  const handleCopyURL = (fallbackUrl: string, tableNumber?: number) => {
    try {
      if (!authenticatedRestaurant?.username) {
        showToast(getStatic('Restoran subdomain bilgisi bulunamadı'), 'error');
        return;
      }
      const sub = authenticatedRestaurant.username;
      const base = `https://${sub}.restxqr.com`;
      // fallbackUrl öncelik, yoksa doğru subdomain + table paramı ile kur
      const url = fallbackUrl || `${base}/menu/?table=${tableNumber || ''}`;
      navigator.clipboard.writeText(url);
      showToast(getStatic('URL kopyalandı!'), 'success');
    } catch {
      showToast(getStatic('URL kopyalanamadı'), 'error');
    }
  };

  // URL'yi yeni sekmede aç
  const handleOpenURL = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showToast(getStatic('URL bulunamadı'), 'error');
    }
  };

  // Checkbox seçim işlemleri
  const handleToggleSelect = (qrId: string) => {
    const newSelected = new Set(selectedQRCodes);
    if (newSelected.has(qrId)) {
      newSelected.delete(qrId);
    } else {
      newSelected.add(qrId);
    }
    setSelectedQRCodes(newSelected);
    setSelectAll(newSelected.size === qrCodes.length && qrCodes.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQRCodes(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(qrCodes.map(qr => qr.id));
      setSelectedQRCodes(allIds);
      setSelectAll(true);
    }
  };

  // Seçili QR kodları toplu işlemler
  const handleBulkDelete = async () => {
    if (selectedQRCodes.size === 0) {
      showToast(getStatic('Lütfen silmek için QR kod seçin'), 'error');
      return;
    }

    if (!confirm(`${selectedQRCodes.size} ${getStatic('adet QR kod silinecek. Emin misiniz?')}`)) {
      return;
    }

    try {
      const selectedCount = selectedQRCodes.size;
      for (const qrId of Array.from(selectedQRCodes)) {
        const qrCode = qrCodes.find(qr => qr.id === qrId);
        if (qrCode?.token) {
          await apiService.deactivateQRToken(qrCode.token);
        }
      }
      setSelectedQRCodes(new Set());
      setSelectAll(false);
      await reloadQRCodes();
      showToast(`${selectedCount} ${getStatic('adet QR kod silindi')}`, 'success');
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast(getStatic('Toplu silme işlemi başarısız'), 'error');
    }
  };

  const handleBulkDownload = () => {
    if (selectedQRCodes.size === 0) {
      showToast(getStatic('Lütfen indirmek için QR kod seçin'), 'error');
      return;
    }

    selectedQRCodes.forEach(qrId => {
      const qrCode = qrCodes.find(qr => qr.id === qrId);
      if (qrCode) {
        handleDownloadQR(qrCode);
      }
    });
    showToast(`${selectedQRCodes.size} ${getStatic('adet QR kod indiriliyor...')}`, 'success');
  };

  // QR kod indirme
  const handleDownloadQR = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `${qrCode.name}.png`;
    link.click();
  };

  // Print fonksiyonu
  const handlePrint = () => {
    window.print();
  };

  const onLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  if (!authenticatedRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600"><TranslatedText>Yükleniyor...</TranslatedText></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={onLogout}
        />
        <div className="lg:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600"><TranslatedText>QR kodlar yükleniyor...</TranslatedText></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />

      <div className="lg:pl-72 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900"><TranslatedText>QR Kod Yönetimi</TranslatedText></h1>
                  <p className="text-sm text-gray-600"><TranslatedText>Masa QR kodlarınızı oluşturun ve yönetin</TranslatedText></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSelector enabledLanguages={settings?.menuSettings?.language} />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <TranslatedText>QR Kod Oluştur</TranslatedText>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaQrcode className="text-3xl text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam QR Kod</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaEye className="text-3xl text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Aktif Kodlar</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.filter(qr => qr.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaCheck className="text-3xl text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600"><TranslatedText>Toplam Tarama</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">
                    {qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900"><TranslatedText>QR Kodlarım</TranslatedText></h2>
                {qrCodes.length > 0 && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {selectAll ? <FaCheckSquare className="text-blue-600" /> : <FaSquare />}
                      <span><TranslatedText>Tümünü Seç</TranslatedText></span>
                    </button>
                    {selectedQRCodes.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedQRCodes.size} <TranslatedText>seçili</TranslatedText>
                        </span>
                        <button
                          onClick={handleBulkDownload}
                          className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <TranslatedText>Toplu İndir</TranslatedText>
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TranslatedText>Toplu Sil</TranslatedText>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {qrCodes.length === 0 ? (
                <div className="text-center py-12">
                  <FaQrcode className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2"><TranslatedText>Henüz QR kod yok</TranslatedText></h3>
                  <p className="text-gray-600 mb-4"><TranslatedText>İlk QR kodunuzu oluşturmak için başlayın</TranslatedText></p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <TranslatedText>QR Kod Oluştur</TranslatedText>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCodes.map((qrCode) => {
                    const isSelected = selectedQRCodes.has(qrCode.id);
                    const floorInfo = findFloorForTable(qrCode.tableNumber);
                    return (
                      <div key={qrCode.id} className={`border rounded-lg p-4 hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => handleToggleSelect(qrCode.id)}
                            className="mt-1 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {isSelected ? <FaCheckSquare className="text-blue-600" /> : <FaSquare />}
                          </button>
                        </div>

                        <div className="text-center mb-4">
                          {qrCode.qrCode ? (
                            <img
                              src={qrCode.qrCode}
                              alt={qrCode.name}
                              className="w-32 h-32 mx-auto mb-2 border border-gray-200 rounded"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EQR%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 mx-auto mb-2 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                              <FaQrcode className="text-4xl" />
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900"><TranslatedText>Masa</TranslatedText> {qrCode.tableNumber} <TranslatedText>- QR Menü</TranslatedText></h3>
                          <p className="text-sm text-gray-600"><TranslatedText>Masa</TranslatedText> {qrCode.tableNumber} <TranslatedText>için QR kod</TranslatedText></p>
                          {floorInfo && (
                            <p className="text-xs text-gray-500 mt-1">
                              <TranslatedText>Kat</TranslatedText>: {floorInfo.name} ({floorInfo.startTable}-{floorInfo.endTable})
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleOpenURL(qrCode.url)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                          >
                            <FaExternalLinkAlt />
                            <TranslatedText>URL'yi Aç</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleCopyURL(qrCode.url, qrCode.tableNumber)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            <FaCopy />
                            <TranslatedText>URL Kopyala</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDownloadQR(qrCode)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          >
                            <FaDownload />
                            <TranslatedText>QR Kodunu İndir</TranslatedText>
                          </button>
                          <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                          >
                            <FaPrint />
                            <TranslatedText>Yazdır</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDeleteQRCode(qrCode.id, qrCode.token)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            <FaTrash />
                            <TranslatedText>Sil</TranslatedText>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900"><TranslatedText>QR Kod Oluştur</TranslatedText></h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TranslatedText>İçecek Kategorisi</TranslatedText>
                  </label>
                  <select
                    value={drinkCategoryId}
                    onChange={(e) => setDrinkCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{getStatic('Kategori Seçin')}</option>
                    {menuCategories
                      .slice()
                      .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')))
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TranslatedText>Katlara Göre İçecek İstasyonu</TranslatedText>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={useManualRanges}
                      onChange={(e) => setUseManualRanges(e.target.checked)}
                    />
                    <TranslatedText>Aralıkları manuel seç (Start-End)</TranslatedText>
                  </label>

                  <div className="space-y-2">
                    {floorConfigs.map((f, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => {
                            const next = [...floorConfigs];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setFloorConfigs(next);
                          }}
                          className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder={getStatic('Örn: 1. Kat')}
                        />
                        <input
                          type="number"
                          min="0"
                          value={f.tableCount}
                          onChange={(e) => {
                            const next = [...floorConfigs];
                            next[idx] = { ...next[idx], tableCount: parseInt(e.target.value) || 0 };
                            setFloorConfigs(next);
                          }}
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg"
                          disabled={useManualRanges}
                        />

                        {useManualRanges ? (
                          <>
                            <input
                              type="number"
                              min="1"
                              value={f.startTable ?? ''}
                              onChange={(e) => {
                                const next = [...floorConfigs];
                                next[idx] = { ...next[idx], startTable: parseInt(e.target.value) || 0 };
                                setFloorConfigs(next);
                              }}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Start"
                            />
                            <input
                              type="number"
                              min="1"
                              value={f.endTable ?? ''}
                              onChange={(e) => {
                                const next = [...floorConfigs];
                                next[idx] = { ...next[idx], endTable: parseInt(e.target.value) || 0 };
                                setFloorConfigs(next);
                              }}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="End"
                            />
                          </>
                        ) : (
                          <div className="col-span-4 text-xs text-gray-600">
                            <span className="font-semibold">{getFloorRangePreview(idx)}</span>
                          </div>
                        )}

                        <select
                          value={f.drinkStationId}
                          onChange={(e) => {
                            const next = [...floorConfigs];
                            next[idx] = { ...next[idx], drinkStationId: e.target.value };
                            setFloorConfigs(next);
                          }}
                          className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">{getStatic('İstasyon Seçin')}</option>
                          {(authenticatedRestaurant?.kitchenStations || [])
                            .slice()
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.emoji ? `${s.emoji} ` : ''}{s.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const next = floorConfigs.filter((_, i) => i !== idx);
                            setFloorConfigs(next.length ? next : [{ name: '1. Kat', tableCount: 0, drinkStationId: '' }]);
                          }}
                          className="col-span-1 px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFloorConfigs([...floorConfigs, { name: `${floorConfigs.length + 1}. Kat`, tableCount: 0, drinkStationId: '' }])}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <TranslatedText>Kat Ekle</TranslatedText>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFloorConfigs([{ name: '1. Kat', tableCount: tableCount, drinkStationId: '' }])}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <TranslatedText>Sıfırla</TranslatedText>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    <TranslatedText>Örnek:</TranslatedText> 1. Kat = 18 masa, 2. Kat = 24 masa → Masa 1-18 ve 19-42 otomatik hesaplanır.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TranslatedText>Masa Sayısı</TranslatedText>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  <TranslatedText>1 ile 50 arasında masa sayısı seçebilirsiniz</TranslatedText>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  <TranslatedText>İptal</TranslatedText>
                </button>
                <button
                  onClick={handleCreateBulkQRCodes}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <TranslatedText>Oluşturuluyor...</TranslatedText>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <TranslatedText>Oluştur</TranslatedText>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
            {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
