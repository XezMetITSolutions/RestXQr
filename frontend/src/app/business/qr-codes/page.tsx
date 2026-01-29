'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
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
  FaSquare,
  FaSync
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
  const [visibleCount, setVisibleCount] = useState(30);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [menuCategories, setMenuCategories] = useState<any[]>([]);

  // Drink routing config
  const [drinkCategoryId, setDrinkCategoryId] = useState('');
  const [useManualRanges, setUseManualRanges] = useState(false);
  const [floorConfigs, setFloorConfigs] = useState<
    Array<{ name: string; tableCount: number; drinkStationId: string; startTable?: number; endTable?: number }>
  >([
    { name: '1. Kat', tableCount: 10, drinkStationId: '' }
  ]);

  // Auth & Init
  useEffect(() => {
    initializeAuth();
    const t = setTimeout(() => setAuthTimeout(true), 2000);
    return () => clearTimeout(t);
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    }
  }, [isAuthenticated, router]);

  // Load Menu Categories
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
    if (authenticatedRestaurant?.id) {
      loadCategories();
    }
  }, [authenticatedRestaurant?.id]);

  // Sync settings to local state
  useEffect(() => {
    const cfg = (settings as any)?.drinkStationRouting;
    if (cfg) {
      if (cfg.drinkCategoryId && !drinkCategoryId) {
        setDrinkCategoryId(cfg.drinkCategoryId);
      }
      if (Array.isArray(cfg.floors) && cfg.floors.length > 0) {
        const mapped = cfg.floors.map((f: any, idx: number) => ({
          name: f.name || `${idx + 1}. Kat`,
          tableCount: Number(f.tableCount || ((Number(f.endTable) - Number(f.startTable) + 1) || 0)) || 0,
          drinkStationId: f.stationId || '',
          startTable: f.startTable,
          endTable: f.endTable
        }));
        setFloorConfigs(mapped);
        setUseManualRanges(true);
      }
    }
  }, [settings, drinkCategoryId]);

  useEffect(() => {
    setVisibleCount(30);
    setSelectedQRCodes(new Set());
    setSelectAll(false);
  }, [qrCodes.length]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to fetch QRs
  const reloadQRCodes = async () => {
    try {
      if (!authenticatedRestaurant?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setApiError(null);

      // Timeout wrapper - 30 saniye (cold start için)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sunucu yanıt vermedi. Lütfen daha sonra tekrar deneyin.')), 30000)
      );

      const res = await Promise.race([
        apiService.getRestaurantQRTokens(authenticatedRestaurant.id),
        timeoutPromise
      ]) as any;

      if (res?.success && Array.isArray(res.data)) {
        const mapped: QRCodeData[] = res.data.map((t: any) => {
          const restaurantSlug = authenticatedRestaurant.username;
          let backendQrUrl = t.qrUrl;

          if (!backendQrUrl) {
            backendQrUrl = restaurantSlug
              ? `https://${restaurantSlug}.restxqr.com/menu/?t=${t.token}&table=${t.tableNumber}`
              : '';
          } else if (backendQrUrl.includes('aksaray.restxqr.com') && restaurantSlug && restaurantSlug !== 'aksaray') {
            backendQrUrl = backendQrUrl.replace('aksaray.restxqr.com', `${restaurantSlug}.restxqr.com`);
          }

          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(backendQrUrl)}`;

          return {
            id: t.id,
            name: `Masa ${t.tableNumber} - QR Menü`,
            tableNumber: t.tableNumber,
            token: t.token,
            qrCode: qrImageUrl,
            url: backendQrUrl,
            createdAt: t.createdAt || new Date().toISOString(),
            theme: 'default',
            isActive: t.isActive !== false,
            scanCount: t.scanCount || 0,
            description: `Masa ${t.tableNumber} için QR kod`,
            type: 'table' as const,
            restaurantId: authenticatedRestaurant.id
          };
        });

        setQRCodes(mapped);
      } else {
        if (res?.success) clearQRCodes();
      }
    } catch (e: any) {
      console.error('Load QR tokens error:', e);
      setApiError(e?.message || 'QR kodları yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = async () => {
      if (!authenticatedRestaurant?.id && retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          if (mounted) loadWithRetry();
        }, 500 * retryCount);
        return;
      }

      if (authenticatedRestaurant?.id && mounted) {
        await reloadQRCodes();
      } else {
        setLoading(false);
      }
    };

    loadWithRetry();
    return () => { mounted = false; };
  }, [authenticatedRestaurant?.id]);

  // Create Logic
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
        // Prepare routing floors for saving
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
            // For simple saving: just save what user entered (rely on previous logic)
            return {
              name: f.name,
              tableCount: Number(f.tableCount),
              startTable: f.startTable,
              endTable: f.endTable,
              stationId: f.drinkStationId
            };
          });

        if (!useManualRanges) {
          let cursor = 1;
          routingFloors.forEach(f => {
            f.startTable = cursor;
            f.endTable = cursor + f.tableCount - 1;
            cursor = f.endTable + 1;
          });
        }

        settingsStore.updateSettings({
          drinkStationRouting: {
            drinkCategoryId: drinkCategoryId || null,
            floors: routingFloors
          }
        } as any);

        try {
          await settingsStore.saveSettings();
        } catch (e) {
          console.error('Failed to save drink settings:', e);
        }
      }

      // Generate Tokens
      for (let i = 1; i <= totalTables; i++) {
        try {
          const response = await apiService.generateQRToken({
            restaurantId: authenticatedRestaurant.id,
            tableNumber: i,
            duration: 24
          });
          if (response.success && response.data?.token) {
            tokens.push(response.data.token);
          }
        } catch (error) {
          console.error(`Error generating token for table ${i}`, error);
        }
      }

      await reloadQRCodes();
      setShowCreateModal(false);
      showToast(`${totalTables} ${getStatic('adet QR kod başarıyla oluşturuldu!')}`, 'success');
    } catch (error) {
      console.error('QR creation error:', error);
      showToast(getStatic('QR kod oluşturulurken hata oluştu'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQRCode = async (token?: string) => {
    try {
      if (token) {
        await apiService.deactivateQRToken(token);
        await reloadQRCodes();
        showToast(getStatic('QR kod silindi.'), 'success');
      }
    } catch (e) {
      console.error('Deactivate error:', e);
      showToast(getStatic('Silme işlemi başarısız'), 'error');
    }
  };

  const handleCopyURL = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      showToast(getStatic('URL kopyalandı!'), 'success');
    } catch {
      showToast(getStatic('URL kopyalanamadı'), 'error');
    }
  };

  // Bulk Actions
  const handleToggleSelect = (qrId: string) => {
    const newSelected = new Set(selectedQRCodes);
    if (newSelected.has(qrId)) newSelected.delete(qrId);
    else newSelected.add(qrId);
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

  const handleBulkDelete = async () => {
    if (selectedQRCodes.size === 0) return;
    if (!confirm(`${selectedQRCodes.size} ${getStatic('adet QR kod silinecek. Emin misiniz?')}`)) return;

    try {
      for (const qrId of Array.from(selectedQRCodes)) {
        const qrCode = qrCodes.find(qr => qr.id === qrId);
        if (qrCode?.token) await apiService.deactivateQRToken(qrCode.token);
      }
      setSelectedQRCodes(new Set());
      setSelectAll(false);
      await reloadQRCodes();
      showToast(getStatic('Seçili QR kodlar silindi'), 'success');
    } catch (e) {
      showToast(getStatic('Toplu silme hatası'), 'error');
    }
  };

  // Profesyonel QR Kart Oluşturucu
  const generateQRCardBlob = async (qrCode: QRCodeData): Promise<Blob | null> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Canvas boyutu (Kare - Sadece QR)
      const size = 1000;
      canvas.width = size;
      canvas.height = size;

      // Arka plan (Beyaz)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Resim yükleme yardımcı fonksiyonu
      const loadImage = (url: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      // Logoları ve QR'ı yükle
      const logoUrl = settings?.branding?.logo || authenticatedRestaurant?.logo || '/logo.png';
      const [logoImg, qrImg] = await Promise.all([
        loadImage(logoUrl),
        loadImage(qrCode.qrCode)
      ]);

      if (!qrImg) return null;

      // QR Kod Alanı (Tüm canvası kaplasın ama biraz margin kalsın)
      const qrSize = 900;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = (canvas.height - qrSize) / 2;

      // QR Kodu Çiz
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // QR Ortasına Logo
      if (logoImg) {
        // Logo boyutunu artırıyoruz (0.22 -> 0.26) ve beyaz alanı daraltıyoruz
        const logoCenterSize = qrSize * 0.26;
        const lcx = qrX + (qrSize - logoCenterSize) / 2;
        const lcy = qrY + (qrSize - logoCenterSize) / 2;
        const centerX = lcx + logoCenterSize / 2;
        const centerY = lcy + logoCenterSize / 2;

        // Logo arkasına dairesel beyaz alan (Daha dar bir sınır - Quiet Zone)
        const radius = (logoCenterSize / 2) + 4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Logo çizimi (Aspect ratio koruyarak ortala)
        const ar = logoImg.width / logoImg.height;
        let dw, dh;
        if (ar > 1) {
          dw = logoCenterSize;
          dh = logoCenterSize / ar;
        } else {
          dh = logoCenterSize;
          dw = logoCenterSize * ar;
        }

        ctx.drawImage(logoImg, centerX - dw / 2, centerY - dh / 2, dw, dh);
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob));
      });
    } catch (e) {
      console.error('QR card generation error:', e);
      return null;
    }
  };

  const handleBulkDownload = async () => {
    if (selectedQRCodes.size === 0) return;

    showToast(getStatic('QR kodları hazırlanıyor...'), 'success');

    const zip = new JSZip();
    const qrFolder = zip.folder('QR_Kodlari');

    if (!qrFolder) return;

    let processedCount = 0;

    for (const qrId of Array.from(selectedQRCodes)) {
      const qrCode = qrCodes.find(qr => qr.id === qrId);
      if (qrCode) {
        const blob = await generateQRCardBlob(qrCode);
        if (blob) {
          qrFolder.file(`Table_${qrCode.tableNumber}_Menu_QR.png`, blob);
          processedCount++;
        }
      }
    }

    // ZIP dosyasını oluştur ve indir
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Menu_QR_Cards_${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(getStatic(`${processedCount} QR card indirildi!`), 'success');
  };

  const handleDownloadSingle = async (qr: QRCodeData) => {
    try {
      showToast(getStatic('Kart indiriliyor...'), 'success');
      const blob = await generateQRCardBlob(qr);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Table_${qr.tableNumber}_Menu_QR.png`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        showToast(getStatic('QR kart oluşturulamadı.'), 'error');
      }
    } catch (e) {
      console.error('Single QR card download error:', e);
      showToast(getStatic('İndirme hatası'), 'error');
    }
  };

  const findFloorForTable = (tableNumber?: number) => {
    const t = Number(tableNumber);
    if (!Number.isFinite(t)) return null;
    const cfg = (settings as any)?.drinkStationRouting;
    const floors = Array.isArray(cfg?.floors) ? cfg.floors : [];
    const match = floors.find((f: any) => Number(f.startTable) <= t && t <= Number(f.endTable));
    if (!match) return null;
    return { name: match.name, start: match.startTable, end: match.endTable };
  };

  const onLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  // Render Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout} />
        <div className="lg:pl-64 flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600"><TranslatedText>QR kodlar yükleniyor...</TranslatedText></p>
        </div>
      </div>
    );
  }

  // Render Auth Error / Timeout
  if (!authenticatedRestaurant && authTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-lg p-6 max-w-md w-full text-center shadow">
          <h2 className="text-lg font-semibold text-gray-900"><TranslatedText>Oturum Hatası</TranslatedText></h2>
          <p className="text-sm text-gray-600 mt-2 mb-4"><TranslatedText>Restoran bilgisi alınamadı. Lütfen tekrar giriş yapın.</TranslatedText></p>
          <button onClick={() => router.push('/isletme-giris')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <TranslatedText>Giriş Yap</TranslatedText>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout} />

      <div className="lg:pl-72 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600">
                  <FaQrcode />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900"><TranslatedText>QR Kod Yönetimi</TranslatedText></h1>
                  <p className="text-sm text-gray-600"><TranslatedText>Masa QR kodlarınızı oluşturun ve yönetin</TranslatedText></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSelector enabledLanguages={settings?.menuSettings?.language} />
                <button onClick={reloadQRCodes} className="p-2 text-gray-600 hover:text-blue-600" title="Yenile">
                  <FaSync className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                  <FaPlus />
                  <span className="hidden sm:inline"><TranslatedText>QR Kod Oluştur</TranslatedText></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-red-500 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium"><TranslatedText>Bağlantı Hatası</TranslatedText></h3>
                  <p className="text-red-700 text-sm">{apiError}</p>

                  {/* Debug Bilgisi */}
                  <details className="mt-3 text-xs text-red-600">
                    <summary className="cursor-pointer font-medium hover:underline">🔍 Debug Bilgisi (Tıkla)</summary>
                    <div className="mt-2 p-3 bg-white rounded border border-red-200 font-mono text-xs space-y-1">
                      <div><strong>Restaurant ID:</strong> {authenticatedRestaurant?.id || 'YOK'}</div>
                      <div><strong>Restaurant Username:</strong> {authenticatedRestaurant?.username || 'YOK'}</div>
                      <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/api/qr/restaurant/{authenticatedRestaurant?.id}/tables</div>
                      <div><strong>Timeout:</strong> 30 saniye</div>
                      <div><strong>Loaded QRs:</strong> {qrCodes.length}</div>
                      <div><strong>Zaman:</strong> {new Date().toLocaleString('tr-TR')}</div>
                      <button
                        onClick={async () => {
                          const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com'}/api/qr/restaurant/${authenticatedRestaurant?.id}/tables`;
                          console.log('🔍 Manuel API Test:', url);
                          try {
                            const res = await fetch(url);
                            const data = await res.json();
                            console.log('✅ Response:', data);
                            alert(`Status: ${res.status}\nData: ${JSON.stringify(data, null, 2)}`);
                          } catch (e: any) {
                            console.error('❌ Error:', e);
                            alert(`Error: ${e.message}`);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        🧪 Manuel API Test
                      </button>
                    </div>
                  </details>
                </div>
              </div>
              <button onClick={reloadQRCodes} className="px-3 py-1 bg-white text-red-600 border border-red-200 rounded text-sm hover:bg-red-50">
                <TranslatedText>Tekrar Dene</TranslatedText>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 mr-4">
                  <FaQrcode className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500"><TranslatedText>Toplam QR Kod</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-full text-green-600 mr-4">
                  <FaEye className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500"><TranslatedText>Aktif Kodlar</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.filter(q => q.isActive).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-orange-50 rounded-full text-orange-600 mr-4">
                  <FaCheck className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500"><TranslatedText>Toplam Tarama</TranslatedText></p>
                  <p className="text-2xl font-bold text-gray-900">{qrCodes.reduce((s, q) => s + (q.scanCount || 0), 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          {qrCodes.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border transition-colors"
                >
                  {selectAll ? <FaCheckSquare className="text-blue-600" /> : <FaSquare className="text-gray-400" />}
                  <span><TranslatedText>Tümünü Seç</TranslatedText></span>
                </button>
                <span className="text-sm text-gray-500 border-l pl-3 ml-1">
                  {selectedQRCodes.size} <TranslatedText>seçili</TranslatedText>
                </span>
              </div>

              {selectedQRCodes.size > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleBulkDownload} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors">
                    <FaDownload size={14} />
                    <span className="text-sm font-medium"><TranslatedText>İndir</TranslatedText></span>
                  </button>
                  <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                    <FaTrash size={14} />
                    <span className="text-sm font-medium"><TranslatedText>Sil</TranslatedText></span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grid Layout */}
          {qrCodes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow border border-dashed border-gray-300">
              <FaQrcode className="mx-auto text-6xl text-gray-300 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2"><TranslatedText>Henüz QR kod oluşturulmadı</TranslatedText></h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto"><TranslatedText>Masalarınız için QR kodları oluşturarak müşterilerinizin menüye hızlıca erişmesini sağlayın.</TranslatedText></p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 shadow-lg transform transition hover:-translate-y-1"
              >
                <TranslatedText>Hemen Oluştur</TranslatedText>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrCodes.slice(0, visibleCount).map((qr) => {
                const isSelected = selectedQRCodes.has(qr.id);
                const floor = findFloorForTable(qr.tableNumber);
                return (
                  <div key={qr.id} className={`group relative bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}>
                    {/* Card Header & Selection */}
                    <div className="absolute top-3 left-3 z-10">
                      <button onClick={() => handleToggleSelect(qr.id)} className="text-gray-400 hover:text-blue-600 transition-colors p-1 bg-white rounded-full shadow-sm">
                        {isSelected ? <FaCheckSquare className="text-blue-600 text-lg" /> : <FaSquare className="text-lg" />}
                      </button>
                    </div>

                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => handleDeleteQRCode(qr.token)} className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50" title="Sil">
                        <FaTrash size={12} />
                      </button>
                    </div>

                    {/* QR Image Area */}
                    <div className="p-6 bg-gray-50 flex flex-col items-center justify-center border-b border-gray-100">
                      <div className="bg-white p-2 rounded-lg shadow-sm relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qr.qrCode} alt={qr.name} className="w-32 h-32 object-contain" />
                        {(settings?.branding?.logo || authenticatedRestaurant?.logo || '/logo.png') && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 bg-white p-0.5 rounded shadow-sm border border-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={settings?.branding?.logo || authenticatedRestaurant?.logo || '/logo.png'}
                                alt="logo"
                                className="w-full h-full object-contain"
                                onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {floor && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {floor.name}
                          </span>
                        )}
                        <button
                          onClick={() => handleDownloadSingle(qr)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full hover:bg-gray-300 flex items-center gap-1"
                          title="Kartı İndir"
                        >
                          <FaDownload size={10} /> <TranslatedText>Kart</TranslatedText>
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{qr.tableNumber}. <TranslatedText>Masa</TranslatedText></h4>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-xs text-gray-500 truncate font-mono">
                          {qr.url}
                        </div>
                        <button onClick={() => handleCopyURL(qr.url)} className="text-blue-600 hover:text-blue-800 p-1" title="Kopyala">
                          <FaCopy />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                          {typeof qr.createdAt === 'string' || qr.createdAt instanceof Date ? new Date(qr.createdAt).toLocaleDateString() : ''}
                        </span>
                        <a
                          href={qr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-xs"
                        >
                          <FaExternalLinkAlt size={10} /> <TranslatedText>Aç</TranslatedText>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {qrCodes.length > visibleCount && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 30)}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 bg-white shadow-sm font-medium"
              >
                <TranslatedText>Daha Fazla Göster</TranslatedText>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900"><TranslatedText>Toplu QR Kod Oluştur</TranslatedText></h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Mode Selection Toggle */}
              <div className="flex p-1 bg-gray-100 rounded-lg w-max">
                <button
                  onClick={() => setUseManualRanges(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!useManualRanges ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <TranslatedText>Otomatik Sıralama</TranslatedText>
                </button>
                <button
                  onClick={() => setUseManualRanges(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${useManualRanges ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <TranslatedText>Manuel Aralıklar</TranslatedText>
                </button>
              </div>

              <div className="space-y-4">
                {floorConfigs.map((floor, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700"><TranslatedText>Kat / Bölüm</TranslatedText> {idx + 1}</h3>
                      {floorConfigs.length > 1 && (
                        <button
                          onClick={() => setFloorConfigs(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1"><TranslatedText>Bölüm Adı</TranslatedText></label>
                        <input
                          type="text"
                          value={floor.name}
                          onChange={(e) => {
                            const newFloors = [...floorConfigs];
                            newFloors[idx].name = e.target.value;
                            setFloorConfigs(newFloors);
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Örn: Bahçe, Teras"
                        />
                      </div>

                      {useManualRanges ? (
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1"><TranslatedText>Başlangıç</TranslatedText></label>
                            <input
                              type="number"
                              min="1"
                              value={floor.startTable || ''}
                              onChange={(e) => {
                                const newFloors = [...floorConfigs];
                                newFloors[idx].startTable = parseInt(e.target.value) || 0;
                                setFloorConfigs(newFloors);
                              }}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1"><TranslatedText>Bitiş</TranslatedText></label>
                            <input
                              type="number"
                              min="1"
                              value={floor.endTable || ''}
                              onChange={(e) => {
                                const newFloors = [...floorConfigs];
                                newFloors[idx].endTable = parseInt(e.target.value) || 0;
                                setFloorConfigs(newFloors);
                              }}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1"><TranslatedText>Masa Sayısı</TranslatedText></label>
                          <input
                            type="number"
                            min="1"
                            value={floor.tableCount}
                            onChange={(e) => {
                              const newFloors = [...floorConfigs];
                              newFloors[idx].tableCount = parseInt(e.target.value) || 0;
                              setFloorConfigs(newFloors);
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1"><TranslatedText>İçecek İstasyonu (Opsiyonel)</TranslatedText></label>
                        <select
                          value={floor.drinkStationId}
                          onChange={(e) => {
                            const newFloors = [...floorConfigs];
                            newFloors[idx].drinkStationId = e.target.value;
                            setFloorConfigs(newFloors);
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700"
                        >
                          <option value=""><TranslatedText>Seçiniz...</TranslatedText></option>
                          {authenticatedRestaurant?.kitchenStations?.map((station: any) => (
                            <option key={station.id} value={station.id}>{station.name}</option>
                          )) || []}
                        </select>
                        <p className="text-xs text-gray-400 mt-1"><TranslatedText>Bu bölümdeki siparişlerin içecekleri hangi istasyona düşsün?</TranslatedText></p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setFloorConfigs([...floorConfigs, { name: '', tableCount: 0, drinkStationId: '' }])}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  + <TranslatedText>Yeni Bölüm Ekle</TranslatedText>
                </button>
              </div>

              {/* Drink Category Config */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2"><TranslatedText>İçecek Kategorisi</TranslatedText></label>
                <select
                  value={drinkCategoryId}
                  onChange={(e) => setDrinkCategoryId(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value=""><TranslatedText>Örn: İçecekler</TranslatedText></option>
                  {menuCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1"><TranslatedText>Hangi kategorideki ürünler yönlendirilecek?</TranslatedText></p>
              </div>

            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={handleCreateBulkQRCodes}
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <TranslatedText>Oluşturuluyor...</TranslatedText>
                  </>
                ) : (
                  <TranslatedText>Oluştur</TranslatedText>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white z-50 transition-all transform translate-y-0 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

    </div>
  );
}
