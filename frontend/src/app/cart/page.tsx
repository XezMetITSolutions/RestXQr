'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaShoppingCart,
  FaBell,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCreditCard,
  FaHeart,
  FaGift,
  FaUtensils,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { useCartStore } from '@/store';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';
import SetBrandColor from '@/components/SetBrandColor';
import apiService from '@/services/api';
import useRestaurantStore from '@/store/useRestaurantStore';

function CartPageContent() {
  const { currentLanguage, translate } = useLanguage();
  const { items, tableNumber, removeItem, updateQuantity, clearCart, getMaxPreparationTime, addItem } = useCartStore();
  const { settings } = useBusinessSettingsStore();
  const { currentRestaurant } = useRestaurantStore();
  const [isClient, setIsClient] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'donation' | 'tip'>('card');
  const [tipAmount, setTipAmount] = useState(0);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderItems, setPendingOrderItems] = useState<any[]>([]);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(1);

  const primary = settings.branding.primaryColor;

  useEffect(() => {
    setIsClient(true);

    // Session bilgilerini yükle
    if (typeof window !== 'undefined') {
      const storedSessionKey = sessionStorage.getItem('session_key');
      const storedClientId = sessionStorage.getItem('client_id');
      if (storedSessionKey && storedClientId) {
        setSessionKey(storedSessionKey);
        setClientId(storedClientId);
      }

      // Sipariş sonrası durumu yükle (localStorage'dan)
      const storedOrderId = localStorage.getItem('pending_order_id');
      const storedOrderItems = localStorage.getItem('pending_order_items');
      if (storedOrderId) {
        setPendingOrderId(storedOrderId);
      }
      if (storedOrderItems) {
        try {
          setPendingOrderItems(JSON.parse(storedOrderItems));
        } catch (e) {
          console.error('Sipariş ürünleri parse hatası:', e);
        }
      }
    }
  }, []);

  // Aktif siparişleri çek (Geçmiş siparişler görünümü için)
  useEffect(() => {
    if (!isClient) return;

    const fetchActiveOrders = async () => {
      let rId = currentRestaurant?.id;

      // restaurantId yoksa subdomain'den bul (handlePayment'taki mantık)
      if (!rId && typeof window !== 'undefined') {
        try {
          const sub = window.location.hostname.split('.')[0];
          const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
          const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
          const res = await fetch(`${API}/restaurants`);
          const data = await res.json();
          const found = Array.isArray(data?.data) ? data.data.find((r: any) => r.username === sub) : null;
          rId = found?.id;
        } catch (e) {
          console.error('Restaurant resolve error:', e);
        }
      }

      if (rId && tableNumber) {
        try {
          const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
          const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
          const response = await fetch(`${API}/orders?restaurantId=${rId}&tableNumber=${tableNumber}`);
          const data = await response.json();

          if (data.success && data.data && data.data.length > 0) {
            // En son siparişi pendingOrderId olarak al
            const lastOrder = data.data[0];
            setPendingOrderId(lastOrder.id);

            // Tüm aktif siparişlerin ürünlerini birleştir
            const allItems: any[] = [];
            data.data.forEach((order: any) => {
              if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                  allItems.push({
                    itemId: item.id || item.menuItemId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    notes: item.notes
                  });
                });
              }
            });
            setPendingOrderItems(allItems);
          }
        } catch (error) {
          console.error('Aktif siparişler çekilemedi:', error);
        }
      }
    };

    fetchActiveOrders();
  }, [isClient, tableNumber, currentRestaurant]);

  // Session'dan sepet ve aktif kullanıcı sayısını güncelle (polling)
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
            const currentCart = items;

            // Sepet farklıysa güncelle
            const sessionCartNormalized = sessionCart.map((item: any) => ({
              itemId: String(item.itemId || item.id),
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })).sort((a: any, b: any) => String(a.itemId || '').localeCompare(String(b.itemId || '')));

            const currentCartNormalized = currentCart.map(item => ({
              itemId: item.itemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })).sort((a, b) => (a.itemId || '').localeCompare(b.itemId || ''));

            if (JSON.stringify(sessionCartNormalized) !== JSON.stringify(currentCartNormalized)) {
              // Session'dan gelen sepeti yükle
              clearCart();
              sessionCart.forEach((item: any) => {
                addItem({
                  itemId: String(item.itemId || item.id),
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
  }, [sessionKey, clientId, items, clearCart, addItem]);



  // Calculate totals - items undefined olabilir, güvenli kontrol
  const subtotal = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + tipAmount + donationAmount;

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, quantity);
    }
  };

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (isSubmitting) return;

    console.log('💳 ÖDE ME İŞLEMİ BAŞLADI:', {
      timestamp: new Date().toLocaleString(),
      paymentMethod,
      tipAmount: tipAmount + '₺',
      donationAmount: donationAmount + '₺',
      subtotal: subtotal + '₺',
      total: total + '₺'
    });

    setIsSubmitting(true);
    try {
      // Resolve restaurantId (fallback to subdomain lookup if not in store)
      let restaurantId = currentRestaurant?.id as string | undefined;

      console.log('🏪 RESTORAN BİLGİSİ:', {
        currentRestaurant,
        restaurantId,
        kaynak: restaurantId ? 'currentRestaurant store' : 'subdomain lookup gerekli'
      });

      if (!restaurantId && typeof window !== 'undefined') {
        try {
          const sub = window.location.hostname.split('.')[0];
          const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
          const API = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

          console.log('🔍 SUBDOMAIN LOOKUP:', { subdomain: sub, apiUrl: API });

          const res = await fetch(`${API}/restaurants`);
          const data = await res.json();
          const found = Array.isArray(data?.data) ? data.data.find((r: any) => r.username === sub) : null;
          restaurantId = found?.id;

          console.log('✅ SUBDOMAIN LOOKUP SONUCU:', { found, restaurantId });
        } catch (e) {
          console.error('❌ Restaurant resolve failed:', e);
        }
      }

      if (!restaurantId) {
        console.error('❌ RESTORAN ID BULUNAMADI!');
        alert('Restoran bilgisi alınamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }

      // Backend'e sipariş gönder
      const orderData = {
        restaurantId,
        tableNumber: tableNumber || undefined,
        items: (items || []).map(item => ({
          menuItemId: item.itemId || item.id,
          name: typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün'),
          quantity: item.quantity,
          unitPrice: item.price,
          price: item.price,
          notes: item.notes || ''
        })),
        notes: `Ödeme yöntemi: ${paymentMethod === 'cash' ? 'nakit' : paymentMethod}, Bahşiş: ${tipAmount}₺, Bağış: ${donationAmount}₺`,
        orderType: 'dine_in'
      };

      console.log('📦 SİPARİŞ VERİSİ:', {
        restaurantId,
        restaurantName: currentRestaurant?.name || 'Bilinmiyor',
        tableNumber: tableNumber || 'Belirtilmemiş',
        itemCount: items.length,
        items: items.map(i => `${typeof i.name === 'string' ? i.name : (i.name?.tr || i.name?.en || 'Ürün')} x${i.quantity}`),
        totalAmount: total + '₺',
        paymentMethod,
        orderData
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      console.log('🌐 API ENDPOINT:', `${apiUrl}/orders`);

      const response = await apiService.createOrder(orderData);

      console.log('📨 API YANITI:', response);

      if (response.success) {
        console.log('✅ SİPARİŞ BAŞARILI!', {
          orderId: response.data?.id,
          status: response.data?.status,
          createdAt: response.data?.created_at
        });

        // Sipariş ID'sini kaydet
        const orderId = response.data?.id;
        if (orderId) {
          setPendingOrderId(orderId);

          // Siparişteki ürünleri kaydet (ekran gösterimi için)
          const orderItems = (items || []).map(item => ({
            itemId: item.itemId || item.id,
            name: typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün'),
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || '',
            image: item.image
          }));

          setPendingOrderItems(orderItems);

          // localStorage'a kaydet (sayfa yenilendiğinde kaybolmasın)
          localStorage.setItem('pending_order_id', orderId);
          localStorage.setItem('pending_order_items', JSON.stringify(orderItems));
        }

        // Session'a sipariş tamamlandı bildirimi gönder
        if (sessionKey && clientId && orderId) {
          try {
            await apiService.notifyOrderComplete(sessionKey, clientId, orderId);
            console.log('✅ Session\'a sipariş tamamlandı bildirimi gönderildi');
          } catch (error) {
            console.error('Session bildirim hatası:', error);
          }
        }

        // Sepeti temizleme - sipariş verilen ürünler gösterilecek
        clearCart();
        setShowPaymentModal(false);
        setTipAmount(0);
        setDonationAmount(0);

        console.log('✅ Sipariş verildi, sepet temizlendi ve sipariş verilen ürünler gösterilecek');
      } else {
        console.error('❌ SİPARİŞ BAŞARISIZ:', response);
        alert('❌ Sipariş gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('❌ SİPARİŞ HATASI:', error);
      alert('❌ Sipariş gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Ödeme işlemi tamamlandı');
    }
  };

  const handleTip = () => {
    setShowTipModal(true);
  };

  const handleDonation = () => {
    setShowDonationModal(true);
  };



  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SetBrandColor />
      <main className="min-h-screen pb-20">
        {/* Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-3 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/menu" className="mr-2">
                <FaArrowLeft size={16} />
              </Link>
              <h1 className="text-dynamic-lg font-bold text-primary">
                <TranslatedText>Sepet</TranslatedText>
              </h1>
              <div className="ml-2 flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: 'var(--tone1-bg)', color: 'var(--tone1-text)', border: '1px solid var(--tone1-border)' }}>
                  <TranslatedText>{`Masa #${tableNumber}`}</TranslatedText>
                </div>
                {activeUsersCount > 1 && (
                  <div className="px-2 py-1 rounded-lg text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                    <FaUsers className="text-xs" />
                    <span>{activeUsersCount} kişi</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>


        {/* Cart Items */}
        <div className={`pt-16 px-3 py-4`}>
          {/* Sipariş verilen ürünler gösteriliyorsa */}
          {pendingOrderId && pendingOrderItems.length > 0 && (
            <>
              {/* Yeni Ürün Ekle Butonu - Üstte */}
              <div className="mb-6">
                <Link
                  href="/menu"
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  <FaPlus />
                  <TranslatedText>Yeni Ürün Ekle</TranslatedText>
                </Link>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  <TranslatedText>Siparişi Verilmiş Olanlar</TranslatedText>
                </h2>
                <div className="bg-blue-50 border-blue-200 border-2 rounded-xl p-4 mb-4 shadow-sm">
                  <p className="text-sm font-medium text-blue-800">
                    <TranslatedText>👨‍🍳 Siparişiniz mutfağa iletildi. Afiyet olsun!</TranslatedText>
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {pendingOrderItems.map((item) => (
                  <div key={item.itemId || item.id} className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-4 flex opacity-90 transition-all hover:opacity-100">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-food.jpg'}
                        alt={typeof item.name === 'string' ? item.name : 'Product'}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800">
                          {typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                        </h3>
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">
                          <TranslatedText>Sipariş Verildi</TranslatedText>
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-500">
                          {`${item.quantity} Adet × ₺${item.price}`}
                        </span>
                        <span className="font-bold text-lg" style={{ color: primary }}>
                          {`₺${(item.price * item.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Yeni eklenen ürünler varsa (siparişten sonra) */}
          {pendingOrderId && items && items.length > 0 && (
            <div className="mt-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-800">
                  <TranslatedText>Siparişe Eklenecekler</TranslatedText>
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.itemId} className="bg-white rounded-xl shadow-sm border-2 border-blue-100 p-3 flex">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-food.jpg'}
                        alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-gray-800">
                          {typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-red-400 p-1"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                            className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                            className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>
                        <span className="font-bold text-sm" style={{ color: primary }}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100 shadow-sm text-center">
                <p className="text-blue-700 text-sm mb-4 font-medium">
                  <TranslatedText>Sepetinizde sipariş edilmemiş yeni ürünler var. Bunları mevcut siparişinize eklemek için siparişi onaylayın.</TranslatedText>
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  <FaShoppingCart />
                  <TranslatedText>Ek Siparişi Gönder</TranslatedText>
                </button>
              </div>
            </div>
          )}

          {/* Normal sepet görünümü (sipariş verilmediyse) */}
          {!pendingOrderId && (!items || items.length === 0) ? (
            <div className="text-center py-12">
              <FaShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                <TranslatedText>Sepetiniz boş</TranslatedText>
              </h3>
              <p className="text-gray-500 mb-6">
                <TranslatedText>Menüden ürün ekleyerek başlayın</TranslatedText>
              </p>
              <Link
                href="/menu"
                className="btn btn-primary px-6 py-3 rounded-lg"
              >
                <TranslatedText>Menüye Git</TranslatedText>
              </Link>
            </div>
          ) : !pendingOrderId && items && items.length > 0 ? (
            <>
              {/* Cart Items List */}
              <div className="space-y-3 mb-6">
                {(items || []).map((item) => (
                  <div key={item.itemId} className="bg-white rounded-lg shadow-sm border p-3 flex">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder-food.jpg'}
                        alt={typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-dynamic-sm">
                          {typeof item.name === 'string' ? item.name : (item.name?.tr || item.name?.en || 'Ürün')}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        ₺{item.price.toFixed(2)}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <span className="font-semibold text-dynamic-sm" style={{ color: primary }}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Options */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-semibold text-dynamic-sm mb-4">
                  <TranslatedText>Ödeme Seçenekleri</TranslatedText>
                </h3>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                  >
                    <FaCreditCard className={paymentMethod === 'card' ? 'text-blue-500' : 'text-gray-500'} />
                    <span className="text-sm font-medium">
                      <TranslatedText>Kart</TranslatedText>
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                  >
                    <FaUser className={paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-500'} />
                    <span className="text-sm font-medium">
                      <TranslatedText>Nakit</TranslatedText>
                    </span>
                  </button>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <button
                    onClick={handleTip}
                    className="w-full p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <FaHeart className="text-pink-500" />
                      <span className="text-sm font-medium">
                        <TranslatedText>Garsona Bahşiş</TranslatedText>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      <TranslatedText>{`₺${tipAmount.toFixed(2)}`}</TranslatedText>
                    </span>
                  </button>

                  <button
                    onClick={handleDonation}
                    className="w-full p-3 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <FaGift className="text-green-500" />
                      <span className="text-sm font-medium">
                        <TranslatedText>Bağış Yap</TranslatedText>
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      <TranslatedText>{`₺${donationAmount.toFixed(2)}`}</TranslatedText>
                    </span>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-semibold text-dynamic-sm mb-3">
                  <TranslatedText>Sipariş Özeti</TranslatedText>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span><TranslatedText>Ara Toplam</TranslatedText></span>
                    <span>₺{subtotal.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span><TranslatedText>Bahşiş</TranslatedText></span>
                      <span>₺{tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {donationAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span><TranslatedText>Bağış</TranslatedText></span>
                      <span>₺{donationAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-dynamic-sm">
                    <span><TranslatedText>Toplam</TranslatedText></span>
                    <span style={{ color: primary }}>₺{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary py-4 rounded-lg font-semibold text-dynamic-sm"
              >
                <TranslatedText>Siparişi Tamamla</TranslatedText>
              </button>
            </>
          ) : null}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-lg">
          <div className="container mx-auto flex justify-around">
            <Link href="/menu" className="flex flex-col items-center" style={{ color: primary }}>
              <FaUtensils className="mb-0.5" size={16} />
              <span className="text-[10px]"><TranslatedText>Menü</TranslatedText></span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center" style={{ color: primary }}>
              <div className="relative">
                <FaShoppingCart className="mb-0.5" size={16} />
                {items && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                    {items.length}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Ödeme Onayı</TranslatedText>
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Toplam Tutar:</TranslatedText>
              </p>
              <p className="text-2xl font-bold" style={{ color: primary }}>
                ₺{total.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                <TranslatedText>Siparişi Tamamla</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Bahşiş Miktarı</TranslatedText>
            </h3>

            {/* Yüzde Butonları */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Hızlı Seçim</TranslatedText>
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setTipAmount(subtotal * 0.03)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  3% - ₺{(subtotal * 0.03).toFixed(2)}
                </button>
                <button
                  onClick={() => setTipAmount(subtotal * 0.05)}
                  className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  5% - ₺{(subtotal * 0.05).toFixed(2)}
                </button>
                <button
                  onClick={() => setTipAmount(subtotal * 0.10)}
                  className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  10% - ₺{(subtotal * 0.10).toFixed(2)}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText>Manuel Miktar</TranslatedText>
              </label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                <TranslatedText>Tamam</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              <TranslatedText>Bağış Miktarı</TranslatedText>
            </h3>

            {/* Yüzde Butonları */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <TranslatedText>Hızlı Seçim</TranslatedText>
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setDonationAmount(subtotal * 0.03)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  3% - ₺{(subtotal * 0.03).toFixed(2)}
                </button>
                <button
                  onClick={() => setDonationAmount(subtotal * 0.05)}
                  className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  5% - ₺{(subtotal * 0.05).toFixed(2)}
                </button>
                <button
                  onClick={() => setDonationAmount(subtotal * 0.10)}
                  className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  10% - ₺{(subtotal * 0.10).toFixed(2)}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText>Manuel Miktar</TranslatedText>
              </label>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TranslatedText>İptal</TranslatedText>
              </button>
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 py-2 px-4 btn btn-primary rounded-lg"
              >
                <TranslatedText>Tamam</TranslatedText>
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default function CartPage() {
  return (
    <LanguageProvider>
      <CartPageContent />
    </LanguageProvider>
  );
}
