'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaBell, FaArrowLeft, FaStar, FaPlus, FaInfo, FaUtensils, FaFilter } from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useCartStore } from '@/store';
import Toast from '@/components/Toast';
import MenuItemModal from '@/components/MenuItemModal';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import SetBrandColor from '@/components/SetBrandColor';
import apiService from '@/services/api';

function MenuPageContent() {
  // Store states
  const { currentLanguage, translate } = useLanguage();
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);
  const tableNumber = useCartStore(state => state.tableNumber);
  const setTableNumber = useCartStore(state => state.setTableNumber);
  
  // Restaurant store - backend'den gerçek veriler
  const { 
    restaurants, 
    categories, 
    menuItems, 
    fetchRestaurants, 
    fetchRestaurantMenu,
    loading 
  } = useRestaurantStore();
  
  // Local states
  const [activeCategory, setActiveCategory] = useState('popular');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState('Menüde ara...');
  const { settings } = useBusinessSettingsStore();
  const [showSplash, setShowSplash] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenMessage, setTokenMessage] = useState('');
  const [showDebugModal, setShowDebugModal] = useState(false);
  const primary = settings.branding.primaryColor;
  const secondary = settings.branding.secondaryColor || settings.branding.primaryColor;
  
  // Subdomain'den restaurant bulma - Demo için Aksaray restoranını kullan
  const getCurrentRestaurant = () => {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    const mainDomains = ['localhost', 'www', 'guzellestir', 'restxqr'];
    
    // Ana domain veya demo için Aksaray restoranını kullan
    if (mainDomains.includes(subdomain)) {
      return restaurants.find((r: any) => r.username === 'aksaray');
    }
    
    // Subdomain'e göre restoran bul
    return restaurants.find((r: any) => r.username === subdomain);
  };

  const currentRestaurant = getCurrentRestaurant();

  // Restaurant'a göre kategoriler ve ürünler filtreleme
  const items = currentRestaurant?.id 
    ? menuItems.filter((item: any) => item.restaurantId === currentRestaurant.id)
    : [];
  const filteredCategories = currentRestaurant?.id 
    ? categories.filter((cat: any) => cat.restaurantId === currentRestaurant.id)
    : [];

  // QR Table Number Detection - Sabit QR ile çalışır
  useEffect(() => {
    const detectTableAndToken = async () => {
      if (typeof window === 'undefined') return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      const tokenParam = urlParams.get('token');
      
      // Token varsa doğrula
      if (tokenParam) {
        try {
          const response = await apiService.verifyQRToken(tokenParam);
          
          if (response.success && response.data?.isActive) {
            setTokenValid(true);
            setTokenMessage('QR kod geçerli. Menüye erişebilirsiniz.');
            
            // Token'dan gelen masa numarasını ayarla
            if (response.data?.tableNumber) {
              setTableNumber(response.data.tableNumber);
              console.log('✅ Masa numarası token\'dan alındı:', response.data.tableNumber);
            }
            
            // Token'ı sessionStorage'a kaydet
            sessionStorage.setItem('qr_token', tokenParam);
            console.log('✅ Token doğrulandı:', tokenParam);
          } else {
            // Token deaktifse veya geçersizse, masa numarası varsa yeni token oluştur
            if (tableParam) {
              console.log('⚠️ Token geçersiz veya deaktif, yeni token oluşturuluyor...');
              try {
                // Backend'den restoran bilgisini al (subdomain'den)
                const subdomain = window.location.hostname.split('.')[0];
                const restaurantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/username/${subdomain}`);
                if (restaurantRes.ok) {
                  const restaurantData = await restaurantRes.json();
                  if (restaurantData.success && restaurantData.data) {
                    // Yeni token oluştur
                    const newTokenRes = await apiService.generateQRToken({
                      restaurantId: restaurantData.data.id,
                      tableNumber: parseInt(tableParam),
                      duration: 24
                    });
                    if (newTokenRes.success && newTokenRes.data?.token) {
                      // Yeni token ile URL'i güncelle
                      const newUrl = `${window.location.origin}/menu/?token=${newTokenRes.data.token}&table=${tableParam}`;
                      window.history.replaceState({}, '', newUrl);
                      sessionStorage.setItem('qr_token', newTokenRes.data.token);
                      setTokenValid(true);
                      setTokenMessage('Yeni QR kod oluşturuldu. Menüye erişebilirsiniz.');
                      setTableNumber(parseInt(tableParam));
                      console.log('✅ Yeni token oluşturuldu:', newTokenRes.data.token);
                      return;
                    }
                  }
                }
              } catch (error) {
                console.error('Yeni token oluşturma hatası:', error);
              }
            }
            
            // Oturum devamlılığı için, masa parametresi varsa yeni token üretelim
            if (currentRestaurant?.id && tableParam) {
              try {
                const gen = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qr/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    restaurantId: currentRestaurant.id,
                    tableNumber: parseInt(tableParam),
                    duration: 2
                  })
                });
                const genData = await gen.json();
                if (genData.success) {
                  sessionStorage.setItem('qr-session-token', genData.data.token);
                  setTokenValid(true);
                  setTokenMessage('Yeni QR oturumu oluşturuldu. Menüye erişebilirsiniz.');
                  // Masa numarasını set et
                  if (tableParam) {
                    setTableNumber(parseInt(tableParam));
                    console.log('✅ Masa numarası yeni token ile ayarlandı:', tableParam);
                  }
        } else {
                  setTokenValid(false);
                  setTokenMessage('QR kod geçersiz veya süresi dolmuş. Lütfen yeni bir QR kod tarayın.');
                  return;
                }
              } catch (e) {
                setTokenValid(false);
                setTokenMessage('QR kod doğrulanamadı. Lütfen yeni bir QR kod tarayın.');
                return;
              }
    } else {
              setTokenValid(false);
              setTokenMessage('QR kod geçersiz veya süresi dolmuş. Lütfen yeni bir QR kod tarayın.');
              return; // Token geçersizse devam etme
            }
          }
        } catch (error) {
          console.error('❌ Token doğrulama hatası:', error);
          setTokenValid(false);
          setTokenMessage('QR kod doğrulanamadı. Lütfen yeni bir QR kod tarayın.');
          return;
        }
      }
      
      // Masa numarası kontrolü
      if (tableParam) {
        const tableNum = parseInt(tableParam);
        
        if (!isNaN(tableNum) && tableNum > 0) {
          // Masa numarasını her durumda set et
          setTableNumber(tableNum);
          console.log('✅ Masa numarası URL parametresinden ayarlandı:', tableNum);
          
          // Token yoksa yeni QR token oluştur (eski sistem için)
          if (!tokenParam) {
            try {
              if (currentRestaurant?.id) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qr/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    restaurantId: currentRestaurant.id,
                    tableNumber: tableNum,
                    duration: 2 // 2 saat
                  })
                });
                
                const data = await response.json();
                
                if (data.success) {
                  console.log('Masa oturumu başlatıldı:', {
                    masa: tableNum,
                    token: data.data.token,
                    süre: '2 saat'
                  });
                  
                  // Token'ı sessionStorage'a kaydet (sayfa yenilenirse tekrar oluşturma)
                  sessionStorage.setItem('qr-session-token', data.data.token);
                }
              }
            } catch (error) {
              console.error('Session token oluşturma hatası:', error);
            }
          }
        }
      }
    };
    
    detectTableAndToken();
  }, [setTableNumber, currentRestaurant]);

  // Fetch data on mount
  useEffect(() => {
    setIsClient(true);
    // Restaurants yoksa fetch et
    if (restaurants.length === 0) {
      fetchRestaurants();
    }
    // Restaurant varsa menüyü fetch et
    if (currentRestaurant?.id) {
      fetchRestaurantMenu(currentRestaurant.id);
    }
    try {
      const hasVisited = typeof window !== 'undefined' && sessionStorage.getItem('menuVisitedOnce');
      if (!hasVisited) {
        setShowSplash(true);
        sessionStorage.setItem('menuVisitedOnce', '1');
        setTimeout(() => setShowSplash(false), 1600);
      }
    } catch {}
  }, [restaurants.length, currentRestaurant?.id, fetchRestaurants, fetchRestaurantMenu]);

  // Update search placeholder based on language
  useEffect(() => {
    if (currentLanguage === 'Turkish') {
      setSearchPlaceholder('Menüde ara...');
    } else {
      // For other languages, we'll translate this
      const translatePlaceholder = async () => {
        try {
          const translated = await translate('Menüde ara...');
          setSearchPlaceholder(translated);
        } catch (error) {
      setSearchPlaceholder('Search menu...');
    }
      };
      translatePlaceholder();
    }
  }, [currentLanguage, translate]);

  // Helper functions - defined inside component to avoid dependency issues
  const getPopularItems = () => {
    return items.filter((item: any) => item.isPopular);
  };

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item: any) => item.categoryId === categoryId);
  };

  const getItemsBySubcategory = (subcategoryId: string) => {
    return items.filter((item: any) => item.subcategory === subcategoryId);
  };

  const getSubcategoriesByParent = (parentId: string) => {
    return []; // Backend'de subcategory yok
  };

  // Get cart count - only calculate on client side to avoid hydration mismatch
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isClient) {
      setCartCount(cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0));
    }
  }, [isClient, cartItems]);

  // Get language code for menu data
  const language = currentLanguage === 'Turkish' ? 'tr' : 'en';
  
  // Get menu categories (backend format)
  const menuCategories = [
    { id: 'popular', name: currentLanguage === 'Turkish' ? 'Popüler' : 'Popular' },
    ...filteredCategories.map((cat: any) => ({
      id: cat.id,
      name: typeof cat.name === 'string' ? cat.name : (cat.name?.tr || cat.name?.en || 'Kategori')
    }))
  ];

  // Get subcategories for active category
  const activeSubcategories = activeCategory === 'popular' ? [] : getSubcategoriesByParent(activeCategory);
  
  // Get filtered items
  let filteredItems = activeCategory === 'popular'
    ? getPopularItems()
    : activeSubcategory
      ? getItemsBySubcategory(activeSubcategory)
      : getItemsByCategory(activeCategory);

  if (search.trim() !== '') {
    filteredItems = filteredItems.filter((item: any) => {
      const itemName = typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || '');
      const itemDesc = typeof item.description === 'string' ? item.description : (item.description?.tr || item.description?.en || '');
      return itemName.toLowerCase().includes(search.toLowerCase()) ||
             itemDesc.toLowerCase().includes(search.toLowerCase());
    });
  }

  // Event handlers
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
  };

  const handleSubcategoryChange = (subcategoryId: string | null) => {
    setActiveSubcategory(subcategoryId);
  };

  const addToCart = (item: any) => {
    try {
      const cartItem = {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        preparationTime: item.preparationTime
      };
      
      console.log('🛒 SEPETE EKLEME:', {
        timestamp: new Date().toLocaleString(),
        ürün: item.name,
        fiyat: item.price + '₺',
        kategori: item.category,
        restaurantId: currentRestaurant?.id,
        restaurantName: currentRestaurant?.name,
        masaNo: tableNumber,
        cartItem
      });
      
      addItem(cartItem);
      setToastVisible(true);
      
      console.log('✅ Sepete eklendi! Toplam ürün:', cartItems.length + 1);
      
      // Auto hide toast after 3 seconds
      setTimeout(() => setToastVisible(false), 3000);
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error);
    }
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };


  const showDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toLocaleString(),
      restaurant: {
        id: currentRestaurant?.id,
        name: currentRestaurant?.name,
        username: currentRestaurant?.username
      },
      cart: {
        itemCount: cartItems.length,
        items: cartItems.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price + '₺'
        })),
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + '₺'
      },
      table: tableNumber || 'Belirtilmemiş',
      menu: {
        totalItems: items.length,
        categories: filteredCategories.length
      }
    };
    
    console.log('🐛 DEBUG BİLGİLERİ:', debugData);
    alert(JSON.stringify(debugData, null, 2));
  };

  // Token geçersizse menüyü gizle
  if (tokenValid === false) {
    return (
      <>
        <SetBrandColor />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">QR Kod Geçersiz</h2>
              <p className="text-gray-600 mb-4">{tokenMessage}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Bu QR kod ödeme tamamlandıktan sonra geçersiz hale gelir. 
                  Yeni bir QR kod tarayarak menüye erişebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SetBrandColor />
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-fadeIn">
          <div className="text-center px-6 animate-scaleIn">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="absolute inset-0 -z-10 h-24 w-24 rounded-full opacity-10" style={{ backgroundColor: 'var(--brand-primary)' }} />
              {settings.branding.logo ? (
                <img src={settings.branding.logo} alt="Logo" className="h-20 w-20 object-contain rounded-md shadow-sm" />
              ) : (
                <div className="h-20 w-20 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {(settings.basicInfo.name || 'Işletme').slice(0,1)}
                </div>
              )}
            </div>
            <div className="text-dynamic-xl font-bold text-gray-900">{settings.basicInfo.name || 'İşletme'}</div>
            {settings.branding.showSloganOnLoading !== false && settings.basicInfo.slogan && (
              <div className="text-dynamic-sm text-gray-600 mt-1">{settings.basicInfo.slogan}</div>
            )}
            <div className="mt-4 mx-auto h-[1px] w-40 bg-gray-200" />
            <div className="mt-3 w-40 h-1 bg-gray-100 rounded overflow-hidden mx-auto">
              <div className="h-full bg-brand animate-progress" />
                </div>
              </div>
          <style jsx>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes scaleIn { from { transform: scale(.96); opacity: .4 } to { transform: scale(1); opacity: 1 } }
            @keyframes progress { 0% { transform: translateX(-100%) } 100% { transform: translateX(0) } }
            .animate-fadeIn { animation: fadeIn 200ms ease-out }
            .animate-scaleIn { animation: scaleIn 300ms ease-out }
            .animate-progress { animation: progress 900ms ease-out forwards }
          `}</style>
        </div>
      )}
      <Toast message="Ürün sepete eklendi!" visible={toastVisible} onClose={() => setToastVisible(false)} />
      <main className="min-h-screen pb-20 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-dynamic-lg font-bold text-primary">
                <TranslatedText>Menü</TranslatedText>
              </h1>
              {tableNumber > 0 && (
              <div className="ml-2 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'var(--tone1-bg)', color: 'var(--tone1-text)', border: '1px solid var(--tone1-border)' }}>
                {currentRestaurant?.name || 'Restoran'} Masa {tableNumber}
            </div>
              )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FaShoppingCart className="text-xl" style={{ color: primary }} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: primary }}>
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
        </header>

        {/* Search */}
        <div className="pt-16 px-3 flex items-center mb-4 max-w-full">
          <input
            type="text"
            className="border rounded p-2 w-full mr-2 max-w-full"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Anlık Duyurular Slider */}
        <div className="px-3 mb-4">
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div className="flex animate-slide">
              <div className="min-w-full text-white p-3 bg-brand-gradient">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🎉</span>
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>{settings.basicInfo.dailySpecialTitle || 'Bugüne Özel!'}</TranslatedText>
                    </div>
                    <div className="text-xs opacity-90">
                      <TranslatedText>{settings.basicInfo.dailySpecialDesc || 'Tüm tatlılarda %20 indirim - Sadece bugün geçerli'}</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-full text-white p-3 bg-brand-gradient">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🍲</span>
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>{settings.basicInfo.soupOfDayTitle || 'Günün Çorbası'}</TranslatedText>
                    </div>
                    <div className="text-xs opacity-90">
                      <TranslatedText>{settings.basicInfo.soupOfDayDesc || 'Ezogelin çorbası - Ev yapımı lezzet'}</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide {
            0%, 45% { transform: translateX(0); }
            50%, 95% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
          }
          .animate-slide {
            animation: slide 8s infinite;
          }
        `}</style>

        {/* Categories */}
        <div className="pb-2 overflow-x-auto max-w-full">
          <div className="flex px-3 space-x-2 min-w-max max-w-full">
            {menuCategories.map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-dynamic-sm ${
                  activeCategory === category.id
                    ? 'btn-gradient'
                    : 'bg-brand-surface text-gray-700'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories - Backend'de subcategory yok, bu kısım kaldırıldı */}

        {/* Menu Items */}
        <div className="container mx-auto px-3 py-2 max-w-full">
          <div className="grid grid-cols-1 gap-3 max-w-full">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-3 flex max-w-full">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={item.imageUrl ? 
                      (item.imageUrl.startsWith('http') ? 
                        item.imageUrl : 
                        `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`) 
                      : '/placeholder-food.jpg'} 
                    alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Menu item')} 
                    width={80}
                    height={80}
                    className="object-cover w-full h-full rounded-lg"
                  />
                  {item.isPopular && (
                    <div className="absolute top-0 left-0 text-white text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--brand-strong)' }}>
                      <FaStar className="inline-block mr-1" size={8} />
                      <TranslatedText>Popüler</TranslatedText>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-dynamic-sm truncate">{typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}</h3>
                    <span className="font-semibold text-dynamic-sm flex-shrink-0 ml-2" style={{ color: primary }}>{item.price} ₺</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2 break-words">
                    {typeof item.description === 'string' ? item.description : (item.description?.tr || item.description?.en || '')}
                  </p>

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.allergens.slice(0, 3).map((allergen: any, i: number) => (
                        <span key={i} className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">
                          {typeof allergen === 'string' ? allergen : (allergen[language as keyof typeof allergen] || allergen.tr || allergen.en)}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Debug: Allergens */}
                  {process.env.NODE_ENV === 'development' && item.allergens && (
                    <div className="text-xs text-gray-400">
                      Debug: {JSON.stringify(item.allergens)}
                    </div>
                  )}
                        
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => openModal(item)}
                      className="text-xs flex items-center"
                      style={{ color: primary }}
                    >
                      <FaInfo className="mr-1" size={10} />
                      <TranslatedText>Detayları Gör</TranslatedText>
                    </button>
                    <button
                      className="btn btn-secondary py-1 px-3 text-xs rounded flex items-center"
                      onClick={() => addToCart(item)}
                    >
                      <FaPlus className="mr-1" size={10} />
                      <TranslatedText>Sepete Ekle</TranslatedText>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sabit Duyurular */}
        <div className="container mx-auto px-3 py-4 mb-20">
          <div className="rounded-xl p-5 shadow-lg border bg-tone1">
            <div className="grid grid-cols-1 gap-3">
              {/* WiFi Info */}
              {settings.basicInfo.showWifiInMenu && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>
                <div className="flex items-center">
                  <span className="text-lg mr-3">📶</span>
                  <span className="text-sm font-medium text-gray-700">
                    <TranslatedText>WiFi Şifresi</TranslatedText>
                  </span>
                </div>
                  <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: 'var(--brand-strong)', backgroundColor: 'var(--brand-surface)' }}>
                    {settings.basicInfo.wifiPassword || 'restoran2024'}
                  </span>
              </div>
              )}
              {/* Google Review Button */}
              <a
                href="https://www.google.com/maps/place/restoranadi/reviews" // Change to actual Google review URL
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-tone2"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">⭐</span>
                  <span className="text-sm font-medium text-gray-800">
                    <TranslatedText>Google'da Değerlendir</TranslatedText>
                  </span>
                </div>
                <button className="text-xs font-semibold px-3 py-1 rounded-lg shadow group-hover:scale-105 transition btn-secondary">
                  <TranslatedText>Yorum Yap</TranslatedText>
                </button>
              </a>
              {/* Working Hours */}
              {settings.basicInfo.showHoursInMenu && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>
                <div className="flex items-center">
                  <span className="text-lg mr-3">🕒</span>
                  <span className="text-sm font-medium text-gray-700">
                    <TranslatedText>Çalışma Saatleri</TranslatedText>
                  </span>
                </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--brand-strong)' }}>
                    {settings.basicInfo.workingHours || '09:00 - 23:00'}
                  </span>
              </div>
              )}
              {/* Instagram Button */}
              {settings.basicInfo.showInstagramInMenu && (
              <a
                  href={settings.basicInfo.instagram || "https://instagram.com/restoranadi"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-tone3"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">📱</span>
                  <span className="text-sm font-medium text-gray-800">
                    <TranslatedText>Instagram'da Takip Et</TranslatedText>
                  </span>
                </div>
                <button className="text-sm font-bold px-3 py-1 rounded-lg shadow group-hover:scale-105 transition btn-primary">
                    @{settings.basicInfo.instagram?.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '') || 'restoranadi'}
                </button>
              </a>
              )}
            </div>
          </div>
        </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg z-30">
        <div className="container mx-auto flex justify-around max-w-full px-2">
            <Link href="/menu" className="flex flex-col items-center" style={{ color: primary }}>
            <FaUtensils className="mb-0.5" size={16} />
            <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
            </Link>
          <Link href="/cart" className="flex flex-col items-center" style={{ color: primary }}>
            <div className="relative">
              <FaShoppingCart className="mb-0.5" size={16} />
                {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                    {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
          </Link>
            <Link href="/garson-cagir" className="flex flex-col items-center" style={{ color: primary }}>
            <FaBell className="mb-0.5" size={16} />
            <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
            </Link>
        </div>
      </nav>
      </main>

      {/* Menu Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}

    </>
  );
}

export default function MenuPage() {
  return (
    <LanguageProvider>
      <MenuPageContent />
    </LanguageProvider>
  );
}
