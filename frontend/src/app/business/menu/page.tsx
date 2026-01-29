'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUtensils,
  FaFire,
  FaTag,
  FaChartBar,
  FaStore,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaQrcode,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaEye,
  FaClipboardList,
  FaTimes,
  FaFolderOpen,
  FaCamera,
  FaUpload,
  FaPercent,
  FaCheck,
  FaExclamationTriangle,
  FaBars,
  FaMoneyBillWave,
  FaGlobe,
  FaMagic,
  FaLanguage,
  FaClock,
  FaBoxOpen,
  FaProjectDiagram,
  FaExchangeAlt
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import { lazy, Suspense } from 'react';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useFeature } from '@/hooks/useFeature';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { translateWithDeepL } from '@/lib/deepl';
import TranslatedText, { staticDictionary } from '@/components/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';

// Lazy load heavy components
const CameraCapture = lazy(() => import('@/components/CameraCapture'));
const ImageUploader = lazy(() => import('@/components/ImageUploader'));
const BulkImportModal = lazy(() => import('@/components/BulkImportModal'));

export default function MenuManagement() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const {
    currentRestaurant,
    restaurants,
    categories: allCategories,
    menuItems: allMenuItems,
    createMenuCategory,
    createMenuItem,
    updateMenuCategory,
    deleteMenuCategory,
    updateMenuItem,
    deleteMenuItem,
    updateRestaurant,
    fetchCurrentRestaurant,
    fetchRestaurantMenu,
    loading,
    error
  } = useRestaurantStore();

  // Feature kontrolü kaldırıldı - herkes menü yönetimine erişebilir

  // Restoran ID'sini al
  const getRestaurantId = useCallback(() => {
    // Önce authenticated restaurant'tan al
    if (authenticatedRestaurant?.id) {
      return authenticatedRestaurant.id;
    }

    // Subdomain'den de alabilir (fallback)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      const mainDomains = ['localhost', 'www', 'guzellestir'];

      if (!mainDomains.includes(subdomain) && hostname.includes('.')) {
        // Subdomain'e göre restaurant bul
        const restaurant = restaurants.find(r =>
          r.name.toLowerCase().replace(/\s+/g, '') === subdomain ||
          r.username === subdomain
        );
        return restaurant?.id;
      }
    }
    return null;
  }, [authenticatedRestaurant?.id, restaurants]);

  const currentRestaurantId = getRestaurantId();

  console.log('🔍 Filtering data:');
  console.log('  currentRestaurantId:', currentRestaurantId);
  console.log('  allCategories:', allCategories.length);
  console.log('  allMenuItems:', allMenuItems.length);

  // Sadece bu restorana ait kategorileri ve ürünleri filtrele
  const categories = allCategories.filter(c => c.restaurantId === currentRestaurantId);
  const items = allMenuItems.filter(i => i.restaurantId === currentRestaurantId);

  console.log('  filtered items:', items.length);
  console.log('  first item restaurantId:', allMenuItems[0]?.restaurantId);
  console.log('  match?', allMenuItems[0]?.restaurantId === currentRestaurantId);

  const getLangCode = (language: string) => {
    switch (language) {
      case 'German': return 'de';
      case 'English': return 'en';
      case 'Turkish': return 'tr';
      case 'Arabic': return 'ar';
      case 'Russian': return 'ru';
      case 'French': return 'fr';
      case 'Spanish': return 'es';
      case 'Italian': return 'it';
      default: return 'en';
    }
  };

  const t = (text: string) => {
    const code = getLangCode(currentLanguage);
    return staticDictionary[text]?.[code] || text;
  }; const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || t('Kullanıcı');

  const [activeTab, setActiveTab] = useState<'items' | 'combos' | 'categories' | 'stations' | 'mapping' | 'stats'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showStationForm, setShowStationForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [stations, setStations] = useState<Array<{ id: string, name: string, emoji: string, color: string, order: number }>>([]);
  const [isStationsInitialized, setIsStationsInitialized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out-of-stock'>('all');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [subcategories, setSubcategories] = useState<Array<{ id: string, name: { tr: string, en: string } }>>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [mappingFilter, setMappingFilter] = useState<'all' | 'unmapped'>('all');
  const [bulkPriceType, setBulkPriceType] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkPriceOperation, setBulkPriceOperation] = useState<'increase' | 'decrease'>('increase');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTranslationsModal, setShowTranslationsModal] = useState(false);
  const [selectedItemForTranslation, setSelectedItemForTranslation] = useState<any>(null);
  const [translations, setTranslations] = useState<{ [key: string]: { name: string, description: string } }>({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [showBulkTranslateModal, setShowBulkTranslateModal] = useState(false);
  const [selectedBulkLanguages, setSelectedBulkLanguages] = useState<string[]>([]);

  // Quick Edit States
  const [quickEditItem, setQuickEditItem] = useState<any>(null);
  const [quickEditData, setQuickEditData] = useState({ name: '', price: '', category: '', kitchenStation: '' });




  const { settings } = useBusinessSettingsStore();
  const selectedLanguages = settings?.menuSettings?.language?.length
    ? settings?.menuSettings?.language
    : ['tr'];
  const translationLanguages = useMemo(
    () => selectedLanguages.filter((lang) => lang !== 'tr'),
    [selectedLanguages]
  );

  // Form state'leri
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    preparationTime: '',
    calories: '',
    ingredients: '',
    allergens: [] as string[],
    portion: '',
    isAvailable: true,
    isPopular: false,
    kitchenStation: '',
    translations: {},
    variations: [] as Array<{ name: string, price: number }>,
    options: [] as Array<{ name: string, values: string[] }>,
    type: 'single' as 'single' | 'bundle',
    bundleItems: [] as Array<{ itemId: string; quantity: number; name?: string }>,
    discountedPrice: '',
    discountPercentage: '',
    discountStartDate: '',
    discountEndDate: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
    kitchenStation: '',
    translations: {},
    discountPercentage: '',
    discountStartDate: '',
    discountEndDate: ''
  });

  const [stationFormData, setStationFormData] = useState({
    name: '',
    emoji: '',
    color: '#3B82F6',
    order: 0,
    ipAddress: ''
  });
  const [isTranslatingItem, setIsTranslatingItem] = useState(false);
  const [itemTranslationError, setItemTranslationError] = useState<string | null>(null);
  const [isTranslatingCategory, setIsTranslatingCategory] = useState(false);
  const [categoryTranslationError, setCategoryTranslationError] = useState<string | null>(null);

  // Kamera stream'ini video element'ine bağla
  useEffect(() => {
    if (cameraStream && showCameraModal) {
      const video = document.getElementById('camera-video') as HTMLVideoElement;
      if (video) {
        video.srcObject = cameraStream;
      }
    }
  }, [cameraStream, showCameraModal]);

  // Sayfa yüklendiğinde auth'u initialize et
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Sayfa yüklendiğinde menüyü backend'den çek
  useEffect(() => {
    console.log('🏪 Current Restaurant ID:', currentRestaurantId);
    if (currentRestaurantId) {
      console.log('📥 Fetching menu for restaurant:', currentRestaurantId);
      fetchRestaurantMenu(currentRestaurantId);
      fetchCurrentRestaurant(currentRestaurantId);
    } else {
      console.warn('⚠️ No restaurant ID found!');
    }
  }, [currentRestaurantId, fetchRestaurantMenu]);

  useEffect(() => {
    if (currentRestaurant && !isStationsInitialized) {
      console.log('🔄 Initializing stations from currentRestaurant:', currentRestaurant.kitchenStations);

      // kitchenStations undefined ise initialized yapma, gelmesini bekle
      if (currentRestaurant.kitchenStations === undefined) {
        console.log('⏳ kitchenStations is undefined, waiting for data...');
        return;
      }

      if (Array.isArray(currentRestaurant.kitchenStations) && currentRestaurant.kitchenStations.length > 0) {
        setStations(currentRestaurant.kitchenStations);
        setIsStationsInitialized(true);
        console.log('✅ Stations set from existing data');
      } else if (currentRestaurant.kitchenStations === null || (Array.isArray(currentRestaurant.kitchenStations) && currentRestaurant.kitchenStations.length === 0)) {
        // Eğer backend'de hiç yoksa varsayılanları koy
        const defaults = [
          { id: 'kavurma', name: 'KAVURMA', emoji: '🥩', color: '#EF4444', order: 1 },
          { id: 'ramen', name: 'RAMEN', emoji: '🍜', color: '#F59E0B', order: 2 },
          { id: 'kebap', name: 'KEBAP', emoji: '🍢', color: '#D97706', order: 3 },
          { id: 'manti', name: 'MANTI', emoji: '🥟', color: '#10B981', order: 4 },
          { id: 'icecek1', name: '1. Kat İçecek', emoji: '🥤', color: '#3B82F6', order: 5 },
          { id: 'icecek2', name: '2. Kat İçecek', emoji: '🍷', color: '#8B5CF6', order: 6 },
          { id: 'ortakasa', name: 'ORTA KASA', emoji: '💻', color: '#6B7280', order: 7 },
          { id: 'test', name: 'Test Yazıcısı', emoji: '🔧', color: '#9CA3AF', order: 99 }
        ];
        setStations(defaults);
        setIsStationsInitialized(true);
        console.log('✅ Stations set to defaults');
      }
    }
  }, [currentRestaurant, isStationsInitialized]);

  useEffect(() => {
    // Eğer subdomain varsa authenticated olmadan da çalışsın (test için)
    const hasSubdomain = typeof window !== 'undefined' &&
      !['localhost', 'www', 'guzellestir'].includes(window.location.hostname.split('.')[0]) &&
      window.location.hostname.includes('.');

    if (!isAuthenticated() && !hasSubdomain) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Modal açıkken clipboard'dan paste desteği
  useEffect(() => {
    if (!showItemForm) return;

    const handlePaste = async (e: ClipboardEvent) => {
      e.preventDefault();
      const items = e.clipboardData?.items;

      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            console.log('📋 Modal açıkken yapıştırılan resim:', file.name || 'Clipboard', 'Boyut:', file.size, 'Tip:', file.type);

            // Dosya boyutunu kontrol et (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              alert(t('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'));
              return;
            }

            // Resim yükleme
            try {
              const formData = new FormData();
              formData.append('image', file);

              const response = await fetch(`https://masapp-backend.onrender.com/api/upload/image`, {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const result = await response.json();

              if (result.success) {
                console.log('✅ Yapıştırılan resim başarıyla yüklendi:', result.data.imageUrl);
                setCapturedImage(result.data.imageUrl);
                alert(t('Resim başarıyla yapıştırıldı ve yüklendi!'));
              } else {
                console.error('❌ Upload failed:', result.message);
                alert(t('Resim yüklenemedi: ') + result.message);
              }
            } catch (error) {
              console.error('❌ Resim yükleme hatası:', error);
              alert(t('Resim yüklenirken hata oluştu: ') + (error as any).message);
            }
            break;
          }
        }
      }
    };

    // Global paste event listener ekle
    window.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [showItemForm, t]);

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  // Feature kontrolü kaldırıldı - herkes menü yönetimine erişebilir

  const handleAddItem = () => {
    setEditingItem(null);
    setCapturedImage(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      preparationTime: '',
      calories: '',
      ingredients: '',
      allergens: [] as string[],
      portion: '',
      isAvailable: true,
      isPopular: false,
      kitchenStation: '',
      translations: {},
      variations: [],
      options: [],
      type: activeTab === 'combos' ? 'bundle' : 'single',
      bundleItems: [],
      discountedPrice: '',
      discountPercentage: '',
      discountStartDate: '',
      discountEndDate: ''
    });
    setShowItemForm(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price.toString(),
      category: item.categoryId || '',
      subcategory: item.subcategory || '',
      preparationTime: item.preparationTime?.toString() || '',
      calories: item.calories?.toString() || '',
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients
        : typeof item.ingredients === 'string'
          ? item.ingredients.split(',').map((i: string) => i.trim()).filter(Boolean)
          : [],
      allergens: Array.isArray(item.allergens)
        ? item.allergens
        : typeof item.allergens === 'string'
          ? item.allergens.split(',').map((a: string) => a.trim()).filter(Boolean)
          : [],
      portion: item.portion || '',
      isAvailable: item.isAvailable !== false,
      isPopular: item.isPopular || false,
      kitchenStation: item.kitchenStation || '',
      translations: item.translations || {},
      variations: item.variations || [],
      options: item.options || [],
      type: item.type || 'single',
      bundleItems: item.bundleItems || [],
      discountedPrice: item.discountedPrice?.toString() || '',
      discountPercentage: item.discountPercentage?.toString() || '',
      discountStartDate: item.discountStartDate || '',
      discountEndDate: item.discountEndDate || ''
    });

    console.log('📝 handleEditItem - Original Item:', {
      id: item.id,
      name: item.name,
      ingredients: item.ingredients,
      allergens: item.allergens,
      typeOfAllergens: typeof item.allergens,
      isArrayAllergens: Array.isArray(item.allergens)
    });

    console.log('📝 handleEditItem - Processed for Form:', {
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : typeof item.ingredients === 'string' ? item.ingredients.split(',') : [],
      allergens: Array.isArray(item.allergens) ? item.allergens : typeof item.allergens === 'string' ? item.allergens.split(',') : []
    });
    // Resmi de yükle (imageUrl veya image field'ını kontrol et)
    const imageToLoad = item.imageUrl || item.image;
    if (imageToLoad) {
      console.log('Düzenleme için resim yükleniyor:', {
        imageUrlLength: imageToLoad?.length,
        imageUrlStart: imageToLoad?.substring(0, 50)
      });
      setCapturedImage(imageToLoad);
    } else {
      console.warn('Üründe resim bulunamadı!');
    }
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        if (currentRestaurantId) {
          await deleteMenuItem(currentRestaurantId, itemId);
          console.log('Ürün silindi:', itemId);
          // Menüyü yeniden yükle
          await fetchRestaurantMenu(currentRestaurantId);
        }
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
        alert('Ürün silinirken bir hata oluştu');
      }
    }
  };

  // Quick Edit Handlers
  const handleQuickEdit = (item: any) => {
    setQuickEditItem(item);
    setQuickEditData({
      name: item.name || '',
      price: item.price.toString(),
      category: item.categoryId || '',
      kitchenStation: item.kitchenStation || ''
    });
  };

  const handleQuickEditSave = async () => {
    if (!quickEditItem || !currentRestaurantId) return;

    try {
      await updateMenuItem(currentRestaurantId, quickEditItem.id, {
        name: quickEditData.name,
        price: parseFloat(quickEditData.price),
        categoryId: quickEditData.category,
        kitchenStation: quickEditData.kitchenStation,
        description: quickEditItem.description,
        imageUrl: quickEditItem.imageUrl || quickEditItem.image,
        isAvailable: quickEditItem.isAvailable,
        isPopular: quickEditItem.isPopular
      });

      setQuickEditItem(null);
      await fetchRestaurantMenu(currentRestaurantId);
    } catch (error) {
      console.error('Quick edit error:', error);
      alert('Güncellem hatası: ' + (error as Error).message);
    }
  };

  const handleViewTranslations = async (item: any) => {
    setSelectedItemForTranslation(item);
    setShowTranslationsModal(true);
    setLoadingTranslations(true);
    setTranslations({});

    try {
      // Çevirileri API'den al veya oluştur
      const languages = ['en', 'tr', 'ar', 'de', 'fr', 'es', 'it', 'ru', 'zh'];
      const newTranslations: { [key: string]: { name: string, description: string } } = {};
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com';

      for (const lang of languages) {
        try {
          // Türkçe için çeviri yapmaya gerek yok
          if (lang === 'tr') {
            newTranslations[lang] = {
              name: item.name,
              description: item.description || ''
            };
            continue;
          }

          // Çeviri API'sini kullan (DeepL)
          if (item.name) {
            const translatedName = await translateWithDeepL({
              text: item.name,
              targetLanguage: lang
            });

            let translatedDescription = '';
            if (item.description) {
              translatedDescription = await translateWithDeepL({
                text: item.description,
                targetLanguage: lang
              });
            }

            newTranslations[lang] = {
              name: translatedName || item.name,
              description: translatedDescription || item.description || ''
            };
          } else {
            newTranslations[lang] = {
              name: item.name,
              description: item.description || ''
            };
          }
        } catch (error) {
          console.error(`Çeviri hatası (${lang}):`, error);
          // Hata durumunda orijinal metni kullan
          newTranslations[lang] = {
            name: item.name,
            description: item.description || ''
          };
        }
      }

      setTranslations(newTranslations);
    } catch (error) {
      console.error('Çeviriler yüklenirken hata:', error);
      // Hata durumunda en azından orijinal dili göster
      setTranslations({
        'tr': {
          name: item.name,
          description: item.description || ''
        }
      });
    } finally {
      setLoadingTranslations(false);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (confirm(`${selectedItems.length} ürünü silmek istediğinizden emin misiniz?`)) {
      try {
        if (currentRestaurantId) {
          for (const itemId of selectedItems) {
            await deleteMenuItem(currentRestaurantId, itemId);
          }
          setSelectedItems([]);
          await fetchRestaurantMenu(currentRestaurantId);
          alert(`${selectedItems.length} ürün başarıyla silindi`);
        }
      } catch (error) {
        console.error('Toplu silme hatası:', error);
        alert('Ürünler silinirken bir hata oluştu');
      }
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedItems.length === 0 || !bulkPriceValue) return;

    console.log('🔄 Bulk price update başlıyor:', {
      selectedItems: selectedItems.length,
      bulkPriceValue,
      bulkPriceType,
      bulkPriceOperation,
      currentRestaurantId
    });

    try {
      if (currentRestaurantId) {
        const value = parseFloat(bulkPriceValue);
        let successCount = 0;

        for (const itemId of selectedItems) {
          const item = items.find(i => i.id === itemId);
          if (item) {
            let newPrice = item.price;

            console.log(`📊 Ürün ${item.name} - Eski fiyat: ₺${item.price}`);

            if (bulkPriceType === 'percentage') {
              if (bulkPriceOperation === 'increase') {
                newPrice = item.price * (1 + value / 100);
              } else {
                newPrice = item.price * (1 - value / 100);
              }
            } else {
              if (bulkPriceOperation === 'increase') {
                newPrice = item.price + value;
              } else {
                newPrice = item.price - value;
              }
            }

            // Minimum fiyat kontrolü
            newPrice = Math.max(0.01, newPrice);
            const finalPrice = Math.round(newPrice * 100) / 100;

            console.log(`💰 Yeni fiyat: ₺${finalPrice}`);

            const updateData = {
              categoryId: item.categoryId,
              name: item.name,
              description: item.description,
              price: finalPrice,
              imageUrl: item.imageUrl || item.image,
              isAvailable: item.isAvailable,
              isPopular: item.isPopular
            };

            console.log('📤 Update data:', updateData);

            await updateMenuItem(currentRestaurantId, itemId, updateData);
            successCount++;
            console.log(`✅ ${item.name} başarıyla güncellendi`);
          }
        }

        setSelectedItems([]);
        setShowBulkPriceModal(false);
        setBulkPriceValue('');
        await fetchRestaurantMenu(currentRestaurantId);
        alert(`${successCount} ${t('ürünün fiyatı başarıyla güncellendi')}`);
      }
    } catch (error) {
      console.error('❌ Toplu fiyat güncelleme hatası:', error);
      alert(t('Fiyatlar güncellenirken bir hata oluştu: ') + (error as Error).message);
    }
  };

  // Kamera fonksiyonları
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Arka kamera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      setShowCameraModal(true);
    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      alert(t('Kameraya erişim sağlanamadı. Lütfen izin verin.'));
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // JPEG formatında, yüksek kalite ile kaydet
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Kamera ile çekilen resim boyutu:', imageData.length);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  // PNG'yi JPEG'e çevir
  const convertToJpeg = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        }
      };
      img.src = base64;
    });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      order: categories.length,
      isActive: true,
      kitchenStation: '',
      translations: {},
      discountPercentage: '',
      discountStartDate: '',
      discountEndDate: ''
    });
    setSubcategories([]);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
      order: category.order || 0,
      isActive: category.isActive !== false,
      kitchenStation: category.kitchenStation || '',
      translations: category.translations || {},
      discountPercentage: category.discountPercentage?.toString() || '',
      discountStartDate: category.discountStartDate || '',
      discountEndDate: category.discountEndDate || ''
    });
    setShowCategoryForm(true);
  };

  // İstasyon yönetimi fonksiyonları
  const handleAddStation = () => {
    setEditingStation(null);
    setStationFormData({
      name: '',
      emoji: '',
      color: '#3B82F6',
      order: stations.length + 1,
      ipAddress: ''
    });
    setShowStationForm(true);
  };

  const handleEditStation = (station: any) => {
    setEditingStation(station);
    setStationFormData({
      name: station.name || '',
      emoji: station.emoji || '',
      color: station.color || '#3B82F6',
      order: station.order || 0,
      ipAddress: station.ipAddress || ''
    });
    setShowStationForm(true);
  };

  const handleSaveStation = async () => {
    if (!stationFormData.name.trim()) {
      alert('İstasyon adı gereklidir!');
      return;
    }

    let nextStations = [...stations];
    if (editingStation) {
      // Güncelleme
      nextStations = stations.map(s =>
        s.id === editingStation.id
          ? { ...s, ...stationFormData }
          : s
      );
    } else {
      // Yeni ekleme
      const newStation = {
        id: Date.now().toString(),
        ...stationFormData
      };
      nextStations = [...stations, newStation];
    }

    setStations(nextStations);

    // Backend'e kaydet
    if (currentRestaurantId) {
      try {
        await updateRestaurant(currentRestaurantId, { kitchenStations: nextStations });
        console.log('✅ İstasyonlar backend\'e kaydedildi');
      } catch (error) {
        console.error('❌ İstasyonlar kaydedilirken hata:', error);
      }
    }

    setShowStationForm(false);
    setEditingStation(null);
    setStationFormData({
      name: '',
      emoji: '',
      color: '#3B82F6',
      order: 0,
      ipAddress: ''
    });
  };

  const handleDeleteStation = async (stationId: string) => {
    if (confirm('Bu istasyonu silmek istediğinizden emin misiniz?')) {
      const nextStations = stations.filter(s => s.id !== stationId);
      setStations(nextStations);

      // Backend'e kaydet
      if (currentRestaurantId) {
        try {
          await updateRestaurant(currentRestaurantId, { kitchenStations: nextStations });
          console.log('✅ İstasyon silindi ve backend güncellendi');
        } catch (error) {
          console.error('❌ İstasyon silinirken hata:', error);
        }
      }
    }
  };

  const updateCategoryTranslationField = (
    lang: string,
    field: 'name' | 'description',
    value: string
  ) => {
    setCategoryFormData((prev) => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [lang]: {
          ...((prev.translations as any)?.[lang] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleItemAutoTranslate = async () => {
    if (!translationLanguages.length) return;
    if (!formData.name && !formData.description) {
      setItemTranslationError(t('Çevirmek için önce ürün adı veya açıklama girin.'));
      return;
    }
    setItemTranslationError(null);
    setIsTranslatingItem(true);
    const updatedTranslations: any = { ...(formData.translations || {}) };
    try {
      // İstenen format:
      // - TR: aynı kalsın (çeviri yok)
      // - EN: "English - Chinese" + İngilizce açıklama
      // - ZH: "Chinese" + Çince açıklama

      const baseName = formData?.name || '';
      const baseDescription = formData?.description || '';

      const shouldDoEn = translationLanguages.includes('en');
      const shouldDoZh = translationLanguages.includes('zh');

      // EN formatı için ZH adı da gerektiğinden (English - Chinese), ikisini birlikte üret.
      const zhName = shouldDoZh || shouldDoEn
        ? await translateWithDeepL({ text: baseName, targetLanguage: 'zh' })
        : '';
      const enName = shouldDoEn
        ? await translateWithDeepL({ text: baseName, targetLanguage: 'en' })
        : '';

      const zhDescription = (shouldDoZh && baseDescription)
        ? await translateWithDeepL({ text: baseDescription, targetLanguage: 'zh' })
        : '';
      const enDescription = (shouldDoEn && baseDescription)
        ? await translateWithDeepL({ text: baseDescription, targetLanguage: 'en' })
        : '';

      if (shouldDoEn) {
        updatedTranslations.en = {
          ...(updatedTranslations.en || {}),
          name: `${enName || baseName} - ${zhName || baseName}`,
          description: enDescription || baseDescription
        };
      }

      if (shouldDoZh) {
        updatedTranslations.zh = {
          ...(updatedTranslations.zh || {}),
          name: zhName || baseName,
          description: zhDescription || baseDescription
        };
      }

      setFormData((prev) => ({
        ...prev,
        translations: updatedTranslations
      }));
    } catch (error) {
      console.error('Ürün çevirisi hatası:', error);
      setItemTranslationError(t('Çeviri sırasında bir hata oluştu. Lütfen tekrar deneyin.'));
    } finally {
      setIsTranslatingItem(false);
    }
  };

  const [isBulkTranslating, setIsBulkTranslating] = useState(false);

  const updateItemTranslationField = (
    lang: string,
    field: 'name' | 'description',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [lang]: {
          ...((prev.translations as any)?.[lang] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleBulkTranslate = () => {
    // Toplu seçim varsa sadece seçilenleri, yoksa tümünü
    const targets = selectedItems.length > 0
      ? items.filter(i => selectedItems.includes(i.id))
      : items;

    if (targets.length === 0) {
      alert(t('Çevrilecek ürün bulunamadı.'));
      return;
    }

    // Modal açıldığında varsayılan olarak sadece EN + ZH seç
    // TR her zaman aynı kalır ve çevrilmez.
    setSelectedBulkLanguages(['en', 'zh'].filter((l) => translationLanguages.includes(l)));
    setShowBulkTranslateModal(true);
  };

  const startBulkTranslation = async () => {
    const targets = selectedItems.length > 0
      ? items.filter(i => selectedItems.includes(i.id))
      : items;

    if (selectedBulkLanguages.length === 0) {
      alert(t('Lütfen en az bir dil seçin.'));
      return;
    }

    setShowBulkTranslateModal(false);
    setIsBulkTranslating(true);
    let successCount = 0;

    try {
      if (currentRestaurantId) {
        for (const item of targets) {
          try {
            // Mevcut çevirileri koru
            const newTranslations = { ...((item as any).translations || {}) };
            let hasChanged = false;

            for (const lang of selectedBulkLanguages) {
              // İstenen format:
              // - TR: aynı kalsın (çeviri yok)
              // - EN: "English - Chinese"
              // - ZH: "Chinese"
              // Açıklamalar: EN ve ZH açıklama

              const baseName = item?.name || '';
              const baseDescription = item?.description || '';

              const zhName = await translateWithDeepL({
                text: baseName,
                targetLanguage: 'zh'
              });
              const enName = await translateWithDeepL({
                text: baseName,
                targetLanguage: 'en'
              });

              const zhDescription = baseDescription
                ? await translateWithDeepL({ text: baseDescription, targetLanguage: 'zh' })
                : '';
              const enDescription = baseDescription
                ? await translateWithDeepL({ text: baseDescription, targetLanguage: 'en' })
                : '';

              if (lang === 'en') {
                newTranslations.en = {
                  name: `${enName || baseName} - ${zhName || baseName}`,
                  description: enDescription || baseDescription
                };
                hasChanged = true;
              }

              if (lang === 'zh') {
                newTranslations.zh = {
                  name: zhName || baseName,
                  description: zhDescription || baseDescription
                };
                hasChanged = true;
              }
            }

            if (hasChanged) {
              await updateMenuItem(currentRestaurantId, item.id, {
                translations: newTranslations
              });
              successCount++;
            }
          } catch (err) {
            console.error(`Ürün çeviri hatası (${item.name}):`, err);
          }
        }

        await fetchRestaurantMenu(currentRestaurantId);
        alert(`${successCount} ${t('ürün başarıyla çevrildi.')}`);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Toplu çeviri hatası:', error);
      alert(t('Toplu çeviri sırasında bir hata oluştu.'));
    } finally {
      setIsBulkTranslating(false);
    }
  };

  const handleCategoryAutoTranslate = async () => {
    if (!translationLanguages.length) return;
    if (!categoryFormData.name && !categoryFormData.description) {
      setCategoryTranslationError(t('Çevirmek için önce kategori adı veya açıklama girin.'));
      return;
    }
    setCategoryTranslationError(null);
    setIsTranslatingCategory(true);
    const updatedTranslations: any = { ...(categoryFormData.translations || {}) };
    try {
      for (const lang of translationLanguages) {
        if (categoryFormData.name) {
          const translatedName = await translateWithDeepL({
            text: categoryFormData.name,
            targetLanguage: lang
          });
          updatedTranslations[lang] = {
            ...(updatedTranslations[lang] || {}),
            name: translatedName
          };
        }
        if (categoryFormData.description) {
          const translatedDescription = await translateWithDeepL({
            text: categoryFormData.description,
            targetLanguage: lang
          });
          updatedTranslations[lang] = {
            ...(updatedTranslations[lang] || {}),
            description: translatedDescription
          };
        }
      }
      setCategoryFormData((prev) => ({
        ...prev,
        translations: updatedTranslations
      }));
    } catch (error) {
      console.error('Kategori çevirisi hatası:', error);
      setCategoryTranslationError(t('Çeviri sırasında bir hata oluştu. Lütfen tekrar deneyin.'));
    } finally {
      setIsTranslatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm(t('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait tüm ürünler de silinecektir.'))) {
      try {
        if (currentRestaurantId) {
          await deleteMenuCategory(currentRestaurantId, categoryId);
          console.log('Kategori silindi:', categoryId);
          // Menüyü yeniden yükle
          await fetchRestaurantMenu(currentRestaurantId);
        }
      } catch (error) {
        console.error('Kategori silinirken hata:', error);
        alert(t('Kategori silinirken bir hata oluştu'));
      }
    }
  };

  // Filtrelenmiş ürünler
  // Filtrelenmiş ürünler
  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Tab filtering
    if (activeTab === 'combos') {
      result = result.filter(item => item.type === 'bundle');
    } else if (activeTab === 'items') {
      result = result.filter(item => !item.type || item.type === 'single');
    }

    // 2. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // 3. Category
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.categoryId === selectedCategory);
    }

    // 4. Status
    if (statusFilter === 'available') {
      result = result.filter(item => item.isAvailable !== false);
    } else if (statusFilter === 'out-of-stock') {
      result = result.filter(item => item.isAvailable === false);
    }

    // 5. Hide out of stock if toggle is off (and not specifically filtering for them)
    if (!showOutOfStock && statusFilter === 'all') {
      result = result.filter(item => item.isAvailable !== false);
    }
    // 6. Station
    if (selectedStation !== 'all') {
      const station = stations.find(s => s.id === selectedStation);
      if (station) {
        result = result.filter(item =>
          item.kitchenStation === station.id ||
          item.kitchenStation === station.name.toLowerCase()
        );
      }
    }

    // 7. Mapping Filter
    if (activeTab === 'mapping' && mappingFilter === 'unmapped') {
      result = result.filter(item => !item.kitchenStation);
    }

    return result;
  }, [items, searchTerm, selectedCategory, statusFilter, activeTab, showOutOfStock, selectedStation, stations, mappingFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden" style={{ zoom: '0.8' }}>
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaUtensils className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                    <TranslatedText>Menü Yönetimi</TranslatedText>
                  </h2>
                  <p className="text-gray-600 text-lg font-semibold mt-1"><TranslatedText>Restoran menünüzü yönetin ve düzenleyin</TranslatedText></p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-12">
          {/* Tabs Section */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/20 w-fit">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'items'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaUtensils />
                <TranslatedText>Ürünler</TranslatedText> ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('combos')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'combos'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaBoxOpen /> {/* Assuming FaBoxOpen for combos, or another suitable icon */}
                <TranslatedText>Menüler</TranslatedText>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'categories'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaTag />
                <TranslatedText>Kategoriler</TranslatedText> ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('stations')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'stations'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaFire />
                <TranslatedText>İstasyonlar</TranslatedText> ({stations.length})
              </button>
              <button
                onClick={() => setActiveTab('mapping')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'mapping'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaExchangeAlt />
                <TranslatedText>Eşleşmeler</TranslatedText>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'stats'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <FaChartBar />
                <TranslatedText>İstatistikler</TranslatedText>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 flex-wrap">
              {/* Yeni Ürün Ekle */}
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                <FaPlus className="text-white text-xl" />
                <span className="font-bold"><TranslatedText>Yeni Ürün Ekle</TranslatedText></span>
              </button>

              {/* Toplu Fiyat Düzenle */}
              <button
                onClick={() => setShowBulkPriceModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                <span className="text-white text-xl">%</span>
                <span className="font-bold"><TranslatedText>Toplu Fiyat Düzenle</TranslatedText></span>
              </button>

              {/* Toplu İçe Aktar (AI) */}
              <button
                onClick={() => setShowBulkImport(true)}
                className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span><TranslatedText>Toplu İçe Aktar</TranslatedText></span>
              </button>

              {/* Toplu Çeviri */}
              <button
                onClick={handleBulkTranslate}
                disabled={isBulkTranslating || items.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl hover:from-orange-500 hover:to-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold disabled:opacity-50"
              >
                <FaLanguage className="text-xl" />
                <span>{isBulkTranslating ? <TranslatedText>Çevriliyor...</TranslatedText> : <TranslatedText>Tümünü Çevir</TranslatedText>}</span>
              </button>

            </div>
          </div>

          {/* Loading State */}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600"><TranslatedText>Yükleniyor...</TranslatedText></span>
            </div>
          )}

          {/* Content */}
          {!loading && activeTab === 'items' && (
            <div className="space-y-6">
              {/* Bulk Actions Toolbar */}
              {selectedItems.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-purple-700">
                        <TranslatedText>{`${selectedItems.length} ürün seçildi`}</TranslatedText>
                      </span>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        <TranslatedText>Seçimi Temizle</TranslatedText>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkTranslate}
                        disabled={isBulkTranslating}
                        className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center gap-1 disabled:opacity-50"
                      >
                        <FaLanguage className="text-xs" />
                        {isBulkTranslating ? <TranslatedText>Çevriliyor...</TranslatedText> : <TranslatedText>Toplu Çevir</TranslatedText>}
                      </button>
                      <button
                        onClick={() => setShowBulkPriceModal(true)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        <FaMoneyBillWave className="text-xs" />
                        <TranslatedText>Fiyat Düzenle</TranslatedText>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                      >
                        <FaTrash className="text-xs" />
                        <TranslatedText>Sil</TranslatedText>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('Ara...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Filtreler */}
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Kategori Filtresi */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700"><TranslatedText>Kategori</TranslatedText>:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 max-w-[200px]"
                    >
                      <option value="all">{t('Tümü')}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* İstasyon Filtresi */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700"><TranslatedText>İstasyon</TranslatedText>:</label>
                    <select
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 max-w-[200px]"
                    >
                      <option value="all">{t('Tümü')}</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.id}>
                          {station.emoji} {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700"><TranslatedText>Durum</TranslatedText>:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">{t('Tümü')}</option>
                      <option value="available">{t('Mevcut')}</option>
                      <option value="out-of-stock">{t('Tükendi')}</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOutOfStock}
                      onChange={(e) => setShowOutOfStock(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700"><TranslatedText>Tükenen ürünleri göster</TranslatedText></span>
                  </label>
                </div>
              </div>

              {/* Items List - Responsive Table View */}
              <div className="hidden md:block bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>Ürün</TranslatedText>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>Kategori</TranslatedText>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>Detaylar</TranslatedText>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>Fiyat</TranslatedText>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>Durum</TranslatedText>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <TranslatedText>İşlemler</TranslatedText>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={
                                  (item.imageUrl || item.image)
                                    ? (item.imageUrl || item.image)?.startsWith('http')
                                      ? (item.imageUrl || item.image)
                                      : (() => {
                                        const imagePath = item.imageUrl || item.image;
                                        // Eğer path /uploads/ ile başlıyorsa base URL'den /api kısmını çıkar
                                        if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
                                          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                                          return `${baseUrl}${imagePath}`;
                                        }
                                        // Diğer durumlarda normal API URL kullan
                                        return `${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}${imagePath}`;
                                      })()
                                    : '/placeholder-food.jpg'
                                }
                                alt={item.name}
                                className="h-12 w-12 rounded-lg object-cover mr-4 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleEditItem(item)}
                                title="Resme tıklayarak ürünü düzenleyin"
                                onError={(e) => {
                                  console.log('Resim yüklenemedi:', item.imageUrl || item.image);
                                  e.currentTarget.src = '/placeholder-food.jpg';
                                }}
                                onLoad={() => {
                                  console.log('Resim yüklendi:', item.imageUrl || item.image);
                                }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                  {item.isPopular && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                                      <FaFire className="mr-1 text-yellow-600" />
                                      <TranslatedText>Popüler</TranslatedText>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {categories.find(c => c.id === item.categoryId)?.name || <TranslatedText>Kategori Yok</TranslatedText>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col gap-1">
                              {item.calories && <span className="flex items-center gap-1 text-xs" title={t('Kalori')}>
                                <FaFire className="text-orange-400" /> {item.calories} <TranslatedText>kcal</TranslatedText>
                              </span>
                              }
                              {item.preparationTime && <span className="flex items-center gap-1 text-xs" title={t('Hazırlık Süresi')}>
                                <FaClock className="text-blue-400" /> {item.preparationTime} <TranslatedText>dk</TranslatedText>
                              </span>
                              }
                              <div className="flex gap-1 mt-1">
                                {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium" title={`${t('Alerjen')}: ${item.allergens.join(', ')}`}>
                                    {item.allergens.length} <TranslatedText>Alerjen</TranslatedText>
                                  </span>
                                )}
                                {item.ingredients && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium" title={`${t('Malzemeler')}: ${item.ingredients}`}>
                                    <TranslatedText>Malzemeler</TranslatedText>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₺{item.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isAvailable !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              <div className={`w-2 h-2 rounded-full mr-1 ${item.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                              {item.isAvailable !== false ? <TranslatedText>Mevcut</TranslatedText> : <TranslatedText>Tükendi</TranslatedText>}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleQuickEdit(item)}
                                className="text-orange-600 hover:text-orange-900"
                                title={t('Hızlı Düzenle')}
                              >
                                <FaMagic />
                              </button>
                              <button
                                onClick={() => handleViewTranslations(item)}
                                className="text-blue-600 hover:text-blue-900"
                                title={t('Çevirileri Gör')}
                              >
                                <FaLanguage />
                              </button>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-purple-600 hover:text-purple-900"
                                title={t('Düzenle')}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                                title={t('Sil')}
                              >
                                <FaTrash />
                              </button>
                            </div>

                            {/* Quick Edit Dropdown */}
                            {quickEditItem?.id === item.id && (
                              <div className="absolute right-0 top-full mt-2 bg-white border shadow-2xl rounded-lg p-4 z-50 w-80">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-bold text-sm">{t('Hızlı Düzenle')}</h4>
                                  <button
                                    onClick={() => setQuickEditItem(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {t('Ürün Adı')}
                                    </label>
                                    <input
                                      type="text"
                                      value={quickEditData.name}
                                      onChange={(e) => setQuickEditData({ ...quickEditData, name: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border rounded"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {t('Fiyat (₺)')}
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={quickEditData.price}
                                      onChange={(e) => setQuickEditData({ ...quickEditData, price: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border rounded"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {t('Kategori')}
                                    </label>
                                    <select
                                      value={quickEditData.category}
                                      onChange={(e) => setQuickEditData({ ...quickEditData, category: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border rounded"
                                    >
                                      <option value="">{t('Kategori Seçin')}</option>
                                      {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {t('Mutfak İstasyonu')}
                                    </label>
                                    <select
                                      value={quickEditData.kitchenStation}
                                      onChange={(e) => setQuickEditData({ ...quickEditData, kitchenStation: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border rounded"
                                    >
                                      <option value="">{t('İstasyon Seçin')}</option>
                                      {stations.map(station => (
                                        <option key={station.id} value={station.id}>
                                          {station.emoji} {station.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <button
                                      onClick={() => setQuickEditItem(null)}
                                      className="flex-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                                    >
                                      {t('İptal')}
                                    </button>
                                    <button
                                      onClick={handleQuickEditSave}
                                      className="flex-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                      {t('Kaydet')}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          (item.imageUrl || item.image)
                            ? (item.imageUrl || item.image)?.startsWith('http')
                              ? (item.imageUrl || item.image)
                              : (() => {
                                const imagePath = item.imageUrl || item.image;
                                // Eğer path /uploads/ ile başlıyorsa base URL'den /api kısmını çıkar
                                if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
                                  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                                  return `${baseUrl}${imagePath}`;
                                }
                                // Diğer durumlarda normal API URL kullan
                                return `${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}${imagePath}`;
                              })()
                            : '/placeholder-food.jpg'
                        }
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleEditItem(item)}
                        title="Resme tıklayarak ürünü düzenleyin"
                        onError={(e) => {
                          console.log('Mobile - Resim yüklenemedi:', item.imageUrl || item.image);
                          e.currentTarget.src = '/placeholder-food.jpg';
                        }}
                        onLoad={() => {
                          console.log('Mobile - Resim yüklendi:', item.imageUrl || item.image);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            {item.isPopular && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 mt-1">
                                <FaFire className="mr-1 text-yellow-600" />
                                <TranslatedText>Popüler</TranslatedText>
                              </span>
                            )}
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              ₺{item.price}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              <div className={`w-2 h-2 rounded-full mr-1 ${item.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                              {item.isAvailable !== false ? <TranslatedText>Mevcut</TranslatedText> : <TranslatedText>Tükendi</TranslatedText>}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {categories.find(c => c.id === item.categoryId)?.name || <TranslatedText>Kategori Yok</TranslatedText>}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleQuickEdit(item)}
                              className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg"
                              title={t('Hızlı Düzenle')}
                            >
                              <FaMagic className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleViewTranslations(item)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                              title={t('Çevirileri Gör')}
                            >
                              <FaLanguage className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg"
                              title={t('Düzenle')}
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                              title={t('Sil')}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Quick Edit Form */}
                        {quickEditItem?.id === item.id && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-orange-200">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-xs text-orange-800 uppercase tracking-wider">{t('Hızlı Düzenle')}</span>
                              <button onClick={() => setQuickEditItem(null)} className="text-gray-400"><FaTimes size={14} /></button>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{t('Ürün Adı')}</label>
                                <input
                                  type="text"
                                  value={quickEditData.name}
                                  onChange={(e) => setQuickEditData({ ...quickEditData, name: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{t('Fiyat (₺)')}</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={quickEditData.price}
                                    onChange={(e) => setQuickEditData({ ...quickEditData, price: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{t('İstasyon')}</label>
                                  <select
                                    value={quickEditData.kitchenStation}
                                    onChange={(e) => setQuickEditData({ ...quickEditData, kitchenStation: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                                  >
                                    <option value="">{t('Seçin')}</option>
                                    {stations.map(station => (
                                      <option key={station.id} value={station.id}>{station.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{t('Kategori')}</label>
                                <select
                                  value={quickEditData.category}
                                  onChange={(e) => setQuickEditData({ ...quickEditData, category: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                                >
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => setQuickEditItem(null)}
                                  className="flex-1 py-2 text-sm font-medium border rounded bg-white shadow-sm"
                                >
                                  {t('İptal')}
                                </button>
                                <button
                                  onClick={handleQuickEditSave}
                                  className="flex-1 py-2 text-sm font-bold bg-orange-600 text-white rounded shadow-sm hover:bg-orange-700"
                                >
                                  {t('Kaydet')}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {!loading && activeTab === 'combos' && (
            <div className="space-y-6">
              {/* Add New Combo Button & Help */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold"><TranslatedText>Menüler</TranslatedText></h2>
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <TranslatedText>Yeni Menü Ekle</TranslatedText>
                </button>
              </div>

              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <FaUtensils className="mx-auto text-5xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2"><TranslatedText>Henüz menü yok</TranslatedText></h3>
                  <p className="text-sm text-gray-500 mb-4">
                    <TranslatedText>Müşterilerinize avantajlı menüler oluşturun</TranslatedText>
                  </p>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                  >
                    <FaPlus />
                    <TranslatedText>İlk Menüyü Ekle</TranslatedText>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={
                            (item.imageUrl || item.image)
                              ? (item.imageUrl || item.image)?.startsWith('http')
                                ? (item.imageUrl || item.image)
                                : (() => {
                                  const imagePath = item.imageUrl || item.image;
                                  if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
                                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                                    return `${baseUrl}${imagePath}`;
                                  }
                                  return `${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}${imagePath}`;
                                })()
                              : '/placeholder-food.jpg'
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = '/placeholder-food.jpg'; }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.isAvailable !== false ? <TranslatedText>Mevcut</TranslatedText> : <TranslatedText>Tükendi</TranslatedText>}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <span className="font-bold text-purple-600 text-lg">₺{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>

                        {/* Bundle Items Summary */}
                        <div className="bg-purple-50 p-3 rounded-lg mb-4">
                          <h4 className="text-xs font-bold text-purple-800 uppercase mb-2"><TranslatedText>Menü İçeriği</TranslatedText></h4>
                          <ul className="text-sm space-y-1">
                            {item.bundleItems && item.bundleItems.length > 0 ? (
                              item.bundleItems.map((bi: any, idx: number) => {
                                const originalItem = items.find(i => i.id === bi.itemId);
                                return (
                                  <li key={idx} className="flex justify-between">
                                    <span>{bi.quantity}x {originalItem?.name || bi.name || 'Ürün'}</span>
                                  </li>
                                );
                              })
                            ) : (
                              <li className="text-gray-400 text-xs"><TranslatedText>İçerik bilgisi yok</TranslatedText></li>
                            )}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            <TranslatedText>Düzenle</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold"><TranslatedText>Kategoriler</TranslatedText></h2>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <TranslatedText>Yeni Kategori Ekle</TranslatedText>
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <FaFolderOpen className="mx-auto text-5xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2"><TranslatedText>Henüz kategori yok</TranslatedText></h3>
                  <p className="text-sm text-gray-500 mb-4">
                    <TranslatedText>Menü ürünlerinizi düzenlemek için kategoriler oluşturun</TranslatedText>
                  </p>
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                  >
                    <FaPlus />
                    <TranslatedText>İlk Kategoriyi Ekle</TranslatedText>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(category => (
                    <div key={category.id} className="bg-white rounded-lg shadow-sm border p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {category.isActive !== false ? <TranslatedText>Aktif</TranslatedText> : <TranslatedText>Pasif</TranslatedText>}
                        </span>
                      </div>

                      {category.kitchenStation && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <FaFire className="mr-1" />
                            {stations.find(s => s.id === category.kitchenStation || s.name.toLowerCase() === category.kitchenStation?.toLowerCase())?.name || category.kitchenStation}
                          </span>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500 mb-4">
                          {items.filter(i => i.categoryId === category.id).length} <TranslatedText>ürün</TranslatedText>
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                            <FaEdit />
                            <TranslatedText>Düzenle</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'stations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold"><TranslatedText>Mutfak İstasyonları</TranslatedText></h2>
                <button
                  onClick={handleAddStation}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <TranslatedText>Yeni İstasyon Ekle</TranslatedText>
                </button>
              </div>

              {stations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <FaFire className="mx-auto text-5xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2"><TranslatedText>Henüz istasyon yok</TranslatedText></h3>
                  <p className="text-sm text-gray-500 mb-4">
                    <TranslatedText>Mutfak istasyonları oluşturarak ürünlerinizi organize edin</TranslatedText>
                  </p>
                  <button
                    onClick={handleAddStation}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                  >
                    <FaPlus />
                    <TranslatedText>İlk İstasyonu Ekle</TranslatedText>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.sort((a, b) => a.order - b.order).map(station => (
                    <div key={station.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{station.emoji}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{station.name}</h3>
                            <p className="text-xs text-gray-500">Sıra: {station.order}</p>
                          </div>
                        </div>
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: station.color }}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">
                          {items.filter(i => i.kitchenStation === station.id || i.kitchenStation === station.name.toLowerCase()).length} <TranslatedText>ürün</TranslatedText>
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStation(station)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                            <FaEdit />
                            <TranslatedText>Düzenle</TranslatedText>
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station.id)}
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold"><TranslatedText>Menü İstatistikleri</TranslatedText></h2>
                <div className="text-xs text-gray-500"><TranslatedText>Backend verileri üzerinden hesaplanır</TranslatedText></div>
              </div>

              {/* KPI Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Toplam Ürün', value: items.length, icon: <FaUtensils className='text-blue-600' />, bg: 'bg-blue-100' },
                  { label: 'Popüler Ürünler', value: items.filter(i => i.isPopular).length, icon: <FaFire className='text-red-600' />, bg: 'bg-red-100' },
                  { label: 'Kategori Sayısı', value: categories.length, icon: <FaTag className='text-green-600' />, bg: 'bg-green-100' },
                  { label: 'Ortalama Fiyat', value: `₺${items.length > 0 ? Math.round(items.reduce((s, i) => s + i.price, 0) / items.length) : 0}`, icon: <FaChartBar className='text-purple-600' />, bg: 'bg-purple-100' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600"><TranslatedText>{kpi.label}</TranslatedText></p>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${kpi.bg}`}>{kpi.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'mapping' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FaExchangeAlt className="text-amber-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800"><TranslatedText>Ürün - İstasyon Eşleştirmeleri</TranslatedText></h2>
                    <p className="text-gray-500 text-sm italic"><TranslatedText>Siparişlerin doğru yazıcıdan çıkması için ürünleri mutfak istasyonlarıyla eşleştirin.</TranslatedText></p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="hidden md:block">
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <TranslatedText>Otomatik Kayıt Aktif</TranslatedText>
                    </span>
                  </div>
                  <Link
                    href="/business/printers"
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-purple-600 rounded-xl text-xs font-bold shadow-sm transition-all border border-purple-100"
                  >
                    <FaCog />
                    <TranslatedText>Yazıcı Ayarları</TranslatedText>
                  </Link>
                </div>
              </div>

              {/* Search & Filters for Mapping */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex flex-wrap gap-6 items-center">
                <div className="relative flex-1 min-w-[300px]">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('Ürün ara...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <FaTag className="text-gray-500" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="all">{t('Tüm Kategoriler')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mappingFilter === 'unmapped' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    <FaExclamationTriangle />
                  </div>
                  <select
                    value={mappingFilter}
                    onChange={(e) => setMappingFilter(e.target.value as any)}
                    className={`px-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all cursor-pointer ${mappingFilter === 'unmapped' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                  >
                    <option value="all">{t('Tüm Ürünler')}</option>
                    <option value="unmapped">{t('Atanmamış Ürünler')}</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest"><TranslatedText>Ürün Bilgisi</TranslatedText></th>
                        <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest"><TranslatedText>Kategori</TranslatedText></th>
                        <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest"><TranslatedText>Mutfak İstasyonu</TranslatedText></th>
                        <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center"><TranslatedText>Durum</TranslatedText></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-purple-50/50 transition-all duration-200 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="relative group-hover:scale-110 transition-transform duration-300">
                                <img
                                  src={
                                    (item.imageUrl || item.image)
                                      ? (item.imageUrl || item.image)?.startsWith('http')
                                        ? (item.imageUrl || item.image)
                                        : (() => {
                                          const imagePath = item.imageUrl || item.image;
                                          if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
                                            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                                            return `${baseUrl}${imagePath}`;
                                          }
                                          return `${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}${imagePath}`;
                                        })()
                                      : '/placeholder-food.jpg'
                                  }
                                  alt={item.name}
                                  className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md"
                                  onError={(e) => { e.currentTarget.src = '/placeholder-food.jpg'; }}
                                />
                                {item.isPopular && (
                                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white p-1 rounded-lg text-[8px] font-bold shadow-lg">
                                    <FaFire />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{item.name}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{item.type || 'single'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200">
                              {categories.find(c => c.id === item.categoryId)?.name || t('Atanmamış')}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <select
                                value={item.kitchenStation || ''}
                                onChange={async (e) => {
                                  const newStationId = e.target.value;
                                  try {
                                    if (currentRestaurantId) {
                                      // Tüm item verisini spread ederek gönder, aksi takdirde store'daki backendData üretimi bazı alanları null yapabilir
                                      await updateMenuItem(currentRestaurantId, item.id, {
                                        ...item,
                                        kitchenStation: newStationId
                                      });
                                      await fetchRestaurantMenu(currentRestaurantId);
                                    }
                                  } catch (error) {
                                    console.error('İstasyon güncellenirken hata:', error);
                                  }
                                }}
                                className={`w-full max-w-[240px] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all outline-none border-2 ${item.kitchenStation
                                  ? 'bg-amber-50 border-amber-200 text-amber-900 focus:border-amber-400'
                                  : 'bg-gray-50 border-gray-100 text-gray-500 focus:border-purple-300'
                                  }`}
                              >
                                <option value="">⚠️ {t('İstasyon Seçin')}</option>
                                {stations.map(station => (
                                  <option key={station.id} value={station.id}>
                                    {station.emoji} {station.name}
                                  </option>
                                ))}
                              </select>
                              {item.kitchenStation && (
                                <p className="text-[10px] text-amber-600 font-bold ml-1">
                                  {t('Siparişler buraya gönderilecek')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            {item.kitchenStation ? (
                              <div className="flex items-center justify-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                                  <FaCheck />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                                  <FaExclamationTriangle />
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredItems.length === 0 && (
                  <div className="py-32 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <FaSearch className="text-gray-300 text-3xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-700"><TranslatedText>Sonuç bulunamadı</TranslatedText></h3>
                      <p className="text-gray-400"><TranslatedText>Arama kriterlerinize uygun ürün bulunamadı.</TranslatedText></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modals */}
          {showItemForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingItem ? <TranslatedText>Ürünü Düzenle</TranslatedText> : <TranslatedText>Yeni Ürün Ekle</TranslatedText>}
                  </h2>
                  <button
                    onClick={() => setShowItemForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <form className="space-y-6">
                    {/* Ürün Adı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Ürün Adı *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('Örn: Bruschetta')}
                        required
                      />
                    </div>

                    {/* Açıklama */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Açıklama</TranslatedText>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('Ürün açıklaması...')}
                      />
                    </div>

                    {translationLanguages.length > 0 && (
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2 text-purple-800">
                            <FaGlobe />
                            <div>
                              <p className="font-semibold"><TranslatedText>Çeviriler</TranslatedText></p>
                              <p className="text-xs text-purple-600">
                                <TranslatedText>Seçili diller için ürün adı ve açıklamasını düzenleyin.</TranslatedText>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleItemAutoTranslate}
                            disabled={isTranslatingItem}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
                          >
                            <FaMagic />
                            {isTranslatingItem ? <TranslatedText>Çevriliyor...</TranslatedText> : <TranslatedText>Otomatik Çevir</TranslatedText>}
                          </button>
                        </div>
                        {itemTranslationError && (
                          <p className="text-xs text-red-600">{itemTranslationError}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {translationLanguages.map((lang) => (
                            <div key={lang} className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  <TranslatedText>Ürün Adı</TranslatedText> ({lang.toUpperCase()})
                                </label>
                                <input
                                  type="text"
                                  value={(formData.translations as any)?.[lang]?.name || ''}
                                  onChange={(e) => updateItemTranslationField(lang, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  <TranslatedText>Açıklama</TranslatedText> ({lang.toUpperCase()})
                                </label>
                                <textarea
                                  rows={2}
                                  value={(formData.translations as any)?.[lang]?.description || ''}
                                  onChange={(e) => updateItemTranslationField(lang, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fiyat ve Kategori */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Fiyat (₺) *</TranslatedText>
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="45"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Kategori *</TranslatedText>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">{t('Kategori Seçin')}</option>
                          {categories.length > 0 ? (
                            categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                          ) : (
                            <option disabled>{t('Önce kategori ekleyin')}</option>
                          )}
                        </select>
                        {categories.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ {t('Kategori bulunamadı. Lütfen önce "Kategoriler" sekmesinden kategori ekleyin.')}
                          </p>
                        )}
                      </div>

                      {/* Mutfak İstasyonu */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Mutfak İstasyonu</TranslatedText>
                        </label>
                        <select
                          value={formData.kitchenStation}
                          onChange={(e) => setFormData({ ...formData, kitchenStation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">{t('İstasyon Seçin')}</option>
                          {stations.sort((a, b) => a.order - b.order).map(station => (
                            <option key={station.id} value={station.id}>
                              {station.emoji} {station.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('Ürün hangi mutfak istasyonunda hazırlanacak?')}
                        </p>
                      </div>
                    </div>


                    {/* VARYASYONLAR (Variations) */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          <FaTag className="text-blue-500" />
                          {t('Varyasyonlar')}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              variations: [...(prev.variations || []), { name: '', price: 0 }]
                            }));
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                        >
                          <FaPlus size={12} /> {t('Varyasyon Ekle')}
                        </button>
                      </div>

                      {formData.variations && formData.variations.length > 0 ? (
                        <div className="space-y-2">
                          {formData.variations.map((v, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder={t('Örn: 2 Adet, Büyük Boy')}
                                value={v.name}
                                onChange={e => {
                                  const newVars = [...formData.variations];
                                  newVars[idx].name = e.target.value;
                                  setFormData({ ...formData, variations: newVars });
                                }}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                placeholder={t('Fiyat')}
                                value={v.price}
                                onChange={e => {
                                  const newVars = [...formData.variations];
                                  newVars[idx].price = parseFloat(e.target.value);
                                  setFormData({ ...formData, variations: newVars });
                                }}
                                className="w-24 px-3 py-2 border rounded-lg text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newVars = formData.variations.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, variations: newVars });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center italic">{t('Varyasyon eklenmemiş (Örn: Porsiyon büyüklüğü, Adet)')}</p>
                      )}
                    </div>

                    {/* ÖZELLİKLER (Options) */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          <FaClipboardList className="text-orange-500" />
                          {t('Özellik Seçenekleri')}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              options: [...(prev.options || []), { name: '', values: [] }]
                            }));
                          }}
                          className="text-sm text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
                        >
                          <FaPlus size={12} /> {t('Grup Ekle')}
                        </button>
                      </div>

                      {formData.options && formData.options.length > 0 ? (
                        <div className="space-y-4">
                          {formData.options.map((opt, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center mb-2">
                                <input
                                  type="text"
                                  placeholder={t('Grup Adı (Örn: Acı Durumu, Soslar)')}
                                  value={opt.name}
                                  onChange={e => {
                                    const newOpts = [...formData.options];
                                    newOpts[idx].name = e.target.value;
                                    setFormData({ ...formData, options: newOpts });
                                  }}
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-bold mr-2"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOpts = formData.options.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, options: newOpts });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>

                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">{t('Seçenekler (Virgülle ayırın)')}</label>
                                <input
                                  type="text"
                                  placeholder={t('Örn: Az Acılı, Çok Acılı, Acısız')}
                                  value={opt.values.join(', ')}
                                  onChange={e => {
                                    const newOpts = [...formData.options];
                                    newOpts[idx].values = e.target.value.split(',').map(s => s.trim()); // removed filter(Boolean) to allows typing comma
                                    setFormData({ ...formData, options: newOpts });
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center italic">{t('Seçenek grubu eklenmemiş (Örn: Acı tercihi, Pişme derecesi)')}</p>
                      )}
                    </div>

                    {/* MENÜ İÇERİĞİ (Bundle Items) - Sadece 'bundle' tipinde gösterilir */}
                    {formData.type === 'bundle' && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-4">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FaUtensils className="text-purple-600" />
                          <TranslatedText>Menü İçeriği</TranslatedText>
                        </h4>

                        <div className="space-y-4">
                          {formData.bundleItems.map((bi, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border">
                              <select
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                value={bi.itemId}
                                onChange={(e) => {
                                  const newItems = [...formData.bundleItems];
                                  newItems[idx].itemId = e.target.value;
                                  // Update name reference
                                  const selectedItem = items.find(i => i.id === e.target.value);
                                  if (selectedItem) newItems[idx].name = selectedItem.name;
                                  setFormData({ ...formData, bundleItems: newItems });

                                  // Auto calculate price suggestion if price is 0
                                  /* Optional: Add logic here to sum prices */
                                }}
                              >
                                <option value="">{t('Ürün Seçin')}</option>
                                {items.filter(i => i.type !== 'bundle').map(i => (
                                  <option key={i.id} value={i.id}>{i.name} ({i.price}₺)</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min="1"
                                value={bi.quantity}
                                onChange={(e) => {
                                  const newItems = [...formData.bundleItems];
                                  newItems[idx].quantity = parseInt(e.target.value) || 1;
                                  setFormData({ ...formData, bundleItems: newItems });
                                }}
                                className="w-20 px-3 py-2 border rounded-lg text-sm"
                                placeholder="Adet"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = formData.bundleItems.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, bundleItems: newItems });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                bundleItems: [...(prev.bundleItems || []), { itemId: '', quantity: 1 }]
                              }));
                            }}
                            className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 font-medium flex justify-center items-center gap-2"
                          >
                            <FaPlus /> <TranslatedText>Ürün Ekle</TranslatedText>
                          </button>

                          {formData.bundleItems.length > 0 && (
                            <div className="text-right text-xs text-gray-500">
                              Toplam: {formData.bundleItems.reduce((sum, bi) => {
                                const item = items.find(i => i.id === bi.itemId);
                                return sum + (item ? item.price * bi.quantity : 0);
                              }, 0)} ₺ (Liste Fiyatı)
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                    {/* Kalori ve Hazırlık Süresi */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Kalori</TranslatedText>
                        </label>
                        <input
                          type="number"
                          value={formData.calories}
                          onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="250"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Hazırlık Süresi (dakika)</TranslatedText>
                        </label>
                        <input
                          type="number"
                          value={formData.preparationTime}
                          onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="15"
                        />
                      </div>
                    </div>



                    {/* Malzemeler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Malzemeler</TranslatedText>
                      </label>
                      <textarea
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('Malzemeleri virgülle ayırarak yazın (Örn: Domates, Mozzarella, Fesleğen)')}
                      />
                    </div>

                    {/* Alerjenler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Alerjen</TranslatedText>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Gluten', 'Süt', 'Yumurta', 'Fındık', 'Fıstık', 'Soya', 'Balık', 'Kabuklu Deniz Ürünleri'].map((allergen) => (
                          <label key={allergen} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={Array.isArray(formData.allergens) && formData.allergens.some(a => a.toLowerCase() === allergen.toLowerCase())}
                              onChange={(e) => {
                                const currentAllergens = Array.isArray(formData.allergens) ? formData.allergens : [];
                                console.log('Alerjen değişikliği:', { allergen, checked: e.target.checked, currentAllergens });
                                if (e.target.checked) {
                                  const newAllergens = [...currentAllergens, allergen];
                                  console.log('Yeni alerjenler:', newAllergens);
                                  setFormData({ ...formData, allergens: newAllergens });
                                } else {
                                  const newAllergens = currentAllergens.filter(a => a !== allergen);
                                  console.log('Kaldırılan alerjenler:', newAllergens);
                                  setFormData({ ...formData, allergens: newAllergens });
                                }
                              }}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700"><TranslatedText>{allergen}</TranslatedText></span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ürün Fotoğrafı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Ürün Fotoğrafı</TranslatedText>
                      </label>

                      {/* Fotoğraf Yükleme Seçenekleri */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Kameradan Çek */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
                        >
                          <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-purple-600"><TranslatedText>Kameradan Çek</TranslatedText></p>
                          <p className="text-xs text-gray-500"><TranslatedText>Telefon kamerası</TranslatedText></p>
                        </button>

                        {/* Dosyadan Yükle veya Yapıştır */}
                        <div
                          className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center cursor-pointer relative"
                          onPaste={async (e) => {
                            e.preventDefault();
                            const items = e.clipboardData.items;

                            for (let i = 0; i < items.length; i++) {
                              const item = items[i];

                              if (item.type.indexOf('image') !== -1) {
                                const file = item.getAsFile();
                                if (file) {
                                  console.log('📋 Yapıştırılan resim:', file.name || 'Clipboard', 'Boyut:', file.size, 'Tip:', file.type);

                                  // Dosya boyutunu kontrol et (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert(t('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'));
                                    return;
                                  }

                                  // Resim yükleme
                                  try {
                                    const formData = new FormData();
                                    formData.append('image', file);

                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/upload/image`, {
                                      method: 'POST',
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                    }

                                    const result = await response.json();

                                    if (result.success) {
                                      console.log('✅ Yapıştırılan resim başarıyla yüklendi:', result.data.imageUrl);
                                      setCapturedImage(result.data.imageUrl);
                                      alert(t('Resim başarıyla yapıştırıldı ve yüklendi!'));
                                    } else {
                                      console.error('❌ Upload failed:', result.message);
                                      alert(t('Resim yüklenemedi: ') + result.message);
                                    }
                                  } catch (error) {
                                    console.error('❌ Resim yükleme hatası:', error);
                                    alert(t('Resim yüklenirken hata oluştu: ') + (error as any).message);
                                  }
                                  break;
                                }
                              }
                            }
                          }}
                          tabIndex={0}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '2px solid #9333ea';
                            e.currentTarget.style.outlineOffset = '2px';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
                        >
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  console.log('Seçilen dosya:', file.name, 'Boyut:', file.size, 'Tip:', file.type);

                                  // Dosya boyutunu kontrol et (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert(t('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'));
                                    return;
                                  }

                                  // Dosya tipini kontrol et
                                  if (!file.type.startsWith('image/')) {
                                    alert(t('Lütfen sadece resim dosyası seçin.'));
                                    return;
                                  }

                                  // Basit ve güvenilir resim yükleme sistemi
                                  try {
                                    console.log('📤 Resim yükleniyor:', file.name, file.size, 'bytes');

                                    const formData = new FormData();
                                    formData.append('image', file);

                                    console.log('📡 API URL:', process.env.NEXT_PUBLIC_API_URL);

                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/upload/image`, {
                                      method: 'POST',
                                      body: formData,
                                    });

                                    console.log('📊 Response status:', response.status);
                                    console.log('📊 Response ok:', response.ok);

                                    if (!response.ok) {
                                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                    }

                                    const result = await response.json();
                                    console.log('📊 Response data:', result);

                                    if (result.success) {
                                      console.log('✅ Resim başarıyla yüklendi:', result.data.imageUrl);
                                      setCapturedImage(result.data.imageUrl);
                                      alert(t('Resim başarıyla yüklendi!'));
                                    } else {
                                      console.error('❌ Upload failed:', result.message);
                                      alert(t('Resim yüklenemedi: ') + result.message);
                                    }
                                  } catch (error) {
                                    console.error('❌ Resim yükleme hatası:', error);
                                    alert(t('Resim yüklenirken hata oluştu: ') + (error as any).message);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-600"><TranslatedText>Dosyadan Yükle</TranslatedText></p>
                            <p className="text-xs text-gray-500"><TranslatedText>PNG, JPG, GIF</TranslatedText></p>
                            <p className="text-xs text-purple-600 mt-1 font-medium"><TranslatedText>veya Ctrl+V ile yapıştır</TranslatedText></p>
                          </label>
                        </div>
                      </div>

                      {/* AI Görsel İşleme */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            <span className="text-yellow-400 text-lg">✨</span>
                            <span className="text-yellow-400 text-sm">⭐</span>
                            <span className="text-yellow-400 text-xs">✨</span>
                          </div>
                          <h4 className="font-semibold text-gray-800"><TranslatedText>AI Görsel İşleme Aktif!</TranslatedText></h4>
                        </div>

                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span><TranslatedText>Otomatik arka plan kaldırma</TranslatedText></span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span><TranslatedText>Renk ve parlaklık optimizasyonu</TranslatedText></span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span><TranslatedText>Akıllı boyutlandırma</TranslatedText></span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span><TranslatedText>Keskinlik artırma</TranslatedText></span>
                          </li>
                        </ul>

                        <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">💡</span>
                            <span className="text-xs text-yellow-800">
                              <TranslatedText>Kameradan çekmek daha profesyonel sonuçlar verir</TranslatedText>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Seçilen Fotoğraf Önizleme */}
                      {capturedImage && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2"><TranslatedText>Seçilen Fotoğraf:</TranslatedText></p>
                          <div className="relative inline-block">
                            <img
                              src={capturedImage.startsWith('http') ? capturedImage : `${(process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '')}${capturedImage}`}
                              alt="Ürün fotoğrafı önizleme"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => setCapturedImage(null)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Durum ve Popüler */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <TranslatedText>Ürün Durumu</TranslatedText>
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="status"
                                value="available"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'available' })}
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <TranslatedText>Mevcut</TranslatedText>
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="status"
                                value="out-of-stock"
                                checked={!formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value !== 'out-of-stock' })}
                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <TranslatedText>Tükendi</TranslatedText>
                              </span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.isPopular}
                              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                              className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                            />
                            <span className="ml-3 text-sm font-medium text-yellow-800 flex items-center gap-2">
                              <FaFire className="text-yellow-600" size={16} />
                              <TranslatedText>Popüler Ürün</TranslatedText>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowItemForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <TranslatedText>İptal</TranslatedText>
                    </button>
                    <button
                      onClick={async () => {
                        console.log('=== FORM SUBMIT BAŞLADI ===');
                        console.log('Form Data:', formData);
                        console.log('Captured Image:', capturedImage ? 'VAR (' + capturedImage.length + ' karakter)' : 'YOK');
                        console.log('Captured Image Preview:', capturedImage ? capturedImage.substring(0, 100) + '...' : 'null');
                        console.log('Editing Item:', editingItem);
                        console.log('Current Restaurant ID:', currentRestaurantId);

                        // Gerçek güncelleme işlemi
                        if (editingItem) {
                          // Ürün güncelleme
                          try {
                            if (currentRestaurantId) {
                              const updateData = {
                                ...formData,
                                categoryId: formData.category, // Map 'category' back to 'categoryId' for backend
                                price: Number(formData.price),
                                calories: formData.calories ? Number(formData.calories) : null,
                                preparationTime: formData.preparationTime ? Number(formData.preparationTime) : null,
                                imageUrl: capturedImage || editingItem.imageUrl
                              };

                              console.log('Update Data gönderiliyor:', updateData);
                              await updateMenuItem(currentRestaurantId, editingItem.id, updateData);
                              console.log('Ürün güncellendi:', formData);
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                              alert(t('Ürün başarıyla güncellendi!'));
                            }
                          } catch (error) {
                            console.error('Ürün güncellenirken hata:', error);
                            alert(t('Ürün güncellenirken bir hata oluştu: ') + (error as any).message);
                          }
                        } else {
                          // Yeni ürün ekleme
                          if (!formData.name || !formData.price || !formData.category) {
                            alert(t('Lütfen ürün adı, fiyat ve kategori alanlarını doldurun!'));
                            return;
                          }

                          try {
                            if (currentRestaurantId) {
                              const createData = {
                                ...formData,
                                categoryId: formData.category, // Map 'category' back to 'categoryId' for backend
                                price: Number(formData.price),
                                calories: formData.calories ? Number(formData.calories) : null,
                                preparationTime: formData.preparationTime ? Number(formData.preparationTime) : null,
                                imageUrl: capturedImage || '/placeholder-food.jpg',
                                order: items.length + 1
                              };

                              console.log('Create Data gönderiliyor:', createData);
                              await createMenuItem(currentRestaurantId, createData);
                              console.log('Yeni ürün backend\'e kaydedildi:', formData);
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                              alert(t('Ürün başarıyla eklendi!'));
                            }
                          } catch (error) {
                            console.error('Ürün eklenirken hata:', error);
                            alert(t('Ürün eklenirken bir hata oluştu: ') + (error as any).message);
                          }
                        }

                        // Başarılı işlem sonrası temizlik
                        setShowItemForm(false);
                        setEditingItem(null);
                        setCapturedImage(null);
                        // Form resetle
                        setFormData({
                          name: '',
                          description: '',
                          price: '',
                          category: '',
                          subcategory: '',
                          preparationTime: '',
                          calories: '',
                          ingredients: '',
                          allergens: [] as string[],
                          portion: '',
                          isAvailable: true,
                          isPopular: false,
                          kitchenStation: '',
                          translations: {},
                          variations: [],
                          options: [],
                          type: activeTab === 'combos' ? 'bundle' : 'single',
                          bundleItems: []
                        });

                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingItem ? <TranslatedText>Güncelle</TranslatedText> : <TranslatedText>Kaydet</TranslatedText>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCategoryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-md w-full overflow-hidden relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingCategory ? <TranslatedText>Kategoriyi Düzenle</TranslatedText> : <TranslatedText>Yeni Kategori Ekle</TranslatedText>}
                  </h2>
                  <button
                    onClick={() => setShowCategoryForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <form className="space-y-4">
                    {/* Kategori Adı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Kategori Adı *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('Örn: Başlangıçlar, Ana Yemekler, Tatlılar')}
                        required
                      />
                    </div>

                    {/* Mutfak İstasyonu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Varsayılan Mutfak İstasyonu</TranslatedText>
                      </label>
                      <select
                        value={categoryFormData.kitchenStation}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, kitchenStation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">{t('İstasyon Seçin')}</option>
                        {stations.sort((a, b) => a.order - b.order).map(station => (
                          <option key={station.id} value={station.id}>
                            {station.emoji} {station.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('Bu kategorideki ürünler varsayılan olarak hangi istasyona gidecek?')}
                      </p>
                    </div>

                    {/* Durum */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryFormData.isActive}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700"><TranslatedText>Aktif</TranslatedText></span>
                      </label>
                    </div>
                  </form>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <TranslatedText>İptal</TranslatedText>
                    </button>
                    <button
                      onClick={async () => {
                        // Gerçek kategori güncelleme işlemi
                        if (!categoryFormData.name) {
                          alert(t('Lütfen kategori adını girin!'));
                          return;
                        }

                        try {
                          if (editingCategory) {
                            if (currentRestaurantId) {
                              await updateMenuCategory(currentRestaurantId, editingCategory.id, {
                                name: categoryFormData.name,
                                description: categoryFormData.description,
                                order: categoryFormData.order,
                                isActive: categoryFormData.isActive,
                                kitchenStation: categoryFormData.kitchenStation
                              });
                              console.log('Kategori güncellendi:', editingCategory);
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                            }
                          } else {
                            // Backend API'sine kaydet
                            if (currentRestaurantId) {
                              await createMenuCategory(currentRestaurantId, {
                                name: categoryFormData.name,
                                description: categoryFormData.description,
                                order: categories.length,
                                isActive: categoryFormData.isActive,
                                kitchenStation: categoryFormData.kitchenStation,
                                discountPercentage: categoryFormData.discountPercentage ? parseInt(categoryFormData.discountPercentage) : null,
                                discountStartDate: categoryFormData.discountStartDate || null,
                                discountEndDate: categoryFormData.discountEndDate || null
                              });
                              console.log('Yeni kategori backend\'e kaydedildi');
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                            }
                          }
                        } catch (error) {
                          console.error('Kategori işlemi sırasında hata:', error);
                          alert(t('Kategori işlemi sırasında bir hata oluştu: ') + (error as any).message);
                        }
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setSubcategories([]); // Formu temizle
                        setCategoryFormData({
                          name: '',
                          description: '',
                          order: categories.length,
                          isActive: true,
                          kitchenStation: '',
                          translations: {},
                          discountPercentage: '',
                          discountStartDate: '',
                          discountEndDate: ''
                        });
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingCategory ? <TranslatedText>Güncelle</TranslatedText> : <TranslatedText>Kaydet</TranslatedText>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* İstasyon Form Modal */}
          {showStationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-md w-full overflow-hidden relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingStation ? <TranslatedText>İstasyonu Düzenle</TranslatedText> : <TranslatedText>Yeni İstasyon Ekle</TranslatedText>}
                  </h2>
                  <button
                    onClick={() => setShowStationForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <form className="space-y-4">
                    {/* İstasyon Adı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>İstasyon Adı *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={stationFormData.name}
                        onChange={(e) => setStationFormData({ ...stationFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Izgara, Pizza, Sushi"
                        required
                      />
                    </div>

                    {/* Emoji */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Emoji</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={stationFormData.emoji}
                        onChange={(e) => setStationFormData({ ...stationFormData, emoji: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-2xl"
                        placeholder="🔥"
                        maxLength={2}
                      />
                      <p className="text-xs text-gray-500 mt-1">İstasyon için emoji seçin (opsiyonel)</p>
                    </div>

                    {/* Renk */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Renk</TranslatedText>
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={stationFormData.color}
                          onChange={(e) => setStationFormData({ ...stationFormData, color: e.target.value })}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={stationFormData.color}
                          onChange={(e) => setStationFormData({ ...stationFormData, color: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    {/* Sıra */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Sıra</TranslatedText>
                      </label>
                      <input
                        type="number"
                        value={stationFormData.order}
                        onChange={(e) => setStationFormData({ ...stationFormData, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">İstasyonların görüntülenme sırası</p>
                    </div>

                    {/* Printer IP Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Printer (Yazıcı) IP Adresi</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={stationFormData.ipAddress}
                        onChange={(e) => setStationFormData({ ...stationFormData, ipAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                        placeholder="Örn: 192.168.1.100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Bu istasyona bağlı olan termal yazıcının IP adresini girin.</p>
                    </div>
                  </form>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowStationForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <TranslatedText>İptal</TranslatedText>
                    </button>
                    <button
                      onClick={handleSaveStation}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingStation ? <TranslatedText>Güncelle</TranslatedText> : <TranslatedText>Kaydet</TranslatedText>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kamera Modal */}
          {showCameraModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-md w-full overflow-hidden relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold"><TranslatedText>Fotoğraf Çek</TranslatedText></h2>
                  <button
                    onClick={stopCamera}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      id="camera-video"
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                      ref={(video) => {
                        if (video && cameraStream) {
                          video.srcObject = cameraStream;
                        }
                      }}
                    />
                    <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 right-2 h-8 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white text-sm"><TranslatedText>Ürünü çerçeve içine alın</TranslatedText></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={stopCamera}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <TranslatedText>İptal</TranslatedText>
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <TranslatedText>Fotoğraf Çek</TranslatedText>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Import Modal */}
          {showBulkImport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <TranslatedText>Toplu Ürün İçe Aktar</TranslatedText>
                  </h2>
                  <button
                    onClick={() => setShowBulkImport(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1"><TranslatedText>CSV Formatı</TranslatedText></h4>
                        <p className="text-sm text-blue-800">
                          <TranslatedText>CSV dosyanız şu sütunları içermelidir:</TranslatedText> <strong><TranslatedText>Ürün Adı, Açıklama, Fiyat, Kategori</TranslatedText></strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('CSV dosyası seçildi:', file.name);
                          // CSV işleme mantığı buraya eklenecek
                          alert(t('CSV yükleme özelliği yakında aktif olacak! 🚀'));
                        }
                      }}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-2"><TranslatedText>CSV Dosyası Yükle</TranslatedText></p>
                      <p className="text-sm text-gray-500"><TranslatedText>Tıklayın veya dosyayı sürükleyin</TranslatedText></p>
                      <p className="text-xs text-gray-400 mt-2"><TranslatedText>Maksimum dosya boyutu: 5MB</TranslatedText></p>
                    </label>
                  </div>

                  {/* Example Template */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700"><TranslatedText>Örnek Şablon</TranslatedText></h4>
                      <button
                        onClick={() => {
                          // CSV şablonu oluştur
                          const csvContent = "Ürün Adı,Açıklama,Fiyat,Kategori\nMargherita Pizza,Domates sosu ve mozzarella,89.90,Ana Yemek\nCaesar Salad,Marul ve parmesan peyniri,45.00,Salata\nTiramisu,İtalyan tatlısı,35.00,Tatlı";
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = 'ornek_menu_sablonu.csv';
                          link.click();
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <TranslatedText>Şablonu İndir</TranslatedText>
                      </button>
                    </div>
                    <div className="bg-white rounded border border-gray-200 p-3 text-xs font-mono overflow-x-auto">
                      <div className="text-gray-600">Ürün Adı,Açıklama,Fiyat,Kategori</div>
                      <div className="text-gray-500">Margherita Pizza,Domates sosu...,89.90,Ana Yemek</div>
                      <div className="text-gray-500">Caesar Salad,Marul ve parmesan...,45.00,Salata</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700"><TranslatedText>Hızlı İçe Aktar</TranslatedText></p>
                        <p className="text-xs text-gray-500"><TranslatedText>Yüzlerce ürünü tek seferde ekleyin</TranslatedText></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700"><TranslatedText>Otomatik Doğrulama</TranslatedText></p>
                        <p className="text-xs text-gray-500"><TranslatedText>Hatalı veriler otomatik tespit edilir</TranslatedText></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
                  <button
                    onClick={() => setShowBulkImport(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <TranslatedText>İptal</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Translations Modal */}
          {showTranslationsModal && selectedItemForTranslation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-[9999]">
                <div className="p-6 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FaLanguage className="text-blue-600" />
                      <TranslatedText>Ürün Çevirileri</TranslatedText>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedItemForTranslation.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTranslationsModal(false);
                      setSelectedItemForTranslation(null);
                      setTranslations({});
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  {loadingTranslations ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-3 text-gray-600"><TranslatedText>Çeviriler yükleniyor...</TranslatedText></span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(translations).length > 0 ? (
                        Object.entries(translations).map(([lang, translation]) => {
                          const languageNames: { [key: string]: string } = {
                            'tr': 'Türkçe',
                            'en': 'English',
                            'ar': 'العربية',
                            'de': 'Deutsch',
                            'fr': 'Français',
                            'es': 'Español',
                            'it': 'Italiano',
                            'ru': 'Русский',
                            'zh': '中文'
                          };

                          return (
                            <div key={lang} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {lang.toUpperCase()}
                                </div>
                                <h3 className="font-semibold text-lg">{languageNames[lang] || lang}</h3>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText>Ürün Adı</TranslatedText></label>
                                  <p className="text-gray-900 font-medium mt-1">{translation.name}</p>
                                </div>
                                {translation.description && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText>Açıklama</TranslatedText></label>
                                    <p className="text-gray-700 mt-1">{translation.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <FaLanguage className="mx-auto text-5xl text-gray-300 mb-4" />
                          <p className="text-gray-600"><TranslatedText>Çeviriler yüklenemedi</TranslatedText></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end">
                  <button
                    onClick={() => {
                      setShowTranslationsModal(false);
                      setSelectedItemForTranslation(null);
                      setTranslations({});
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <TranslatedText>Kapat</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Translate Modal */}
          {showBulkTranslateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-md w-full relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold"><TranslatedText>Toplu Çeviri Ayarları</TranslatedText></h2>
                  <button
                    onClick={() => setShowBulkTranslateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedItems.length > 0 ? `${selectedItems.length} ürün` : `${items.length} ürün`} <TranslatedText>seçilen dillere çevrilecek.</TranslatedText>
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <TranslatedText>Hedef Diller</TranslatedText>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {translationLanguages.map((langCode) => {
                        const langDetails = {
                          'en': { name: 'English', flag: '🇺🇸' },
                          'de': { name: 'German', flag: '🇩🇪' },
                          'ar': { name: 'Arabic', flag: '🇸🇦' },
                          'ru': { name: 'Russian', flag: '🇷🇺' },
                          'fr': { name: 'French', flag: '🇫🇷' },
                          'es': { name: 'Spanish', flag: '🇪🇸' },
                          'it': { name: 'Italian', flag: '🇮🇹' },
                          'zh': { name: 'Chinese', flag: '🇨🇳' }
                        }[langCode] || { name: langCode.toUpperCase(), flag: '🌐' };

                        return (
                          <button
                            key={langCode}
                            onClick={() => {
                              if (selectedBulkLanguages.includes(langCode)) {
                                setSelectedBulkLanguages(selectedBulkLanguages.filter(l => l !== langCode));
                              } else {
                                setSelectedBulkLanguages([...selectedBulkLanguages, langCode]);
                              }
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedBulkLanguages.includes(langCode)
                              ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                              : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                              }`}
                          >
                            <span className="text-xl">{langDetails.flag}</span>
                            <span className="text-sm font-semibold">{langDetails.name}</span>
                            {selectedBulkLanguages.includes(langCode) && (
                              <FaCheck className="ml-auto text-purple-500 text-xs" />
                            )}
                          </button>
                        );
                      })}
                      {/* Removed hardcoded map closing brace since we are now mapping properly inline or just changing the source array */}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                    <FaExclamationTriangle className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <TranslatedText>Sadece seçtiğiniz diller için çeviriler güncellenecektir. Mevcut çevirilerinizin üzerine yazılabilir.</TranslatedText>
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkTranslateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    <TranslatedText>İptal</TranslatedText>
                  </button>
                  <button
                    onClick={startBulkTranslation}
                    disabled={selectedBulkLanguages.length === 0}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    <TranslatedText>Çeviriyi Başlat</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Price Update Modal */}
          {showBulkPriceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-md w-full relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold"><TranslatedText>Toplu Fiyat Düzenle</TranslatedText></h2>
                  <button
                    onClick={() => setShowBulkPriceModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedItems.length} <TranslatedText>ürünün fiyatını güncelleyeceksiniz.</TranslatedText>
                  </p>

                  {/* Operation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText>İşlem Türü</TranslatedText>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBulkPriceOperation('increase')}
                        className={`p-2 text-sm rounded-lg border ${bulkPriceOperation === 'increase'
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <TranslatedText>Arttır</TranslatedText>
                      </button>
                      <button
                        onClick={() => setBulkPriceOperation('decrease')}
                        className={`p-2 text-sm rounded-lg border ${bulkPriceOperation === 'decrease'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <TranslatedText>Azalt</TranslatedText>
                      </button>
                    </div>
                  </div>

                  {/* Price Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText>Değer Türü</TranslatedText>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBulkPriceType('percentage')}
                        className={`p-2 text-sm rounded-lg border ${bulkPriceType === 'percentage'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <FaPercent className="inline mr-1" />
                        <TranslatedText>Yüzde</TranslatedText>
                      </button>
                      <button
                        onClick={() => setBulkPriceType('fixed')}
                        className={`p-2 text-sm rounded-lg border ${bulkPriceType === 'fixed'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-700'
                          }`}
                      >
                        <TranslatedText>₺ Sabit</TranslatedText>
                      </button>
                    </div>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText>Değer</TranslatedText>
                    </label>
                    <input
                      type="number"
                      value={bulkPriceValue}
                      onChange={(e) => setBulkPriceValue(e.target.value)}
                      placeholder={bulkPriceType === 'percentage' ? '10' : '5.00'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkPriceType === 'percentage'
                        ? <><TranslatedText>Fiyatları %</TranslatedText>{bulkPriceValue || '0'} <TranslatedText>{bulkPriceOperation === 'increase' ? 'arttır' : 'azalt'}</TranslatedText></>
                        : <><TranslatedText>Fiyatlara ₺</TranslatedText>{bulkPriceValue || '0'} <TranslatedText>{bulkPriceOperation === 'increase' ? 'ekle' : 'çıkar'}</TranslatedText></>
                      }
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkPriceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <TranslatedText>İptal</TranslatedText>
                  </button>
                  <button
                    onClick={handleBulkPriceUpdate}
                    disabled={!bulkPriceValue}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TranslatedText>Güncelle</TranslatedText>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
