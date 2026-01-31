'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaBell, FaArrowLeft, FaStar, FaPlus, FaInfo, FaUtensils, FaFilter, FaUsers, FaTimes } from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';
import { useCartStore } from '@/store';
import Toast from '@/components/Toast';
import dynamic from 'next/dynamic';
const MenuItemModal = dynamic(() => import('@/components/MenuItemModal'), { ssr: false });
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import SetBrandColor from '@/components/SetBrandColor';
import apiService from '@/services/api';
import LanguageSelector from '@/components/LanguageSelector';

function MenuPageContent() {
  // Store states
  const { currentLanguage, translate } = useLanguage();
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);
  const tableNumber = useCartStore(state => state.tableNumber);
  const setTableNumber = useCartStore(state => state.setTableNumber);
  const clearCart = useCartStore(state => state.clearCart);

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
  const { settings: localSettings } = useBusinessSettingsStore();

  const [showSplash, setShowSplash] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenMessage, setTokenMessage] = useState('');
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(1);
  const [imageCacheVersion, setImageCacheVersion] = useState<number>(0);
  const [orderingAllowed, setOrderingAllowed] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');




  const currentRestaurantStore = useRestaurantStore(state => state.currentRestaurant);

  const currentRestaurant = isClient ? (currentRestaurantStore || (() => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    const mainDomains = ['localhost', 'www', 'guzellestir', 'restxqr'];

    if (mainDomains.includes(subdomain)) {
      return restaurants.find((r: any) => r.username === 'aksaray');
    }
    return restaurants.find((r: any) => r.username === subdomain);
  })()) : null;

  // Use settings from currentRestaurant if available (fetched from backend), 
  // otherwise fallback to localSettings (for backward compatibility/demo)
  const settings = (currentRestaurant?.settings || localSettings) as any;
  const primary = settings?.branding?.primaryColor || '#F97316';
  const secondary = settings?.branding?.secondaryColor || primary;

  // Campaign Banner Logic (Moved here to have access to currentRestaurant)
  const [activeBanner, setActiveBanner] = useState<any>(null);

  useEffect(() => {
    // Check if currentRestaurant and settings exist
    if (currentRestaurant?.settings?.campaignBanners) {
      const now = new Date();
      const banners = (currentRestaurant.settings.campaignBanners as any[]);

      // Find valid banner
      const validBanner = banners.find((b: any) => {
        if (!b.startDate || !b.endDate) return false;
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return b.isActive && now >= start && now <= end;
      });

      if (validBanner) {
        // Check if already seen in this session
        const hasSeen = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`seenBanner_${validBanner.id}`) : null;
        if (!hasSeen) {
          setActiveBanner(validBanner);
        }
      }
    }
  }, [currentRestaurant]);

  const closeBanner = () => {
    if (activeBanner) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`seenBanner_${activeBanner.id}`, 'true');
      }
      setActiveBanner(null);
    }
  };

  // Restaurant'a göre kategoriler ve ürünler filtreleme
  const items = currentRestaurant?.id
    ? menuItems.filter((item: any) => item.restaurantId === currentRestaurant.id)
    : [];
  const filteredCategories = currentRestaurant?.id
    ? categories.filter((cat: any) => cat.restaurantId === currentRestaurant.id)
    : [];

  // QR Table Number Detection Logic
  const detectTableAndToken = async () => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    const tokenParam = urlParams.get('token') || urlParams.get('t');

    if (tokenParam) {
      setToken(tokenParam);

      // OPTIMISTIC UPDATE: Hemen butonları aktif et (Kullanıcı beklemesin)
      // Geçersizse zaten aşağıdaki catch veya else bloklarında tokenValid=false olup hata ekranı gelecek
      if (tableParam) {
        const tNum = parseInt(tableParam);
        if (!isNaN(tNum) && tNum > 0) {
          setTableNumber(tNum);
          setOrderingAllowed(true);
        }
      }

      try {
        const response = await apiService.verifyQRToken(tokenParam);

        if (response.success && response.data?.isActive) {
          const storedToken = sessionStorage.getItem('qr_token');
          if (storedToken !== tokenParam) {
            console.log('🧹 Yeni QR oturumu başlatılıyor, sepet temizleniyor.');
            clearCart();
            localStorage.removeItem('pending_order_id');
            localStorage.removeItem('pending_order_items');
          }

          setTokenValid(true);
          setTokenMessage('QR kod geçerli.');

          if (response.data?.tableNumber) {
            setTableNumber(response.data.tableNumber);
            localStorage.setItem('tableNumber', response.data.tableNumber.toString());
            setOrderingAllowed(true);
          } else {
            setOrderingAllowed(false);
          }

          sessionStorage.setItem('qr_token', tokenParam);

          if (currentRestaurant?.id && response.data?.tableNumber) {
            try {
              const sessionStorageKey = `client_id_${currentRestaurant.id}_${response.data.tableNumber}_${tokenParam}`;
              const existingClientId = sessionStorage.getItem(sessionStorageKey);
              let sessionRes: any = null;
              if (existingClientId) {
                const sessionKey = `${currentRestaurant.id}-${response.data.tableNumber}-${tokenParam}`;
                const sessionInfo = await apiService.getSession(sessionKey, existingClientId);

                if (sessionInfo.success && sessionInfo.data) {
                  setSessionKey(sessionKey);
                  setClientId(existingClientId);
                  setActiveUsersCount(sessionInfo.data.activeUsersCount || 1);
                  sessionStorage.setItem('session_key', sessionKey);
                  sessionStorage.setItem('client_id', existingClientId);

                  if (sessionInfo.data.cart && sessionInfo.data.cart.length > 0) {
                    sessionInfo.data.cart.forEach((item: any) => {
                      addItem({
                        itemId: item.itemId || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        notes: item.notes,
                        preparationTime: item.preparationTime
                      });
                    });
                  }
                } else {
                  sessionRes = await apiService.joinSession(
                    currentRestaurant.id,
                    response.data.tableNumber,
                    tokenParam,
                    existingClientId
                  );

                  if (sessionRes && sessionRes.success && sessionRes.data) {
                    setSessionKey(sessionRes.data.sessionKey);
                    setClientId(sessionRes.data.clientId);
                    setActiveUsersCount(sessionRes.data.activeUsersCount || 1);
                    sessionStorage.setItem('session_key', sessionRes.data.sessionKey);
                    sessionStorage.setItem('client_id', sessionRes.data.clientId);
                    sessionStorage.setItem(sessionStorageKey, sessionRes.data.clientId);
                  }
                }
              } else {
                sessionRes = await apiService.joinSession(
                  currentRestaurant.id,
                  response.data.tableNumber,
                  tokenParam
                );
              }

              if (sessionRes && sessionRes.success && sessionRes.data) {
                setSessionKey(sessionRes.data.sessionKey);
                setClientId(sessionRes.data.clientId);
                setActiveUsersCount(sessionRes.data.activeUsersCount || 1);
                sessionStorage.setItem('session_key', sessionRes.data.sessionKey);
                sessionStorage.setItem('client_id', sessionRes.data.clientId);
                sessionStorage.setItem(sessionStorageKey, sessionRes.data.clientId);
              }
            } catch (error) {
              console.error('Session join hatası:', error);
            }
          }
        } else {
          if (tableParam) {
            try {
              const subdomain = window.location.hostname.split('.')[0];
              const restaurantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/username/${subdomain}`);
              if (restaurantRes.ok) {
                const restaurantData = await restaurantRes.json();
                if (restaurantData.success && restaurantData.data) {
                  const newTokenRes = await apiService.generateQRToken({
                    restaurantId: restaurantData.data.id,
                    tableNumber: parseInt(tableParam),
                    duration: 24
                  });
                  if (newTokenRes.success && newTokenRes.data?.token) {
                    const newUrl = `${window.location.origin}/menu/?token=${newTokenRes.data.token}&table=${tableParam}`;
                    window.history.replaceState({}, '', newUrl);
                    sessionStorage.setItem('qr_token', newTokenRes.data.token);
                    setTokenValid(true);
                    setTableNumber(parseInt(tableParam));
                    localStorage.setItem('tableNumber', tableParam);
                    return;
                  }
                }
              }
            } catch (error) {
              console.error('Yeni token oluşturma hatası:', error);
            }
          }

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
                setTableNumber(parseInt(tableParam));
                localStorage.setItem('tableNumber', tableParam);
              } else {
                setTokenValid(false);
                setTokenMessage('QR kod geçersiz veya süresi dolmuş.');
                return;
              }
            } catch (e) {
              setTokenValid(false);
              setTokenMessage('QR kod doğrulanamadı.');
              return;
            }
          } else {
            setTokenValid(false);
            setTokenMessage('QR kod geçersiz veya süresi dolmuş.');
            return;
          }
        }
      } catch (error) {
        console.error('❌ Token doğrulama hatası:', error);
        // Timeout veya network hatası durumunda bir kez daha denemeye izin ver veya kullanıcıya bildir
        setTokenValid(false);
        setTokenMessage('Sunucuyla bağlantı kurulamadı. Lütfen internetinizi kontrol edip tekrar deneyin.');
        return;
      }
    }

    if (tableParam) {
      const tableNum = parseInt(tableParam);
      if (!isNaN(tableNum) && tableNum > 0) {
        setTableNumber(tableNum);
        localStorage.setItem('tableNumber', tableNum.toString());
        setOrderingAllowed(true);

        if (!tokenParam) {
          const storedToken = sessionStorage.getItem('qr_token');
          if (storedToken) setToken(storedToken);
          try {
            if (currentRestaurant?.id) {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qr/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  restaurantId: currentRestaurant.id,
                  tableNumber: tableNum,
                  duration: 2
                })
              });
              const data = await response.json();
              if (data.success) {
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

  // Immediate token check on mount - independent of restaurant fetch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token') || urlParams.get('t');
      const tableParam = urlParams.get('table');

      if (tokenParam && tableParam) {
        const tNum = parseInt(tableParam);
        if (!isNaN(tNum) && tNum > 0) {
          setTableNumber(tNum);
          setOrderingAllowed(true); // Instant unlock
        }
      } else if (!tableParam) {
        // Eğer URL'de masa numarası yoksa, state'i sıfırla (Genel Menü modu)
        setTableNumber(0);
        setOrderingAllowed(false);
      }
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    setIsClient(true);
    setImageCacheVersion(Date.now());

    const initializeMenu = async () => {
      if (typeof window === 'undefined') return;

      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      const mainDomains = ['localhost', 'www', 'guzellestir', 'restxqr'];
      const targetSubdomain = mainDomains.includes(subdomain) ? 'aksaray' : subdomain;

      // Sadece bu restoranın verilerini fetch et (tüm restoranları değil)
      // Bu işlem kategori ve ürünleri de tek seferde getirir
      const restaurant = await useRestaurantStore.getState().fetchRestaurantByUsername(targetSubdomain);

      if (restaurant?.id) {
        // Token ve seans işlemlerini paralel başlat
        detectTableAndToken();
      }
    };

    initializeMenu();

    try {
      const hasVisited = typeof window !== 'undefined' && sessionStorage.getItem('menuVisitedOnce');
      if (!hasVisited) {
        setShowSplash(true);
        sessionStorage.setItem('menuVisitedOnce', '1');
        // Splash süresini 0.8s'den 0.5s'e düşürerek açılışı hızlandırıyoruz
        setTimeout(() => setShowSplash(false), 500);
      }
    } catch { }
  }, [fetchRestaurants, fetchRestaurantMenu]);

  // Periyodik olarak menüyü yenile (resim güncellemelerini görmek için) - 5 dakikada bir
  useEffect(() => {
    if (!currentRestaurant?.id) return;

    // Her 5 dakikada bir menüyü yenile ve cache versiyonunu güncelle
    const intervalId = setInterval(() => {
      console.log('🔄 Menü periyodik yenileme...');
      fetchRestaurantMenu(currentRestaurant.id).then(() => {
        // Menü yenilendiğinde resim cache versiyonunu güncelle
        setImageCacheVersion(Date.now());
        console.log('✅ Resim cache versiyonu güncellendi');
      });
    }, 300000); // 5 dakika (300 saniye)

    return () => clearInterval(intervalId);
  }, [currentRestaurant?.id, fetchRestaurantMenu]);

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

  // Session cart synchronization - Sepet güncellemelerini session'a gönder
  useEffect(() => {
    if (!sessionKey || !clientId || !currentRestaurant?.id) return;

    // Sepet değiştiğinde session'a gönder
    const syncCartToSession = async () => {
      try {
        const cartData = cartItems.map(item => ({
          id: item.id,
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          notes: item.notes,
          preparationTime: item.preparationTime
        }));

        await apiService.updateSessionCart(sessionKey, cartData, clientId);
      } catch (error) {
        console.error('Sepet senkronizasyon hatası:', error);
      }
    };

    // Debounce: 500ms bekle, sonra gönder
    const timeoutId = setTimeout(syncCartToSession, 500);
    return () => clearTimeout(timeoutId);
  }, [cartItems, sessionKey, clientId, currentRestaurant?.id]);

  // Session'dan sepet güncellemelerini dinle (polling)
  useEffect(() => {
    if (!sessionKey || !clientId) return;

    const pollSession = async () => {
      try {
        const sessionRes = await apiService.getSession(sessionKey, clientId);
        if (sessionRes.success && sessionRes.data) {
          // Aktif kullanıcı sayısını güncelle
          setActiveUsersCount(sessionRes.data.activeUsersCount || 1);

          // Sepet güncellemelerini kontrol et ve senkronize et
          if (sessionRes.data.cart && Array.isArray(sessionRes.data.cart)) {
            const sessionCart = sessionRes.data.cart;
            const currentCart = cartItems;

            // Sepet farklıysa güncelle (başka bir kullanıcı eklemiş/çıkarmış olabilir)
            const sessionCartNormalized = sessionCart.map((item: any) => ({
              itemId: item.itemId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })).sort((a: any, b: any) => (a.itemId || '').localeCompare(b.itemId || ''));

            const currentCartNormalized = currentCart.map(item => ({
              itemId: item.itemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })).sort((a, b) => (a.itemId || '').localeCompare(b.itemId || ''));

            if (JSON.stringify(sessionCartNormalized) !== JSON.stringify(currentCartNormalized)) {
              // Session'dan gelen sepeti yükle (tüm kullanıcılar aynı sepeti görsün)
              clearCart();
              sessionCart.forEach((item: any) => {
                addItem({
                  itemId: item.itemId || item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                  notes: item.notes,
                  preparationTime: item.preparationTime
                });
              });
              console.log('🔄 Sepet session\'dan senkronize edildi:', sessionCart.length, 'ürün');
            }
          }
        }
      } catch (error) {
        console.error('Session polling hatası:', error);
      }
    };

    // Her 2 saniyede bir session'ı kontrol et
    const intervalId = setInterval(pollSession, 2000);
    return () => clearInterval(intervalId);
  }, [sessionKey, clientId, cartItems]);

  // Component unmount olduğunda session'dan ayrıl
  useEffect(() => {
    return () => {
      if (sessionKey && clientId) {
        apiService.leaveSession(sessionKey, clientId).catch(console.error);
      }
    };
  }, [sessionKey, clientId]);

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
  const language = currentLanguage === 'Turkish' ? 'tr' : (currentLanguage === 'German' ? 'de' : (currentLanguage === 'Chinese' ? 'zh' : (currentLanguage === 'English' ? 'en' : 'en')));

  // Get menu categories (backend format)
  const menuCategories = [

    {
      id: 'popular',
      name: currentLanguage === 'Turkish' ? 'Beğenilenler' : (currentLanguage === 'German' ? 'Favoriten' : (currentLanguage === 'Chinese' ? '最爱' : 'Favorites')),
      discountPercentage: undefined,
      discountStartDate: undefined,
      discountEndDate: undefined
    },
    ...filteredCategories.map((cat: any) => ({
      id: cat.id,
      name: typeof cat.name === 'string' ? cat.name : (cat.name?.[language] || cat.name?.tr || cat.name?.en || 'Kategori'),
      discountPercentage: cat.discountPercentage,
      discountStartDate: cat.discountStartDate,
      discountEndDate: cat.discountEndDate
    }))
  ];

  // Price Calculation Helper
  const getDiscountedPrice = (item: any) => {
    const now = new Date();

    // 1. Check Item Discount
    if (item.discountedPrice || item.discountPercentage) {
      const start = item.discountStartDate ? new Date(item.discountStartDate) : null;
      const end = item.discountEndDate ? new Date(item.discountEndDate) : null;

      if ((!start || now >= start) && (!end || now <= end)) {
        if (item.discountedPrice) return parseFloat(item.discountedPrice);
        if (item.discountPercentage) return item.price * (1 - item.discountPercentage / 100);
      }
    }

    // 2. Check Category Discount
    const category = menuCategories.find(c => c.id === item.categoryId);
    if (category?.discountPercentage) {
      const start = category.discountStartDate ? new Date(category.discountStartDate) : null;
      const end = category.discountEndDate ? new Date(category.discountEndDate) : null;

      if ((!start || now >= start) && (!end || now <= end)) {
        return item.price * (1 - category.discountPercentage / 100);
      }
    }

    return item.price;
  };


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
      const itemName = item.translations?.[language]?.name || (typeof item.name === 'string' ? item.name : (item.name?.[language] || item.name?.tr || item.name?.en || ''));
      const itemDesc = item.translations?.[language]?.description || (typeof item.description === 'string' ? item.description : (item.description?.[language] || item.description?.tr || item.description?.en || ''));
      return itemName.toLowerCase().includes(search.toLowerCase()) ||
        itemDesc.toLowerCase().includes(search.toLowerCase());
    });
  }

  // Event handlers
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 180; // Adjust for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSubcategoryChange = (subcategoryId: string | null) => {
    setActiveSubcategory(subcategoryId);
  };

  const addToCart = (item: any) => {
    try {
      // Image URL resolution logic from render loop
      let imageUrl = item.image;
      if (item.imageUrl) {
        if (item.imageUrl.startsWith('http')) {
          imageUrl = item.imageUrl;
        } else if (item.imageUrl.startsWith('/uploads/')) {
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
          imageUrl = `${baseUrl}${item.imageUrl}`;
        } else {
          imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`;
        }
      }

      const cartItem = {
        itemId: item.id,
        name: item.name,
        price: getDiscountedPrice(item),
        quantity: 1,
        image: imageUrl,
        preparationTime: item.preparationTime
      };

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

  const MenuSkeleton = () => (
    <div className="container mx-auto px-3 py-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-sm border p-3 flex mb-3">
          <div className="h-20 w-20 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="ml-3 flex-grow">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="flex justify-between items-center mt-3">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
              {(() => {
                const isKroren = typeof window !== 'undefined' && window.location.hostname.includes('kroren');
                const logo = isKroren ? '/Kroren_Logo.png' : settings?.branding?.logo;
                return logo ? (
                  <img src={logo} alt="Logo" className="h-20 w-20 object-contain rounded-md shadow-sm" />
                ) : (
                  <div className="h-20 w-20 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {(settings?.basicInfo?.name || 'Işletme').slice(0, 1)}
                  </div>
                );
              })()}
            </div>
            <div className="text-dynamic-xl font-bold text-gray-900">{settings?.basicInfo?.name || 'İşletme'}</div>
            {settings?.branding?.showSloganOnLoading !== false && settings?.basicInfo?.slogan && (
              <div className="text-dynamic-sm text-gray-600 mt-1">{settings?.basicInfo?.slogan}</div>
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
        {/* Sipariş verme modu banner'ı kaldırıldı user isteği üzerine */}

        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-dynamic-lg font-bold text-primary">
                <TranslatedText>Menü</TranslatedText>
              </h1>
              <div className="ml-2 flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'var(--tone1-bg)', color: 'var(--tone1-text)', border: '1px solid var(--tone1-border)' }}>
                  {tableNumber > 0 ? (
                    <>
                      {currentRestaurant?.name || 'Restoran'} <TranslatedText>Masa</TranslatedText> {tableNumber}
                    </>
                  ) : (
                    <TranslatedText>Genel Menü</TranslatedText>
                  )}
                </div>
                {tableNumber > 0 && activeUsersCount > 1 && (
                  <div className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                    <FaUsers className="text-xs" />
                    <span>{activeUsersCount} kişi</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector enabledLanguages={settings?.menuSettings?.language} />
              {orderingAllowed ? (
                <Link href={`/cart?token=${token}&table=${tableNumber}`} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaShoppingCart className="text-xl" style={{ color: primary }} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: primary }}>
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              ) : (
                <div className="relative p-2 rounded-lg cursor-not-allowed">
                  <FaShoppingCart className="text-xl text-gray-400" />
                  <span className="absolute top-0 right-0 w-full h-full flex items-center justify-center text-red-500 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                    </svg>
                  </span>
                </div>
              )}
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
            <div
              className="flex animate-dynamic-slide"
              style={{
                width: `${Math.max((settings?.basicInfo?.menuSpecialContents?.length || 2), 2) * 100}%`
              }}
            >
              {(settings?.basicInfo?.menuSpecialContents?.length > 0) ? (
                (settings?.basicInfo?.menuSpecialContents || []).map((content: any, idx: number) => (
                  <div key={content.id || idx} className="w-full text-white p-3 bg-brand-gradient">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{content.emoji || '🎉'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm line-clamp-1">
                          <TranslatedText>{content.title}</TranslatedText>
                        </div>
                        <div className="text-xs opacity-90 line-clamp-2">
                          <TranslatedText>{content.description}</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="w-full text-white p-3 bg-brand-gradient">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🎉</span>
                      <div>
                        <div className="font-semibold text-sm">
                          <TranslatedText>{settings?.basicInfo?.dailySpecialTitle || 'Bugüne Özel!'}</TranslatedText>
                        </div>
                        <div className="text-xs opacity-90">
                          <TranslatedText>{settings?.basicInfo?.dailySpecialDesc || 'Tüm tatlılarda %20 indirim - Sadece bugün geçerli'}</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full text-white p-3 bg-brand-gradient">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🍲</span>
                      <div>
                        <div className="font-semibold text-sm">
                          <TranslatedText>{settings?.basicInfo?.soupOfDayTitle || 'Günün Çorbası'}</TranslatedText>
                        </div>
                        <div className="text-xs opacity-90">
                          <TranslatedText>{settings?.basicInfo?.soupOfDayDesc || 'Ezogelin çorbası - Ev yapımı lezzet'}</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes dynamic-slide {
            ${(() => {
            const contents = settings?.basicInfo?.menuSpecialContents || [];
            const count = Math.max(contents.length || 2, 2);
            if (count <= 1) return '0% { transform: translateX(0); } 100% { transform: translateX(0); }';

            let keyframes = '';
            const step = 100 / count;
            for (let i = 0; i < count; i++) {
              const start = i * step;
              const end = (i + 1) * step - 5; // Stay for most of the time
              const nextStart = (i + 1) * step;

              keyframes += `${start}%, ${end}% { transform: translateX(-${(i * 100) / count}%); }\n`;
            }
            keyframes += `100% { transform: translateX(0); }`;
            return keyframes;
          })()}
          }
          .animate-dynamic-slide {
            animation: dynamic-slide ${Math.max((settings?.basicInfo?.menuSpecialContents?.length || 2), 2) * 4}s infinite ease-in-out;
          }
        `}</style>

        {/* Categories */}
        <div className="pb-2 overflow-x-auto max-w-full">
          <div className="flex px-3 space-x-2 min-w-max max-w-full">
            {loading && menuCategories.length === 0 ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="px-3 py-1.5 rounded-full bg-gray-200 w-20 h-8 animate-pulse" />
              ))
            ) : (
              menuCategories.map((category) => (
                <button
                  key={category.id}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-dynamic-sm ${activeCategory === category.id
                    ? 'btn-gradient'
                    : 'bg-brand-surface text-gray-700'
                    }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Subcategories - Backend'de subcategory yok, bu kısım kaldırıldı */}

        {/* Menu Items */}
        {/* Vertical Menu List */}
        <div className="pb-24 px-3 space-y-8">
          {menuCategories.map((category) => {
            if (category.id === 'popular' && search.trim() !== '') return null; // Hide popular during search

            // Get items for this category
            let categoryItems = [];
            if (category.id === 'popular') {
              categoryItems = getPopularItems();
            } else {
              categoryItems = getItemsByCategory(category.id);
            }

            // Apply search filter if exists
            if (search.trim() !== '') {
              categoryItems = categoryItems.filter((item: any) => {
                const itemName = item.translations?.[language]?.name || (typeof item.name === 'string' ? item.name : (item.name?.[language] || item.name?.tr || item.name?.en || ''));
                const itemDesc = item.translations?.[language]?.description || (typeof item.description === 'string' ? item.description : (item.description?.[language] || item.description?.tr || item.description?.en || ''));
                return itemName.toLowerCase().includes(search.toLowerCase()) ||
                  itemDesc.toLowerCase().includes(search.toLowerCase());
              });
            }

            // Access currentRestaurant.designSettings safely
            const designSettings = currentRestaurant?.designSettings;

            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} id={`category-${category.id}`} className="scroll-mt-40">
                <div className="flex items-center gap-3 mb-4 sticky top-[170px] z-10 py-2 -mx-3 px-3 backdrop-blur-md bg-white/80 border-b border-gray-100/50 shadow-sm transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-800 border-l-4 pl-3"
                    style={{
                      borderColor: designSettings?.primaryColor || 'var(--brand-primary)',
                      color: designSettings?.primaryColor || 'var(--brand-primary)'
                    }}>
                    {category.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {categoryItems.map((item: any) => {
                    // Image URL resolution
                    let imageUrl = item.image;
                    if (item.imageUrl) {
                      if (item.imageUrl.startsWith('http')) {
                        imageUrl = `${item.imageUrl}${item.imageUrl.includes('?') ? '&' : '?'}v=${imageCacheVersion}`;
                      } else if (item.imageUrl.startsWith('/uploads/')) {
                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api').replace('/api', '');
                        imageUrl = `${baseUrl}${item.imageUrl}${item.imageUrl.includes('?') ? '&' : '?'}v=${imageCacheVersion}`;
                      } else {
                        imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}${item.imageUrl.includes('?') ? '&' : '?'}v=${imageCacheVersion}`;
                      }
                    } else {
                      imageUrl = '/placeholder-food.jpg';
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => openModal(item)}
                        className="bg-white rounded-lg shadow-sm border p-3 flex max-w-full cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                      >
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={typeof item.name === 'string' ? item.name : (item.name?.[language] || item.name?.tr || item.name?.en || 'Menu item')}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full rounded-lg"
                            unoptimized={!item.imageUrl}
                          />
                          {item.isPopular && (
                            <div className="absolute top-0 left-0 text-white text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--brand-strong)' }}>
                              <FaStar className="inline-block mr-1" size={8} />
                              <TranslatedText>Popüler</TranslatedText>
                            </div>
                          )}
                          {/* Add Button Overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!orderingAllowed) {
                                alert('Sipariş vermek için lütfen QR kodu tekrar okutunuz.');
                                return;
                              }
                              addToCart(item);
                            }}
                            disabled={!orderingAllowed}
                            className={`absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all z-10 ${orderingAllowed
                              ? 'bg-white text-black'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            style={orderingAllowed ? { color: designSettings?.primaryColor || 'var(--brand-primary)' } : {}}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        <div className="ml-3 flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-dynamic-sm truncate">
                                {item.translations?.[language]?.name || (typeof item.name === 'string' ? item.name : (item.name?.[language] || item.name?.tr || item.name?.en || 'Ürün'))}
                              </h3>
                              <div className="flex flex-col items-end">
                                {getDiscountedPrice(item) < item.price ? (
                                  <>
                                    <span className="font-bold text-red-600 text-dynamic-sm flex-shrink-0 ml-2">
                                      {parseFloat(getDiscountedPrice(item).toFixed(2))} ₺
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                      {item.price} ₺
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-dynamic-sm flex-shrink-0 ml-2" style={{ color: designSettings?.primaryColor || 'var(--brand-primary)' }}>
                                    {item.price} ₺
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2 break-words">
                              {item.translations?.[language]?.description || (typeof item.description === 'string' ? item.description : (item.description?.[language] || item.description?.tr || item.description?.en || ''))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sabit Duyurular */}
        <div className="container mx-auto px-3 py-4 mb-20">
          <div className="rounded-xl p-5 shadow-lg border bg-white">
            <div className="grid grid-cols-1 gap-3">
              {/* WiFi Info */}
              {settings?.basicInfo?.showWifiInMenu && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📶</span>
                    <span className="text-sm font-medium text-gray-700">
                      <TranslatedText>WiFi Şifresi</TranslatedText>
                    </span>
                  </div>
                  <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: 'var(--brand-strong)', backgroundColor: 'var(--brand-surface)' }}>
                    {settings?.basicInfo?.wifiPassword || 'restoran2024'}
                  </span>
                </div>
              )}
              {/* Google Review Button - Desktop/Tablet */}
              {settings?.basicInfo?.showReviewInMenu && settings?.basicInfo?.googleReviewLink && (
                <div className="hidden sm:block">
                  <a
                    href={settings?.basicInfo?.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-white hover:bg-gray-50"
                    style={{ textDecoration: 'none', borderLeftColor: 'var(--brand-primary)' }}
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
                </div>
              )}

              {/* Google Review Button - Mobile (Special Design) */}
              {settings?.basicInfo?.showReviewInMenu && settings?.basicInfo?.googleReviewLink && (
                <div className="block sm:hidden my-4">
                  <a
                    href={settings?.basicInfo?.googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative overflow-hidden block rounded-xl shadow-lg transform transition active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 z-0"></div>
                    <div className="absolute -right-6 -top-6 bg-white opacity-10 rounded-full w-24 h-24 z-0"></div>
                    <div className="absolute -left-6 -bottom-6 bg-white opacity-10 rounded-full w-20 h-20 z-0"></div>

                    <div className="relative z-10 p-4 flex items-center justify-between text-white">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">⭐</span>
                          <span className="font-bold text-lg"><TranslatedText>Bizi Değerlendir!</TranslatedText></span>
                        </div>
                        <span className="text-xs opacity-90"><TranslatedText>Deneyimini Google'da paylaş</TranslatedText></span>
                      </div>
                      <div className="bg-white text-blue-600 rounded-full p-2 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                </div>
              )}
              {/* Working Hours */}
              {settings?.basicInfo?.showHoursInMenu && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-subtle)' }}>
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🕒</span>
                    <span className="text-sm font-medium text-gray-700">
                      <TranslatedText>Çalışma Saatleri</TranslatedText>
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--brand-strong)' }}>
                    {settings?.basicInfo?.workingHours || '09:00 - 23:00'}
                  </span>
                </div>
              )}
              {/* Instagram Button */}
              {settings?.basicInfo?.showInstagramInMenu && (
                <a
                  href={settings?.basicInfo?.instagram || "https://instagram.com/restoranadi"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 transition group bg-white hover:bg-gray-50"
                  style={{ textDecoration: 'none', borderLeftColor: '#E1306C' }}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📱</span>
                    <span className="text-sm font-medium text-gray-800">
                      <TranslatedText>Instagram'da Takip Et</TranslatedText>
                    </span>
                  </div>
                  <button className="text-sm font-bold px-3 py-1 rounded-lg shadow group-hover:scale-105 transition btn-primary">
                    @{settings?.basicInfo?.instagram?.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '') || 'restoranadi'}
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg z-30">
          <div className="container mx-auto flex justify-around max-w-full px-2">
            <Link href={`/menu?token=${token}&table=${tableNumber}`} className="flex flex-col items-center" style={{ color: primary }}>
              <FaUtensils className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
            </Link>
            {orderingAllowed ? (
              <Link href={`/cart?token=${token}&table=${tableNumber}`} className="flex flex-col items-center" style={{ color: primary }}>
                <div className="relative">
                  <FaShoppingCart className="mb-0.5" size={16} />
                  {isClient && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center" style={{ backgroundColor: primary }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]"><TranslatedText>Sepet</TranslatedText></span>
              </Link>
            ) : (
              <div className="flex flex-col items-center text-gray-400 cursor-not-allowed">
                <div className="relative">
                  <FaShoppingCart className="mb-0.5" size={16} />
                  <span className="absolute top-0 right-0 w-full h-full flex items-center justify-center text-red-500 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                    </svg>
                  </span>
                </div>
                <span className="text-[10px]"><TranslatedText>Kapalı</TranslatedText></span>
              </div>
            )}
            {orderingAllowed ? (
              <Link href={`/garson-cagir?token=${token}&table=${tableNumber}`} className="flex flex-col items-center" style={{ color: primary }}>
                <FaBell className="mb-0.5" size={16} />
                <span className="text-[10px]"><TranslatedText>Garson Çağır</TranslatedText></span>
              </Link>
            ) : (
              <div className="flex flex-col items-center text-gray-400 cursor-not-allowed">
                <div className="relative">
                  <FaBell className="mb-0.5" size={16} />
                  <span className="absolute top-0 right-0 w-full h-full flex items-center justify-center text-red-500 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                    </svg>
                  </span>
                </div>
                <span className="text-[10px]"><TranslatedText>Kapalı</TranslatedText></span>
              </div>
            )}
          </div>
        </nav>
      </main>

      {/* Menu Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={closeModal}
          imageCacheVersion={imageCacheVersion}
        />
      )}

      {/* Campaign Banner Modal */}
      {activeBanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-transparent max-w-md w-full animate-scaleIn">
            <button
              onClick={closeBanner}
              className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
              <FaTimes size={24} />
            </button>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={activeBanner.imageUrl}
                alt="Campaign"
                className="w-full h-auto max-h-[70vh] object-contain bg-white"
              />
            </div>
          </div>
        </div>
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
