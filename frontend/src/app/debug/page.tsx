'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaPlay, FaCheckCircle, FaExclamationTriangle, FaSync, FaList, FaShoppingCart, FaBell, FaUtensils, FaCreditCard } from 'react-icons/fa';
import useRealtime from '@/hooks/useRealtime';

interface DebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export default function DebugPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [tableNumber, setTableNumber] = useState(5);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [kitchenApiStatus, setKitchenApiStatus] = useState<any>(null);
  const [cashierApiStatus, setCashierApiStatus] = useState<any>(null);
  const [panelLoginStatus, setPanelLoginStatus] = useState<any>({});

  // Real-time bildirim izleme
  const { isConnected } = useRealtime({
    onEvent: (event) => {
      const timestamp = new Date().toLocaleTimeString();
      const logMessage = `[${timestamp}] Real-time event alındı: ${event.type}`;
      
      addDetailedLog('Real-time Event', logMessage, event);
      setRealtimeEvents(prev => [{ ...event, timestamp }, ...prev.slice(0, 9)]); // Son 10 eventi tut
      
      if (event.type === 'new_order') {
        addResult('Real-time Bildirim', true, 'Yeni sipariş bildirimi alındı!', event.data);
      }
    },
    onConnect: () => {
      setIsRealtimeConnected(true);
      addDetailedLog('Real-time Bağlantı', 'SSE bağlantısı kuruldu');
      addResult('Real-time Bağlantı', true, 'Real-time bildirim sistemi aktif!');
    },
    onDisconnect: () => {
      setIsRealtimeConnected(false);
      addDetailedLog('Real-time Bağlantı', 'SSE bağlantısı kesildi');
      addResult('Real-time Bağlantı', false, 'Real-time bildirim sistemi bağlantısı kesildi');
    }
  });

  const addResult = (step: string, success: boolean, message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`🐛 DEBUG: ${step} - ${logMessage}`, data);
    setResults(prev => [...prev, { step, success, message: logMessage, data }]);
  };

  const addDetailedLog = (step: string, details: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${details}`;
    console.log(`📋 DETAIL: ${step} - ${logMessage}`, data);
    setResults(prev => [...prev, { step, success: true, message: logMessage, data }]);
  };

  // Menüyü yükle
  const loadMenu = async () => {
    setIsLoadingMenu(true);
    addDetailedLog('Menü Yükleme', 'Aksaray restoranının menüsü çekiliyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      addDetailedLog('API URL', `API URL: ${apiUrl}`);
      
      // Restoranları çek
      const restaurantResponse = await fetch(`${apiUrl}/restaurants`);
      addDetailedLog('Restoran Yanıtı', `Status: ${restaurantResponse.status}`);
      
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        addDetailedLog('Restoran Verisi', `Restoranlar çekildi`, restaurantData);
        
        // Aksaray restoranını bul
        const aksarayRestaurant = restaurantData.data?.find((r: any) => r.username === 'aksaray');
        addDetailedLog('Aksaray Restoran', `Aksaray restoran bulundu`, aksarayRestaurant);
        
        if (aksarayRestaurant) {
          // Menüyü çek
          const menuResponse = await fetch(`${apiUrl}/restaurants/${aksarayRestaurant.id}/menu`);
          addDetailedLog('Menü Yanıtı', `Status: ${menuResponse.status}`);
          
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            addDetailedLog('Menü Verisi', `Menü başarıyla çekildi`, menuData);
            
            if (menuData.success && menuData.data) {
              const allItems = menuData.data.categories?.flatMap((category: any) => 
                category.items?.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  description: item.description || '',
                  category: category.name
                })) || []
              ) || [];
              
              setRestaurantMenu(allItems);
              addDetailedLog('Menü İşlendi', `${allItems.length} ürün bulundu`, allItems);
            }
          } else {
            const errorText = await menuResponse.text();
            addDetailedLog('Menü Hatası', `Menü çekilemedi`, errorText);
          }
        } else {
          addDetailedLog('Restoran Bulunamadı', `Aksaray restoran bulunamadı`);
        }
      } else {
        const errorText = await restaurantResponse.text();
        addDetailedLog('Restoran Hatası', `Restoranlar çekilemedi`, errorText);
      }
    } catch (error: any) {
      addDetailedLog('Menü Exception', `Menü çekme hatası`, error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Mutfak paneli API test et
  const testKitchenAPI = async () => {
    addDetailedLog('Mutfak API Test', 'Mutfak paneli API endpoint\'i test ediliyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Önce restoran ID'sini bul
      const restaurantResponse = await fetch(`${apiUrl}/restaurants`);
      if (!restaurantResponse.ok) {
        setKitchenApiStatus({ success: false, error: 'Restoran listesi alınamadı' });
        return;
      }
      
      const restaurantData = await restaurantResponse.json();
      const aksarayRestaurant = restaurantData.data?.find((r: any) => r.username === 'aksaray');
      
      if (!aksarayRestaurant) {
        setKitchenApiStatus({ success: false, error: 'Aksaray restoranı bulunamadı' });
        return;
      }
      
      // Mutfak panelinin çektiği endpoint'i test et
      const ordersResponse = await fetch(`${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`);
      addDetailedLog('Mutfak API Yanıt', `Status: ${ordersResponse.status}`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        addDetailedLog('Mutfak API Veri', `Pending siparişler`, ordersData);
        
        setKitchenApiStatus({ 
          success: true, 
          endpoint: `${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`,
          orderCount: ordersData.data?.length || 0,
          data: ordersData
        });
        addResult('Mutfak API Test', true, `Mutfak API çalışıyor! ${ordersData.data?.length || 0} pending sipariş bulundu`);
      } else {
        const errorText = await ordersResponse.text();
        setKitchenApiStatus({ 
          success: false, 
          endpoint: `${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`,
          error: errorText 
        });
        addResult('Mutfak API Test', false, `Mutfak API hatası: ${ordersResponse.status}`);
      }
    } catch (error: any) {
      setKitchenApiStatus({ success: false, error: error.message });
      addResult('Mutfak API Test', false, `Mutfak API test hatası: ${error.message}`);
    }
  };

  // Kasa paneli API test et
  const testCashierAPI = async () => {
    addDetailedLog('Kasa API Test', 'Kasa paneli API endpoint\'i test ediliyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Önce restoran ID'sini bul
      const restaurantResponse = await fetch(`${apiUrl}/restaurants`);
      if (!restaurantResponse.ok) {
        setCashierApiStatus({ success: false, error: 'Restoran listesi alınamadı' });
        return;
      }
      
      const restaurantData = await restaurantResponse.json();
      const aksarayRestaurant = restaurantData.data?.find((r: any) => r.username === 'aksaray');
      
      if (!aksarayRestaurant) {
        setCashierApiStatus({ success: false, error: 'Aksaray restoranı bulunamadı' });
        return;
      }
      
      // Kasa panelinin çektiği endpoint'i test et
      const ordersResponse = await fetch(`${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`);
      addDetailedLog('Kasa API Yanıt', `Status: ${ordersResponse.status}`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        addDetailedLog('Kasa API Veri', `Pending siparişler`, ordersData);
        
        setCashierApiStatus({ 
          success: true, 
          endpoint: `${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`,
          orderCount: ordersData.data?.length || 0,
          data: ordersData
        });
        addResult('Kasa API Test', true, `Kasa API çalışıyor! ${ordersData.data?.length || 0} pending sipariş bulundu`);
      } else {
        const errorText = await ordersResponse.text();
        setCashierApiStatus({ 
          success: false, 
          endpoint: `${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`,
          error: errorText 
        });
        addResult('Kasa API Test', false, `Kasa API hatası: ${ordersResponse.status}`);
      }
    } catch (error: any) {
      setCashierApiStatus({ success: false, error: error.message });
      addResult('Kasa API Test', false, `Kasa API test hatası: ${error.message}`);
    }
  };

  // Panel login durumu kontrol et
  const checkPanelLoginStatus = () => {
    addDetailedLog('Panel Login Kontrol', 'Panel login durumları kontrol ediliyor...');
    
    // Tüm storage key'lerini listele
    const allLocalStorageKeys = Object.keys(localStorage);
    const allSessionStorageKeys = Object.keys(sessionStorage);
    
    addDetailedLog('LocalStorage Keys', `Mevcut localStorage key'leri: ${allLocalStorageKeys.join(', ')}`, allLocalStorageKeys);
    addDetailedLog('SessionStorage Keys', `Mevcut sessionStorage key'leri: ${allSessionStorageKeys.join(', ')}`, allSessionStorageKeys);
    
    // Farklı key kombinasyonlarını dene
    const possibleKitchenKeys = ['kitchen_staff', 'kitchen_staff_info', 'staff_info', 'user', 'auth'];
    const possibleCashierKeys = ['cashier_staff', 'cashier_staff_info', 'staff_info', 'user', 'auth'];
    
    let kitchenLogin = null;
    let kitchenKey = '';
    for (const key of possibleKitchenKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        kitchenLogin = value;
        kitchenKey = key;
        break;
      }
    }
    
    let cashierLogin = null;
    let cashierKey = '';
    for (const key of possibleCashierKeys) {
      const value = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (value) {
        cashierLogin = value;
        cashierKey = key;
        break;
      }
    }
    
    addDetailedLog('Bulunan Keys', `Mutfak key: ${kitchenKey || 'YOK'}, Kasa key: ${cashierKey || 'YOK'}`);
    
    const status = {
      kitchen: {
        isLoggedIn: !!kitchenLogin,
        staffInfo: kitchenLogin ? JSON.parse(kitchenLogin) : null,
        storageKey: kitchenKey
      },
      cashier: {
        isLoggedIn: !!cashierLogin,
        staffInfo: cashierLogin ? JSON.parse(cashierLogin) : null,
        storageKey: cashierKey
      }
    };
    
    setPanelLoginStatus(status);
    
    addDetailedLog('Mutfak Login', `Mutfak paneli login durumu: ${status.kitchen.isLoggedIn ? 'Giriş yapılmış' : 'Giriş yapılmamış'} (Key: ${kitchenKey})`, status.kitchen.staffInfo);
    addDetailedLog('Kasa Login', `Kasa paneli login durumu: ${status.cashier.isLoggedIn ? 'Giriş yapılmış' : 'Giriş yapılmamış'} (Key: ${cashierKey})`, status.cashier.staffInfo);
    
    if (!status.kitchen.isLoggedIn) {
      addResult('Panel Login Kontrol', false, 'Mutfak paneline giriş yapılmamış! Bu yüzden siparişler görünmüyor.');
    }
    if (!status.cashier.isLoggedIn) {
      addResult('Panel Login Kontrol', false, 'Kasa paneline giriş yapılmamış! Bu yüzden siparişler görünmüyor.');
    }
    if (status.kitchen.isLoggedIn && status.cashier.isLoggedIn) {
      addResult('Panel Login Kontrol', true, 'Her iki panele de giriş yapılmış. Siparişler görünmeli.');
    }
  };

  // Otomatik login yap (test için)
  const autoLoginPanels = async () => {
    addDetailedLog('Otomatik Login', 'Test için panellere otomatik login yapılıyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Mutfak paneli için login (portakal / 123456)
      addDetailedLog('Mutfak Login', 'Mutfak paneli için login yapılıyor (portakal / 123456)...');
      
      const kitchenLoginResponse = await fetch(`${apiUrl}/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'portakal',
          password: '123456',
          subdomain: 'aksaray'
        }),
      });
      
      if (kitchenLoginResponse.ok) {
        const kitchenData = await kitchenLoginResponse.json();
        addDetailedLog('Mutfak Login Başarılı', `Mutfak login başarılı`, kitchenData);
        
        // Mutfak staff bilgisini localStorage'a kaydet
        const kitchenStaffInfo = {
          id: kitchenData.data?.id || 'kitchen_staff_1',
          username: 'portakal',
          role: 'kitchen',
          restaurantId: 'aksaray',
          name: 'Mutfak Personeli',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('kitchen_staff', JSON.stringify(kitchenStaffInfo));
        addDetailedLog('Mutfak Storage', `Mutfak staff bilgisi localStorage'a kaydedildi`, kitchenStaffInfo);
        
        addResult('Mutfak Otomatik Login', true, 'Mutfak paneline otomatik login başarılı!');
      } else {
        const errorText = await kitchenLoginResponse.text();
        addDetailedLog('Mutfak Login Hatası', `Mutfak login başarısız`, errorText);
        addResult('Mutfak Otomatik Login', false, `Mutfak login hatası: ${kitchenLoginResponse.status}`);
      }
      
      // Kasa paneli için login (armut / 123456)
      addDetailedLog('Kasa Login', 'Kasa paneli için login yapılıyor (armut / 123456)...');
      
      const cashierLoginResponse = await fetch(`${apiUrl}/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'armut',
          password: '123456',
          subdomain: 'aksaray'
        }),
      });
      
      if (cashierLoginResponse.ok) {
        const cashierData = await cashierLoginResponse.json();
        addDetailedLog('Kasa Login Başarılı', `Kasa login başarılı`, cashierData);
        
        // Kasa staff bilgisini sessionStorage'a kaydet
        const cashierStaffInfo = {
          id: cashierData.data?.id || 'cashier_staff_1',
          username: 'armut',
          role: 'cashier',
          restaurantId: 'aksaray',
          name: 'Kasa Personeli',
          loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('cashier_staff', JSON.stringify(cashierStaffInfo));
        addDetailedLog('Kasa Storage', `Kasa staff bilgisi sessionStorage'a kaydedildi`, cashierStaffInfo);
        
        addResult('Kasa Otomatik Login', true, 'Kasa paneline otomatik login başarılı!');
      } else {
        const errorText = await cashierLoginResponse.text();
        addDetailedLog('Kasa Login Hatası', `Kasa login başarısız`, errorText);
        addResult('Kasa Otomatik Login', false, `Kasa login hatası: ${cashierLoginResponse.status}`);
      }
      
      // Login durumunu tekrar kontrol et
      setTimeout(() => {
        checkPanelLoginStatus();
      }, 1000);
      
    } catch (error: any) {
      addDetailedLog('Otomatik Login Exception', `Otomatik login hatası`, error);
      addResult('Otomatik Login', false, `Otomatik login hatası: ${error.message}`);
    }
  };

  // API çalışıyor mu test et
  const testAPI = async () => {
    addDetailedLog('API Test', 'API bağlantısı test ediliyor...');
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://masapp-backend.onrender.com';
      const healthResponse = await fetch(`${baseUrl}/health`);
      addDetailedLog('Health Check', `Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addDetailedLog('Health Data', `API çalışıyor`, healthData);
        addResult('API Test', true, 'API bağlantısı başarılı!');
      } else {
        addDetailedLog('Health Hatası', `API çalışmıyor`, await healthResponse.text());
        addResult('API Test', false, 'API bağlantısı başarısız!');
      }
    } catch (error: any) {
      addDetailedLog('API Exception', `API test hatası`, error);
      addResult('API Test', false, `API test hatası: ${error.message}`);
    }
  };

  // Test siparişi oluştur (hızlı test için)
  const createTestOrder = async () => {
    setIsRunning(true);
    addDetailedLog('Test Siparişi', 'Hızlı test siparişi oluşturuluyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      // Test ürünleri (gerçek menüden ilk 2 ürünü al)
      const testItems = restaurantMenu.slice(0, 2);
      
      if (testItems.length === 0) {
        addResult('Test Siparişi', false, 'Menü yüklenmedi, önce menüyü yükleyin!');
        setIsRunning(false);
        return;
      }
      
      const orderPayload = {
        restaurantId: 'aksaray',
        tableNumber: 99, // Test masası
        items: testItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          price: item.price,
          notes: `Test siparişi - ${item.category}`
        })),
        notes: `Hızlı test siparişi - ${new Date().toLocaleTimeString()}`,
        orderType: 'dine_in'
      };

      addDetailedLog('Test Sipariş Payload', `Test sipariş verisi`, orderPayload);
      
      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      addDetailedLog('Test Sipariş Yanıtı', `Status: ${orderResponse.status} ${orderResponse.statusText}`);
      
      const orderResult = await orderResponse.json();
      addDetailedLog('Test Sipariş Sonucu', `API'den dönen veri`, orderResult);
      
      if (orderResult.success) {
        addResult('Test Siparişi', true, `Test siparişi başarıyla oluşturuldu! ID: ${orderResult.data.id}`, orderResult.data);
        
        // Mutfak paneline bildirim gönder
        addDetailedLog('Test Mutfak Bildirimi', 'Mutfak paneline test bildirimi gönderiliyor...');
        
        try {
          const notificationPayload = {
            eventType: 'new_order',
            data: {
              orderId: orderResult.data.id,
              restaurantId: 'aksaray',
              tableNumber: 99,
              items: testItems.map(item => ({
                name: item.name,
                quantity: 1,
                notes: `Test siparişi - ${item.category}`
              })),
              totalAmount: testItems.reduce((sum, item) => sum + item.price, 0),
              timestamp: new Date().toISOString()
            }
          };
          
          addDetailedLog('Bildirim Payload', `Gönderilecek bildirim verisi`, notificationPayload);
          
          const notificationResponse = await fetch(`${apiUrl}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload),
          });

          addDetailedLog('Test Bildirim Yanıtı', `Status: ${notificationResponse.status}`);
          
          const notificationResult = await notificationResponse.json();
          addDetailedLog('Test Bildirim Sonucu', `API'den dönen veri`, notificationResult);
          
          if (notificationResponse.ok) {
            addResult('Test Mutfak Bildirimi', true, 'Mutfak paneline test bildirimi gönderildi!', notificationResult);
          } else {
            addResult('Test Mutfak Bildirimi', false, `Test bildirimi gönderilemedi: ${notificationResult.message}`, notificationResult);
          }
        } catch (error: any) {
          addDetailedLog('Test Bildirim Exception', `Test bildirim hatası`, error);
          addResult('Test Mutfak Bildirimi', false, `Test bildirim hatası: ${error.message}`);
        }
        
      } else {
        addResult('Test Siparişi', false, `Test siparişi oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addDetailedLog('Test Sipariş Exception', `Test sipariş hatası`, error);
      addResult('Test Siparişi', false, `Test sipariş hatası: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Sipariş oluştur
  const createOrder = async () => {
    if (selectedItems.length === 0) {
      addResult('Sipariş Oluşturma', false, 'Lütfen en az 1 ürün seçin!');
      return;
    }

    setIsRunning(true);
    addDetailedLog('Sipariş Oluşturma', 'Sipariş oluşturuluyor...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      const orderPayload = {
        restaurantId: 'aksaray',
        tableNumber: tableNumber,
        items: selectedItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          price: item.price,
          notes: `Debug siparişi - ${item.category}`
        })),
        notes: `Debug test siparişi - ${new Date().toLocaleTimeString()}`,
        orderType: 'dine_in'
      };

      addDetailedLog('Sipariş Payload', `Gönderilecek sipariş verisi`, orderPayload);
      
      const orderResponse = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      addDetailedLog('Sipariş Yanıtı', `Status: ${orderResponse.status} ${orderResponse.statusText}`);
      
      const orderResult = await orderResponse.json();
      addDetailedLog('Sipariş Sonucu', `API'den dönen veri`, orderResult);
      
      if (orderResult.success) {
        addResult('Sipariş Oluşturma', true, `Sipariş başarıyla oluşturuldu! ID: ${orderResult.data.id}`, orderResult.data);
        
        // Mutfak paneline bildirim gönder
        addDetailedLog('Mutfak Bildirimi', 'Mutfak paneline bildirim gönderiliyor...');
        
        try {
          const notificationPayload = {
            eventType: 'new_order',
            data: {
              orderId: orderResult.data.id,
              restaurantId: 'aksaray',
              tableNumber: tableNumber,
              items: selectedItems.map(item => ({
                name: item.name,
                quantity: 1,
                notes: `Debug siparişi - ${item.category}`
              })),
              totalAmount: selectedItems.reduce((sum, item) => sum + item.price, 0),
              timestamp: new Date().toISOString()
            }
          };
          
          const notificationResponse = await fetch(`${apiUrl}/debug/publish-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload),
          });

          addDetailedLog('Bildirim Yanıtı', `Status: ${notificationResponse.status}`);
          
          if (notificationResponse.ok) {
            addResult('Mutfak Bildirimi', true, 'Mutfak paneline bildirim gönderildi!');
          } else {
            addResult('Mutfak Bildirimi', false, 'Mutfak bildirimi gönderilemedi');
          }
        } catch (error: any) {
          addDetailedLog('Bildirim Exception', `Bildirim hatası`, error);
          addResult('Mutfak Bildirimi', false, `Bildirim hatası: ${error.message}`);
        }
        
      } else {
        addResult('Sipariş Oluşturma', false, `Sipariş oluşturulamadı: ${orderResult.message}`, orderResult);
      }

    } catch (error: any) {
      addDetailedLog('Sipariş Exception', `Sipariş hatası`, error);
      addResult('Sipariş Oluşturma', false, `Sipariş hatası: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Sayfa yüklendiğinde menüyü çek
  useEffect(() => {
    const initializeMenu = async () => {
      await loadMenu();
    };
    initializeMenu();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
            <FaBug className="mr-2" />
            Debug Test Sayfası
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sipariş ve API Test Paneli</h1>
          <p className="text-gray-300">Aksaray restoranı için API testleri ve sipariş oluşturma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - Menü ve Seçim */}
          <div className="space-y-6">
            {/* API Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaSync className="mr-2" />
                  API Test
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isRealtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className={`text-sm ${isRealtimeConnected ? 'text-green-300' : 'text-red-300'}`}>
                    {isRealtimeConnected ? 'Real-time Aktif' : 'Real-time Bağlantısız'}
                  </span>
                </div>
              </h2>
              <div className="space-y-3">
                <button
                  onClick={testAPI}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  API Çalışıyor Mu?
                </button>
                <button
                  onClick={checkPanelLoginStatus}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Panel Login Kontrol Et
                </button>
                <button
                  onClick={autoLoginPanels}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
                >
                  Otomatik Login Yap
                </button>
                <button
                  onClick={async () => {
                    addDetailedLog('Aksaray Staff Oluştur', 'Aksaray restoranı için staff üyeleri oluşturuluyor...');
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
                      const response = await fetch(`${apiUrl}/staff/create-aksaray`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      const result = await response.json();
                      if (response.ok) {
                        addResult('Aksaray Staff Oluştur', true, `Aksaray staff üyeleri oluşturuldu! ${result.data.length} üye`, result.data);
                      } else {
                        addResult('Aksaray Staff Oluştur', false, `Staff oluşturulamadı: ${result.message}`);
                      }
                    } catch (error) {
                      addResult('Aksaray Staff Oluştur', false, `Staff oluşturma hatası: ${error}`);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
                >
                  Aksaray Staff Oluştur
                </button>
                <button
                  onClick={async () => {
                    addDetailedLog('Sipariş Analizi', 'Siparişlerin nasıl kaydedildiği analiz ediliyor...');
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
                      
                      // Restoran ID'sini bul
                      const restaurantResponse = await fetch(`${apiUrl}/restaurants`);
                      const restaurantData = await restaurantResponse.json();
                      const aksarayRestaurant = restaurantData.data?.find((r: any) => r.username === 'aksaray');
                      
                      if (aksarayRestaurant) {
                        addDetailedLog('Restoran Bulundu', `Aksaray restoran ID: ${aksarayRestaurant.id}`, aksarayRestaurant);
                        
                        // Siparişleri çek
                        const ordersResponse = await fetch(`${apiUrl}/orders?restaurantId=${aksarayRestaurant.id}&status=pending`);
                        const ordersData = await ordersResponse.json();
                        
                        addDetailedLog('Sipariş Analizi', `Toplam ${ordersData.data?.length || 0} pending sipariş`, ordersData);
                        
                        if (ordersData.data && ordersData.data.length > 0) {
                          // İlk siparişin detaylarını analiz et
                          const firstOrder = ordersData.data[0];
                          addDetailedLog('Sipariş Yapısı', 'İlk siparişin yapısı:', {
                            id: firstOrder.id,
                            restaurantId: firstOrder.restaurantId,
                            tableNumber: firstOrder.tableNumber,
                            status: firstOrder.status,
                            items: firstOrder.items?.map((item: any) => ({
                              id: item.id,
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price
                            })),
                            totalAmount: firstOrder.totalAmount,
                            createdAt: firstOrder.createdAt
                          });
                          
                          addResult('Sipariş Analizi', true, `Siparişler doğru şekilde kaydedilmiş! ${ordersData.data.length} sipariş bulundu`);
                        } else {
                          addResult('Sipariş Analizi', false, 'Hiç sipariş bulunamadı!');
                        }
                      } else {
                        addResult('Sipariş Analizi', false, 'Aksaray restoranı bulunamadı!');
                      }
                    } catch (error) {
                      addResult('Sipariş Analizi', false, `Analiz hatası: ${error}`);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all duration-200"
                >
                  Sipariş Analizi
                </button>
                <button
                  onClick={createTestOrder}
                  disabled={isRunning || restaurantMenu.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Test Siparişi Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaPlay className="mr-2" />
                      <span>Test Siparişi Oluştur</span>
                    </div>
                  )}
                </button>
                {restaurantMenu.length === 0 && (
                  <p className="text-yellow-400 text-sm text-center">
                    ⚠️ Önce menüyü yükleyin
                  </p>
                )}
              </div>
            </div>

            {/* Menü Yükleme */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaList className="mr-2" />
                Menü Yönetimi
              </h2>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-300">
                  {isLoadingMenu ? (
                    <span className="text-blue-400">Menü yükleniyor...</span>
                  ) : restaurantMenu.length > 0 ? (
                    <span className="text-green-400">{restaurantMenu.length} ürün yüklendi</span>
                  ) : (
                    <span className="text-yellow-400">Menü yüklenemedi</span>
                  )}
                </div>
                <button
                  onClick={loadMenu}
                  disabled={isLoadingMenu}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  <FaSync className={isLoadingMenu ? 'animate-spin' : ''} />
                  <span>Yenile</span>
                </button>
              </div>

              {/* Menü Listesi */}
              {restaurantMenu.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {restaurantMenu.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedItems.some(selected => selected.id === item.id)
                          ? 'bg-green-500/20 border-green-500'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        if (selectedItems.some(selected => selected.id === item.id)) {
                          setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
                        } else if (selectedItems.length < 2) {
                          setSelectedItems(prev => [...prev, item]);
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-gray-400 text-sm">{item.category}</div>
                        </div>
                        <div className="text-white font-semibold">₺{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seçilen Ürünler */}
            {selectedItems.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FaShoppingCart className="mr-2" />
                  Seçilen Ürünler ({selectedItems.length}/2)
                </h2>
                
                <div className="space-y-2 mb-4">
                  {selectedItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-gray-400 text-sm">{item.category}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-white font-semibold">₺{item.price}</div>
                        <button
                          onClick={() => setSelectedItems(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Masa Numarası</label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                  />
                </div>

                <div className="text-right mb-4">
                  <div className="text-white font-semibold">
                    Toplam: ₺{selectedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={createOrder}
                  disabled={isRunning}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Sipariş Oluşturuluyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaPlay className="mr-2" />
                      <span>Sipariş Oluştur</span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sağ Panel - Sonuçlar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Test Sonuçları</h2>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-400">
                  {results.length} log
                </div>
                <button
                  onClick={clearResults}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Henüz test yapılmadı. Sol panelden testleri başlatın.
                </div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.success 
                        ? 'bg-green-500/10 border-green-500' 
                        : 'bg-red-500/10 border-red-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {result.success ? (
                        <FaCheckCircle className="text-green-400 text-lg mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaExclamationTriangle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{result.step}</div>
                        <div className={`text-xs mt-1 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                          {result.message}
                        </div>
                        
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                              📋 Detayları Göster
                            </summary>
                            <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 overflow-x-auto max-h-32">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Console Log Info */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-300 text-sm">
                <span>💡</span>
                <span>Detaylı loglar browser console'da da görüntüleniyor (F12 → Console)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Events ve Panel Logları */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Real-time Events */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FaBell className="text-purple-400 text-lg" />
                <h3 className="text-white font-semibold">Real-time Events</h3>
              </div>
              <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {realtimeEvents.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">
                  Henüz real-time event alınmadı
                </div>
              ) : (
                realtimeEvents.map((event, index) => (
                  <div key={index} className="p-2 bg-white/5 rounded text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-300 font-medium">{event.type}</span>
                      <span className="text-gray-400">{event.timestamp}</span>
                    </div>
                    {event.data && (
                      <div className="text-gray-300 truncate">
                        {event.data.orderId ? `Order: ${event.data.orderId}` : JSON.stringify(event.data).substring(0, 50)}...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mutfak Panel Durumu */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <FaUtensils className="text-orange-400 text-lg" />
              <h3 className="text-white font-semibold">Mutfak Paneli</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Real-time:</span>
                <span className={isRealtimeConnected ? 'text-green-300' : 'text-red-300'}>
                  {isRealtimeConnected ? 'Bağlı' : 'Bağlantısız'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">API:</span>
                <span className={kitchenApiStatus?.success ? 'text-green-300' : kitchenApiStatus ? 'text-red-300' : 'text-gray-400'}>
                  {kitchenApiStatus?.success ? `${kitchenApiStatus.orderCount} sipariş` : kitchenApiStatus ? 'Hata' : 'Test edilmedi'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Login:</span>
                <span className={panelLoginStatus?.kitchen?.isLoggedIn ? 'text-green-300' : 'text-red-300'}>
                  {panelLoginStatus?.kitchen?.isLoggedIn ? 'Giriş yapılmış' : 'Giriş yapılmamış'}
                </span>
              </div>
              <button
                onClick={testKitchenAPI}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                API Test Et
              </button>
              <button
                onClick={() => {
                  // Sadece mutfak için login yap
                  const kitchenLogin = async () => {
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
                      const response = await fetch(`${apiUrl}/staff/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'portakal', password: '123456', subdomain: 'aksaray' }),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        const staffInfo = {
                          id: data.data?.id || 'kitchen_staff_1',
                          username: 'portakal',
                          role: 'kitchen',
                          restaurantId: 'aksaray',
                          name: 'Mutfak Personeli',
                          loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('kitchen_staff', JSON.stringify(staffInfo));
                        addResult('Mutfak Login', true, 'Mutfak paneline login başarılı!');
                        setTimeout(checkPanelLoginStatus, 500);
                      }
                    } catch (error) {
                      addResult('Mutfak Login', false, `Login hatası: ${error}`);
                    }
                  };
                  kitchenLogin();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Mutfak Login
              </button>
              <a 
                href="https://aksaray.restxqr.com/kitchen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-orange-400 hover:bg-orange-500 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Mutfak Panelini Aç
              </a>
              <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs">
                <div className="text-orange-300 font-medium">Login: portakal / 123456</div>
              </div>
              {kitchenApiStatus && (
                <div className="mt-2 p-2 bg-gray-500/10 border border-gray-500/20 rounded text-xs">
                  <div className="text-gray-300 font-medium mb-1">API Endpoint:</div>
                  <div className="text-gray-400 break-all">{kitchenApiStatus.endpoint}</div>
                  {kitchenApiStatus.error && (
                    <div className="text-red-300 mt-1">Hata: {kitchenApiStatus.error}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kasa Panel Durumu */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <FaCreditCard className="text-green-400 text-lg" />
              <h3 className="text-white font-semibold">Kasa Paneli</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Real-time:</span>
                <span className={isRealtimeConnected ? 'text-green-300' : 'text-red-300'}>
                  {isRealtimeConnected ? 'Bağlı' : 'Bağlantısız'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">API:</span>
                <span className={cashierApiStatus?.success ? 'text-green-300' : cashierApiStatus ? 'text-red-300' : 'text-gray-400'}>
                  {cashierApiStatus?.success ? `${cashierApiStatus.orderCount} sipariş` : cashierApiStatus ? 'Hata' : 'Test edilmedi'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Login:</span>
                <span className={panelLoginStatus?.cashier?.isLoggedIn ? 'text-green-300' : 'text-red-300'}>
                  {panelLoginStatus?.cashier?.isLoggedIn ? 'Giriş yapılmış' : 'Giriş yapılmamış'}
                </span>
              </div>
              <button
                onClick={testCashierAPI}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                API Test Et
              </button>
              <button
                onClick={() => {
                  // Sadece kasa için login yap
                  const cashierLogin = async () => {
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
                      const response = await fetch(`${apiUrl}/staff/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'armut', password: '123456', subdomain: 'aksaray' }),
                      });
                      if (response.ok) {
                        const data = await response.json();
                        const staffInfo = {
                          id: data.data?.id || 'cashier_staff_1',
                          username: 'armut',
                          role: 'cashier',
                          restaurantId: 'aksaray',
                          name: 'Kasa Personeli',
                          loginTime: new Date().toISOString()
                        };
                        sessionStorage.setItem('cashier_staff', JSON.stringify(staffInfo));
                        addResult('Kasa Login', true, 'Kasa paneline login başarılı!');
                        setTimeout(checkPanelLoginStatus, 500);
                      }
                    } catch (error) {
                      addResult('Kasa Login', false, `Login hatası: ${error}`);
                    }
                  };
                  cashierLogin();
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Kasa Login
              </button>
              <a 
                href="https://aksaray.restxqr.com/cashier/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-400 hover:bg-green-500 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Kasa Panelini Aç
              </a>
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                <div className="text-green-300 font-medium">Login: armut / 123456</div>
              </div>
              {cashierApiStatus && (
                <div className="mt-2 p-2 bg-gray-500/10 border border-gray-500/20 rounded text-xs">
                  <div className="text-gray-300 font-medium mb-1">API Endpoint:</div>
                  <div className="text-gray-400 break-all">{cashierApiStatus.endpoint}</div>
                  {cashierApiStatus.error && (
                    <div className="text-red-300 mt-1">Hata: {cashierApiStatus.error}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}