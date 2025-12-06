'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FaMoneyBillWave
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import { lazy, Suspense } from 'react';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useFeature } from '@/hooks/useFeature';
import { demoRestaurant, demoCategories, demoMenuItems } from '@/data/demoIsletmeData';

// Lazy load heavy components
const CameraCapture = lazy(() => import('@/components/CameraCapture'));
const ImageUploader = lazy(() => import('@/components/ImageUploader'));
const BulkImportModal = lazy(() => import('@/components/BulkImportModal'));

export default function MenuManagement() {
  const router = useRouter();
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
  
  // Demo modunda demo verileri kullan
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/isletme');
  const categories = isDemo ? demoCategories : allCategories.filter(c => c.restaurantId === currentRestaurantId);
  const items = isDemo ? demoMenuItems : allMenuItems.filter(i => i.restaurantId === currentRestaurantId);
  
  console.log('  filtered categories:', categories.length);
  console.log('  filtered items:', items.length);
  console.log('  first item restaurantId:', allMenuItems[0]?.restaurantId);
  console.log('  match?', allMenuItems[0]?.restaurantId === currentRestaurantId);
  
  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';

  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'stats'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out-of-stock'>('all');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: {tr: string, en: string}}>>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceType, setBulkPriceType] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkPriceOperation, setBulkPriceOperation] = useState<'increase' | 'decrease'>('increase');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Form state'leri - Sadece Türkçe
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    preparationTime: '',
    calories: '',
    ingredients: '',
    allergens: [],
    portion: '',
    isAvailable: true,
    isPopular: false
  });
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true
  });

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

  // Sayfa yüklendiğinde menüyü backend'den çek (sadece normal modda)
  useEffect(() => {
    const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-paneller/isletme');
    
    if (isDemo) {
      console.log('📦 Demo mode - skipping backend fetch');
      return;
    }
    
    console.log('🏪 Current Restaurant ID:', currentRestaurantId);
    if (currentRestaurantId) {
      console.log('📥 Fetching menu for restaurant:', currentRestaurantId);
      fetchRestaurantMenu(currentRestaurantId);
    } else {
      console.warn('⚠️ No restaurant ID found!');
    }
  }, [currentRestaurantId, fetchRestaurantMenu]);

  // Demo için session kontrolü yok
  useEffect(() => {
    console.log('Demo panel sayfası');
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
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
      allergens: [],
      portion: '',
      isAvailable: true,
      isPopular: false
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
      ingredients: item.ingredients || '',
      allergens: Array.isArray(item.allergens) ? item.allergens : [],
      portion: item.portion || '',
      isAvailable: item.isAvailable !== false,
      isPopular: item.isPopular || false
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
        alert(`${successCount} ürünün fiyatı başarıyla güncellendi`);
      }
    } catch (error) {
      console.error('❌ Toplu fiyat güncelleme hatası:', error);
      alert(`Fiyatlar güncellenirken bir hata oluştu: ${(error as Error).message}`);
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
      alert('Kameraya erişim sağlanamadı. Lütfen izin verin.');
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
      isActive: true
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
      isActive: category.isActive !== false
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategoriye ait tüm ürünler de silinecektir.')) {
      try {
        if (currentRestaurantId) {
          await deleteMenuCategory(currentRestaurantId, categoryId);
      console.log('Kategori silindi:', categoryId);
          // Menüyü yeniden yükle
          await fetchRestaurantMenu(currentRestaurantId);
        }
      } catch (error) {
        console.error('Kategori silinirken hata:', error);
        alert('Kategori silinirken bir hata oluştu');
      }
    }
  };

  // Filtrelenmiş ürünler
  const filteredItems = items.filter(item => {
    // Debug: Ürün verilerini console'a yazdır
    console.log('Ürün verisi:', {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      image: item.image
    });
    
    // Güvenlik kontrolü - item.name ve item.description undefined olabilir
    const getName = (name: any): string => {
      if (typeof name === 'string') return name;
      if (typeof name === 'object' && name !== null) return name.tr || name.en || '';
      return '';
    };
    
    const itemName = getName(item.name);
    const itemDescription = getName(item.description);
    
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'available' && item.isAvailable !== false) ||
                         (statusFilter === 'out-of-stock' && item.isAvailable === false);
    
    const showItem = showOutOfStock || item.isAvailable !== false;
    
    return matchesSearch && matchesStatus && showItem;
  });

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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <FaUtensils className="text-2xl text-white" />
                </div>
            <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                    Menü Yönetimi
                  </h2>
                  <p className="text-gray-600 text-lg font-semibold mt-1">Restoran menünüzü yönetin ve düzenleyin</p>
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
            className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'items'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FaUtensils />
            Ürünler ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FaTag />
            Kategoriler ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-4 rounded-xl text-base font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FaChartBar />
            İstatistikler
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
            <span className="font-bold">Yeni Ürün Ekle</span>
          </button>

          {/* Toplu Fiyat Düzenle */}
              <button 
                onClick={() => setShowBulkPriceModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
            <span className="text-white text-xl">%</span>
            <span className="font-bold">Toplu Fiyat Düzenle</span>
              </button>

          {/* Toplu İçe Aktar (AI) */}
              <button 
                onClick={() => setShowBulkImport(true)}
            className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Toplu İçe Aktar</span>
          </button>
        </div>
      </div>

      {/* Loading State */}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
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
                    {selectedItems.length} ürün seçildi
                  </span>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Seçimi Temizle
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkPriceModal(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <FaMoneyBillWave className="text-xs" />
                    Fiyat Düzenle
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                  >
                    <FaTrash className="text-xs" />
                    Sil
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
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtreler */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Durum:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tümü</option>
                  <option value="available">Mevcut</option>
                  <option value="out-of-stock">Tükendi</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Tükenen ürünleri göster</span>
              </label>
            </div>
          </div>

          {/* Items List - Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
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
                            src={item.imageUrl || item.image ? 
                              (item.imageUrl || item.image).startsWith('http') ? 
                                (item.imageUrl || item.image) : 
                                `https://masapp-backend.onrender.com${item.imageUrl || item.image}` 
                              : '/placeholder-food.jpg'}
                            alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
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
                              {typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'İsim Yok')}
                              {item.isPopular && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                                  <FaFire className="mr-1 text-yellow-600" />
                                  Popüler
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {typeof item.description === 'string' ? item.description : (item.description?.tr || item.description?.en || 'Açıklama Yok')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(() => {
                          const cat = categories.find(c => c.id === item.categoryId);
                          if (!cat) return 'Kategori Yok';
                          const catName = cat.name;
                          return typeof catName === 'string' ? catName : (catName?.tr || catName?.en || 'Kategori Yok');
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₺{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isAvailable !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            item.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {item.isAvailable !== false ? 'Mevcut' : 'Tükendi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={item.imageUrl || item.image ? 
                      (item.imageUrl || item.image).startsWith('http') ? 
                        (item.imageUrl || item.image) : 
                        `https://masapp-backend.onrender.com${item.imageUrl || item.image}` 
                      : '/placeholder-food.jpg'}
                    alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
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
                          {typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'İsim Yok')}
                        </h3>
                        {item.isPopular && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 mt-1">
                            <FaFire className="mr-1 text-yellow-600" />
                            Popüler
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {typeof item.description === 'string' ? item.description : (item.description?.tr || item.description?.en || 'Açıklama Yok')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          ₺{item.price}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.isAvailable !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            item.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {item.isAvailable !== false ? 'Mevcut' : 'Tükendi'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {(() => {
                          const cat = categories.find(c => c.id === item.categoryId);
                          if (!cat) return 'Kategori Yok';
                          const catName = cat.name;
                          return typeof catName === 'string' ? catName : (catName?.tr || catName?.en || 'Kategori Yok');
                        })()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Kategoriler</h2>
            <button 
              onClick={handleAddCategory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaPlus />
              Yeni Kategori Ekle
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FaFolderOpen className="mx-auto text-5xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz kategori yok</h3>
              <p className="text-sm text-gray-500 mb-4">
                Menü ürünlerinizi düzenlemek için kategoriler oluşturun
              </p>
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
              >
                <FaPlus />
                İlk Kategoriyi Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{typeof category.name === 'string' ? category.name : (category.name?.tr || category.name?.en || 'Kategori')}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive !== false ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {items.filter(i => i.categoryId === category.id).length} ürün
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Düzenle
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

      {!loading && activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Menü İstatistikleri</h2>
            <div className="text-xs text-gray-500">Backend verileri üzerinden hesaplanır</div>
          </div>

          {/* KPI Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {label:'Toplam Ürün', value: items.length, icon:<FaUtensils className='text-blue-600' />, bg:'bg-blue-100'},
              {label:'Popüler Ürünler', value: items.filter(i=>i.isPopular).length, icon:<FaFire className='text-red-600' />, bg:'bg-red-100'},
              {label:'Kategori Sayısı', value: categories.length, icon:<FaTag className='text-green-600' />, bg:'bg-green-100'},
              {label:'Ortalama Fiyat', value:`₺${items.length>0? Math.round(items.reduce((s,i)=>s+i.price,0)/items.length):0}`, icon:<FaChartBar className='text-purple-600' />, bg:'bg-purple-100'}
            ].map((kpi,idx)=> (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bg}`}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* Modals */}
          {showItemForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-[9999] lg:ml-72">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
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
                        Ürün Adı *
                        </label>
                        <input
                          type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Örn: Bruschetta"
                        required
                      />
                    </div>

                    {/* Açıklama */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Açıklama
                        </label>
                        <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ürün açıklaması..."
                        />
                    </div>

                    {/* Fiyat ve Kategori */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fiyat (₺) *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="45"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kategori *
                        </label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Kategori Seçin</option>
                          {categories.length > 0 ? (
                            categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                          ) : (
                            <option disabled>Önce kategori ekleyin</option>
                          )}
                        </select>
                        {categories.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Kategori bulunamadı. Lütfen önce "Kategoriler" sekmesinden kategori ekleyin.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kalori ve Hazırlık Süresi */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kalori
                        </label>
                        <input
                          type="number"
                          value={formData.calories}
                          onChange={(e) => setFormData({...formData, calories: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="250"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hazırlık Süresi (dakika)
                        </label>
                        <input
                          type="number"
                          value={formData.preparationTime}
                          onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="15"
                        />
                      </div>
                    </div>

                    {/* Alt Kategori */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Kategori
                        </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Sıcak İçecekler, Ana Yemekler"
                        />
                      </div>

                    {/* Malzemeler */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Malzemeler
                        </label>
                        <textarea
                        value={formData.ingredients}
                        onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                        rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Malzemeleri virgülle ayırarak yazın (Örn: Domates, Mozzarella, Fesleğen)"
                        />
                    </div>

                    {/* Alerjenler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alerjenler
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Gluten', 'Süt', 'Yumurta', 'Fındık', 'Fıstık', 'Soya', 'Balık', 'Kabuklu Deniz Ürünleri'].map((allergen) => (
                          <label key={allergen} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={Array.isArray(formData.allergens) && formData.allergens.includes(allergen)}
                              onChange={(e) => {
                                const currentAllergens = Array.isArray(formData.allergens) ? formData.allergens : [];
                                console.log('Alerjen değişikliği:', { allergen, checked: e.target.checked, currentAllergens });
                                if (e.target.checked) {
                                  const newAllergens = [...currentAllergens, allergen];
                                  console.log('Yeni alerjenler:', newAllergens);
                                  setFormData({...formData, allergens: newAllergens});
                                } else {
                                  const newAllergens = currentAllergens.filter(a => a !== allergen);
                                  console.log('Kaldırılan alerjenler:', newAllergens);
                                  setFormData({...formData, allergens: newAllergens});
                                }
                              }}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ürün Fotoğrafı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ürün Fotoğrafı
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
                          <p className="text-sm font-medium text-purple-600">Kameradan Çek</p>
                          <p className="text-xs text-gray-500">Telefon kamerası</p>
                        </button>

                        {/* Dosyadan Yükle */}
                        <label className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Seçilen dosya:', file.name, 'Boyut:', file.size, 'Tip:', file.type);
                        
                        // Dosya boyutunu kontrol et (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.');
                          return;
                        }
                        
                        // Dosya tipini kontrol et
                        if (!file.type.startsWith('image/')) {
                          alert('Lütfen sadece resim dosyası seçin.');
                          return;
                        }
                        
                        // Basit ve güvenilir resim yükleme sistemi
                        try {
                          console.log('📤 Resim yükleniyor:', file.name, file.size, 'bytes');
                          
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          console.log('📡 API URL:', process.env.NEXT_PUBLIC_API_URL);
                          
                          const response = await fetch(`https://masapp-backend.onrender.com/api/upload/image`, {
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
                            alert('✅ Resim başarıyla yüklendi!');
                          } else {
                            console.error('❌ Upload failed:', result.message);
                            alert('❌ Resim yüklenemedi: ' + result.message);
                          }
                        } catch (error) {
                          console.error('❌ Resim yükleme hatası:', error);
                          alert('❌ Resim yüklenirken hata oluştu: ' + error.message);
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
                          <p className="text-sm font-medium text-gray-600">Dosyadan Yükle</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                        </label>
                      </div>

                      {/* AI Görsel İşleme */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            <span className="text-yellow-400 text-lg">✨</span>
                            <span className="text-yellow-400 text-sm">⭐</span>
                            <span className="text-yellow-400 text-xs">✨</span>
                          </div>
                          <h4 className="font-semibold text-gray-800">AI Görsel İşleme Aktif!</h4>
                        </div>
                        
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Otomatik arka plan kaldırma</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Renk ve parlaklık optimizasyonu</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Akıllı boyutlandırma</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Keskinlik artırma</span>
                          </li>
                        </ul>
                        
                        <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">💡</span>
                            <span className="text-xs text-yellow-800">
                              Kameradan çekmek daha profesyonel sonuçlar verir
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Seçilen Fotoğraf Önizleme */}
                      {capturedImage && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Seçilen Fotoğraf:</p>
                          <div className="relative inline-block">
                            <img
                              src={capturedImage.startsWith('http') ? capturedImage : `https://masapp-backend.onrender.com${capturedImage}`}
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
                            Ürün Durumu
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="status"
                                value="available"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'available'})}
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Mevcut
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="status"
                                value="out-of-stock"
                                checked={!formData.isAvailable}
                                onChange={(e) => setFormData({...formData, isAvailable: e.target.value !== 'out-of-stock'})}
                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Tükendi
                              </span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.isPopular}
                              onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                              className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                            />
                            <span className="ml-3 text-sm font-medium text-yellow-800 flex items-center gap-2">
                              <FaFire className="text-yellow-600" size={16} />
                              Popüler Ürün
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
                      İptal
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
                                name: formData.name,
                                description: formData.description,
                            price: Number(formData.price),
                            categoryId: formData.category,
                            isAvailable: formData.isAvailable,
                            isPopular: formData.isPopular,
                                imageUrl: capturedImage || editingItem.imageUrl,
                                allergens: formData.allergens
                              };
                              
                              console.log('Update Data gönderiliyor:', updateData);
                              console.log('Alerjenler:', formData.allergens);
                              console.log('Resim URL uzunluğu:', updateData.imageUrl.length);
                              
                              await updateMenuItem(currentRestaurantId, editingItem.id, updateData);
                          console.log('Ürün güncellendi:', formData);
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                              alert('Ürün başarıyla güncellendi!');
                            }
                          } catch (error) {
                            console.error('Ürün güncellenirken hata:', error);
                            alert('Ürün güncellenirken bir hata oluştu: ' + error.message);
                          }
                        } else {
                          // Yeni ürün ekleme
                          if (!formData.name || !formData.price || !formData.category) {
                            alert('Lütfen ürün adı, fiyat ve kategori alanlarını doldurun!');
                            return;
                          }
                          
                          try {
                            if (currentRestaurantId) {
                              const createData = {
                            categoryId: formData.category,
                                name: formData.name,
                                description: formData.description,
                            price: Number(formData.price),
                                imageUrl: capturedImage || '/placeholder-food.jpg',
                            order: items.length + 1,
                            isAvailable: formData.isAvailable,
                            isPopular: formData.isPopular,
                                allergens: formData.allergens
                              };
                              
                              console.log('Create Data gönderiliyor:', createData);
                              console.log('Alerjenler:', formData.allergens);
                              console.log('Resim URL uzunluğu:', createData.imageUrl.length);
                              
                              await createMenuItem(currentRestaurantId, createData);
                              console.log('Yeni ürün backend\'e kaydedildi:', formData);
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                              alert('Ürün başarıyla eklendi!');
                            }
                          } catch (error) {
                            console.error('Ürün eklenirken hata:', error);
                            alert('Ürün eklenirken bir hata oluştu: ' + error.message);
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
                          allergens: [],
                          portion: '',
                          isAvailable: true,
                          isPopular: false
                        });
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingItem ? 'Güncelle' : 'Kaydet'}
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
                    {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
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
                        Kategori Adı *
                        </label>
                        <input
                          type="text"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Örn: Başlangıçlar, Ana Yemekler, Tatlılar"
                          required
                      />
                    </div>

                    {/* Durum */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryFormData.isActive}
                          onChange={(e) => setCategoryFormData({...categoryFormData, isActive: e.target.checked})}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Aktif</span>
                      </label>
                    </div>
                  </form>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      onClick={async () => {
                        // Gerçek kategori güncelleme işlemi
                        if (!categoryFormData.name) {
                          alert('Lütfen kategori adını girin!');
                          return;
                        }
                        
                        try {
                        if (editingCategory) {
                            if (currentRestaurantId) {
                              await updateMenuCategory(currentRestaurantId, editingCategory.id, {
                                name: categoryFormData.name,
                                description: categoryFormData.description,
                            order: categoryFormData.order,
                            isActive: categoryFormData.isActive
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
                            isActive: categoryFormData.isActive
                          });
                              console.log('Yeni kategori backend\'e kaydedildi');
                              // Menüyü yeniden yükle
                              await fetchRestaurantMenu(currentRestaurantId);
                            }
                          }
                        } catch (error) {
                          console.error('Kategori işlemi sırasında hata:', error);
                          alert('Kategori işlemi sırasında bir hata oluştu');
                        }
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setSubcategories([]); // Formu temizle
                        setCategoryFormData({
                          name: '',
                          description: '',
                          order: 0,
                          isActive: true
                        });
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingCategory ? 'Güncelle' : 'Kaydet'}
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
                  <h2 className="text-xl font-bold">Fotoğraf Çek</h2>
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
                        <span className="text-white text-sm">Ürünü çerçeve içine alın</span>
                </div>
              </div>
                </div>
                  <div className="flex gap-3">
                    <button
                      onClick={stopCamera}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                      onClick={capturePhoto}
                      className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Fotoğraf Çek
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
                    Toplu Ürün İçe Aktar
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
                        <h4 className="font-semibold text-blue-900 mb-1">CSV Formatı</h4>
                        <p className="text-sm text-blue-800">
                          CSV dosyanız şu sütunları içermelidir: <strong>Ürün Adı, Açıklama, Fiyat, Kategori</strong>
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
                          alert('CSV yükleme özelliği yakında aktif olacak! 🚀');
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
                      <p className="text-lg font-semibold text-gray-700 mb-2">CSV Dosyası Yükle</p>
                      <p className="text-sm text-gray-500">Tıklayın veya dosyayı sürükleyin</p>
                      <p className="text-xs text-gray-400 mt-2">Maksimum dosya boyutu: 5MB</p>
                    </label>
                  </div>

                  {/* Example Template */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700">Örnek Şablon</h4>
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
                        Şablonu İndir
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
                        <p className="text-sm font-medium text-gray-700">Hızlı İçe Aktar</p>
                        <p className="text-xs text-gray-500">Yüzlerce ürünü tek seferde ekleyin</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Otomatik Doğrulama</p>
                        <p className="text-xs text-gray-500">Hatalı veriler otomatik tespit edilir</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
                  <button
                    onClick={() => setShowBulkImport(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    İptal
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
                  <h2 className="text-xl font-bold">Toplu Fiyat Düzenle</h2>
                  <button
                    onClick={() => setShowBulkPriceModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedItems.length} ürünün fiyatını güncelleyeceksiniz.
                  </p>
                  
                  {/* Operation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşlem Türü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBulkPriceOperation('increase')}
                        className={`p-2 text-sm rounded-lg border ${
                          bulkPriceOperation === 'increase'
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Arttır
                      </button>
                      <button
                        onClick={() => setBulkPriceOperation('decrease')}
                        className={`p-2 text-sm rounded-lg border ${
                          bulkPriceOperation === 'decrease'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        Azalt
                      </button>
                    </div>
                  </div>

                  {/* Price Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Değer Türü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBulkPriceType('percentage')}
                        className={`p-2 text-sm rounded-lg border ${
                          bulkPriceType === 'percentage'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        <FaPercent className="inline mr-1" />
                        Yüzde
                      </button>
                      <button
                        onClick={() => setBulkPriceType('fixed')}
                        className={`p-2 text-sm rounded-lg border ${
                          bulkPriceType === 'fixed'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        ₺ Sabit
                      </button>
                    </div>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Değer
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
                        ? `Fiyatları %${bulkPriceValue || '0'} ${bulkPriceOperation === 'increase' ? 'arttır' : 'azalt'}`
                        : `Fiyatlara ₺${bulkPriceValue || '0'} ${bulkPriceOperation === 'increase' ? 'ekle' : 'çıkar'}`
                      }
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <button
                    onClick={() => setShowBulkPriceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleBulkPriceUpdate}
                    disabled={!bulkPriceValue}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
