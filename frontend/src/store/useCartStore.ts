import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { createPersistOptions } from './storageConfig';
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface CartItem {
  id: string;
  itemId: string;
  name: {
    en: string;
    tr: string;
  };
  price: number;
  quantity: number;
  image?: string;
  notes?: string; // müşteri özel istek notu
  preparationTime?: number; // hazırlık süresi (dakika)
}

interface CartState {
  items: CartItem[];
  preparingItems: CartItem[]; // Hazırlanan ürünler
  couponCode: string | null;
  tipPercentage: number;
  tableNumber: number;
  orderStatus: 'idle' | 'preparing' | 'ready' | 'completed';
  paid: boolean;
  restaurantId: string | null; // Her restoran için ayrı sepet
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  setCouponCode: (code: string | null) => void;
  setTipPercentage: (percentage: number) => void;
  setTableNumber: (tableNumber: number) => void;
  setOrderStatus: (status: 'idle' | 'preparing' | 'ready' | 'completed') => void;
  setRestaurantId: (restaurantId: string) => void; // Restaurant değiştiğinde sepeti temizle
  markPaidAndClear: () => void;
  resetTable: () => void;
  moveToPreparing: () => void; // Aktif ürünleri hazırlanan bölümüne taşı
  
  // Computed values
  getTotalItems: () => number;
  getActiveItems: () => number; // Sadece aktif (hazırlanmayan) ürünlerin sayısı
  getSubtotal: () => number;
  getDiscount: () => number;
  getTipAmount: () => number;
  getTotal: () => number;
  getMaxPreparationTime: () => number; // En uzun hazırlık süresi
}

const useCartStore = create<CartState>()((set, get) => ({
      items: [],
      preparingItems: [], // Hazırlanan ürünler
      couponCode: null,
      tipPercentage: 10, // Default tip percentage
      tableNumber: 0, // Default table number - sadece QR kod ile geldiğinde ayarlanacak
      orderStatus: 'idle', // Default order status
      paid: false,
      restaurantId: null, // Restaurant ID
      
      addItem: (item) => {
        const state = get();
        const items = [...state.items];
        const existingItemIndex = items.findIndex(i => i.itemId === item.itemId);
        
        // Yeni ürün eklenirken sipariş durumunu idle'a çevir (hazırlanan ürünleri etkilemez)
        if (existingItemIndex >= 0) {
          // Item already exists, update quantity
          items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          items.push({ ...item, id: generateId() });
        }
        
        set({ 
          items,
          orderStatus: 'idle' 
        });
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const state = get();
        const updatedItems = state.items.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        set({ 
          items: updatedItems, 
          orderStatus: 'idle' 
        });
      },

      updateNotes: (id, notes) => {
        const state = get();
        const updatedItems = state.items.map(item => 
          item.id === id ? { ...item, notes } : item
        );
        set({ items: updatedItems });
      },
      
      clearCart: () => {
        set({ items: [], preparingItems: [], couponCode: null, tipPercentage: 10, orderStatus: 'idle', paid: false });
      },
      
      setCouponCode: (code) => {
        set({ couponCode: code });
      },
      
      setTipPercentage: (percentage) => {
        set({ tipPercentage: percentage });
      },
      
      setTableNumber: (tableNumber) => {
        set({ tableNumber });
      },
      
      setOrderStatus: (status) => {
        set({ orderStatus: status });
      },
      
      // Restaurant değiştiğinde sepeti temizle
      setRestaurantId: (restaurantId) => {
        const currentRestaurantId = get().restaurantId;
        // Eğer farklı bir restorana geçiyorsa sepeti temizle
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          set({ 
            items: [], 
            preparingItems: [], 
            couponCode: null, 
            tipPercentage: 10, 
            orderStatus: 'idle', 
            paid: false,
            restaurantId 
          });
        } else {
          set({ restaurantId });
        }
      },

      // Ödeme alındıktan sonra sepeti sıfırla ve paid=true kaydet
      markPaidAndClear: () => {
        // Ödeme tamamlandığında QR token'ı geçersizleştir
        const qrToken = sessionStorage.getItem('qr_token');
        if (qrToken) {
          // Backend'e token geçersizleştirme isteği gönder
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qr/deactivate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId: qrToken })
          }).catch(error => {
            console.error('Token geçersizleştirme hatası:', error);
          });
          
          // Local storage'dan token'ı kaldır
          sessionStorage.removeItem('qr_token');
          console.log('✅ Ödeme tamamlandı, QR token geçersizleştirildi');
        }
        
        set({ items: [], preparingItems: [], couponCode: null, tipPercentage: 10, orderStatus: 'completed', paid: true });
      },

      // Masa tamamlandığında tabloyu default hale getir (örn. 0) ve sepeti temizle
      resetTable: () => {
        set({ items: [], preparingItems: [], couponCode: null, tipPercentage: 10, orderStatus: 'idle', paid: false, tableNumber: 0 });
      },
      
      moveToPreparing: () => {
        const state = get();
        set({ 
          preparingItems: [...state.preparingItems, ...state.items],
          items: [],
          orderStatus: 'preparing'
        });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getActiveItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const couponCode = get().couponCode;
        
        // Simple discount logic - can be expanded
        if (couponCode === 'WELCOME10') {
          return subtotal * 0.1; // 10% discount
        } else if (couponCode === 'MASAPP20') {
          return subtotal * 0.2; // 20% discount
        }
        
        return 0;
      },
      
      getTipAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const tipPercentage = get().tipPercentage;
        
        return (subtotal - discount) * (tipPercentage / 100);
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const tipAmount = get().getTipAmount();
        
        return subtotal - discount + tipAmount;
      },
      
      getMaxPreparationTime: () => {
        const items = get().items;
        if (items.length === 0) return 0;
        
        const maxTime = Math.max(...items.map(item => item.preparationTime || 0));
        return maxTime;
      },
}));

export default useCartStore;
