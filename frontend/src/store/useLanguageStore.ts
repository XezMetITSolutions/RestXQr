import { create } from 'zustand';

type Language = 'en' | 'tr';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: {
    [key: string]: {
      en: string;
      tr: string;
    };
  };
  t: (key: string) => string;
  tAI: (text: string, context?: string) => Promise<string>;
  isTranslating: boolean;
}

const useLanguageStore = create<LanguageState>()((set, get) => ({
      language: 'en', // Default language
      isTranslating: false,
      
      setLanguage: (language) => {
        set({ language });
      },
      
      translations: {
        // Common UI elements
        appName: {
          en: 'MASAPP',
          tr: 'MASAPP',
        },
        menu: {
          en: 'Menu',
          tr: 'Menü',
        },
        cart: {
          en: 'Cart',
          tr: 'Sepet',
        },
        waiter: {
          en: 'Waiter',
          tr: 'Garson',
        },
        table: {
          en: 'Table',
          tr: 'Masa',
        },
        
        // Menu page
        categories: {
          en: 'Categories',
          tr: 'Kategoriler',
        },
        popular: {
          en: 'Popular',
          tr: 'Popüler',
        },
        all: {
          en: 'All',
          tr: 'Tümü',
        },
        addToCart: {
          en: 'Add to Cart',
          tr: 'Sepete Ekle',
        },
        
        // Cart page
        yourOrder: {
          en: 'Your Order',
          tr: 'Siparişiniz',
        },
        emptyCart: {
          en: 'Your cart is empty',
          tr: 'Sepetiniz boş',
        },
        subtotal: {
          en: 'Subtotal',
          tr: 'Ara Toplam',
        },
        discount: {
          en: 'Discount',
          tr: 'İndirim',
        },
        tip: {
          en: 'Tip',
          tr: 'Bahşiş',
        },
        total: {
          en: 'Total',
          tr: 'Toplam',
        },
        applyCoupon: {
          en: 'Apply Coupon',
          tr: 'Kupon Uygula',
        },
        placeOrder: {
          en: 'Place Order',
          tr: 'Sipariş Ver',
        },
        
        // Waiter page
        callWaiter: {
          en: 'Call Waiter',
          tr: 'Garson Çağır',
        },
        quickRequests: {
          en: 'Quick Requests',
          tr: 'Hızlı İstekler',
        },
        customRequest: {
          en: 'Custom Request',
          tr: 'Özel İstek',
        },
        water: {
          en: 'Water',
          tr: 'Su',
        },
        bill: {
          en: 'Bill',
          tr: 'Hesap',
        },
        cleanTable: {
          en: 'Clean Table',
          tr: 'Masa Temizliği',
        },
        help: {
          en: 'Help',
          tr: 'Yardım',
        },
        send: {
          en: 'Send',
          tr: 'Gönder',
        },
        activeRequests: {
          en: 'Active Requests',
          tr: 'Aktif İstekler',
        },
        
        // Item detail page
        quantity: {
          en: 'Quantity',
          tr: 'Adet',
        },
        ingredients: {
          en: 'Ingredients',
          tr: 'İçindekiler',
        },
        allergens: {
          en: 'Allergens',
          tr: 'Alerjenler',
        },
        calories: {
          en: 'Calories',
          tr: 'Kalori',
        },
        servingInfo: {
          en: 'Serving Info',
          tr: 'Servis Bilgisi',
        },
        
        // Admin
        dashboard: {
          en: 'Dashboard',
          tr: 'Panel',
        },
        qrGenerator: {
          en: 'QR Generator',
          tr: 'QR Oluşturucu',
        },
        settings: {
          en: 'Settings',
          tr: 'Ayarlar',
        },
      },
      
      t: (key) => {
        const currentLanguage = get().language;
        const translation = get().translations[key];
        
        if (!translation) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
        
        return translation[currentLanguage] || key;
      },

      tAI: async (text, context) => {
        const currentLanguage = get().language;
        
        // Eğer zaten hedef dilde ise çeviri yapma
        if (currentLanguage === 'en' && /^[a-zA-Z\s.,!?]+$/.test(text)) {
          return text;
        }
        if (currentLanguage === 'tr' && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s.,!?]+$/.test(text)) {
          return text;
        }

        set({ isTranslating: true });
        
        try {
          const translatedText = await aiTranslationService.translate(text, {
            targetLanguage: currentLanguage,
            context,
            useCache: true
          });
          
          set({ isTranslating: false });
          return translatedText;
        } catch (error) {
          console.error('AI Translation error:', error);
          set({ isTranslating: false });
          return text; // Hata durumunda orijinal metni döndür
        }
      },
}));

export default useLanguageStore;
