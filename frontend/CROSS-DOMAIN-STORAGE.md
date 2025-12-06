# Cross-Domain localStorage Implementation

## 📋 Genel Bakış

Bu implementasyon, tüm subdomain'lerin (kardesler.guzellestir.com, lezzet.guzellestir.com, vb.) aynı localStorage verilerine erişmesini sağlar.

## 🏗️ Mimari

### 1. Storage Bridge (`/public/storage-bridge.html`)
Ana domain'de (guzellestir.com) host edilen iframe tabanlı köprü sayfası. Tüm subdomain'ler bu sayfaya postMessage ile erişir.

**Özellikler:**
- ✅ Origin kontrolü ile güvenlik
- ✅ getItem, setItem, removeItem, clear operasyonları
- ✅ Asenkron mesajlaşma

### 2. CrossDomainStorage Utility (`/src/utils/crossDomainStorage.ts`)
Storage Bridge ile iletişim kuran sınıf.

**Özellikler:**
- ✅ Promise tabanlı API
- ✅ Timeout yönetimi
- ✅ Fallback to localStorage
- ✅ Singleton pattern

### 3. CrossDomainStorageAdapter (`/src/utils/crossDomainStorageAdapter.ts`)
Zustand persist middleware için adapter.

**Özellikler:**
- ✅ Synchronous API (cache layer ile)
- ✅ Background async sync
- ✅ Dual write (localStorage + cross-domain)
- ✅ Cache öncelikli okuma

### 4. Storage Config (`/src/store/storageConfig.ts`)
Merkezi konfigürasyon yöneticisi.

## 🚀 Kullanım

### Store Oluşturma

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistOptions } from './storageConfig';

const useMyStore = create()(
  persist(
    (set, get) => ({
      // store state ve actions
    }),
    createPersistOptions('my-store-name')
  )
);
```

### Manuel Kullanım

```typescript
import { getCrossDomainStorage } from '@/utils/crossDomainStorage';

const storage = getCrossDomainStorage();

// Async operations
await storage.setItem('key', 'value');
const value = await storage.getItem('key');
await storage.removeItem('key');
await storage.clear();
```

## 📦 Güncellenen Store'lar

Tüm Zustand store'lar cross-domain storage kullanacak şekilde güncellendi:

- ✅ `useRestaurantStore` - Restoran verileri
- ✅ `useAuthStore` - Authentication
- ✅ `useCartStore` - Sepet
- ✅ `useBusinessSettingsStore` - İşletme ayarları
- ✅ `useOrderStore` - Siparişler
- ✅ `useNotificationStore` - Bildirimler
- ✅ `useQRStore` - QR kodlar
- ✅ `useLanguageStore` - Dil ayarları
- ✅ `usePaymentHistoryStore` - Ödeme geçmişi
- ✅ `useWaiterStore` - Garson istekleri
- ✅ `useReportsStore` - Raporlar
- ✅ `useCentralOrderStore` - Merkezi siparişler
- ✅ `useBillRequestStore` - Hesap istekleri

## 🔒 Güvenlik

### Origin Kontrolü
```javascript
const ALLOWED_ORIGINS = [
  'https://guzellestir.com',
  'http://localhost:3000'
];

// Tüm *.guzellestir.com subdomain'leri otomatik kabul edilir
```

### Güvenli İletişim
- PostMessage API kullanımı
- Request ID ile mesaj eşleştirme
- Timeout mekanizması

## ⚡ Performans

### Cache Layer
- İlk yüklemede tüm veriler cache'e alınır
- Okuma işlemleri cache'den yapılır (synchronous)
- Yazma işlemleri hem cache hem storage'a yapılır (dual write)

### Fallback Stratejisi
1. Cross-domain storage dene
2. Timeout veya hata durumunda localStorage kullan
3. Her durumda veri kaybı önlenir

## 🧪 Test

### Lokal Test
```bash
# localhost:3000'de çalışır
npm run dev
```

### Production Test
```
https://guzellestir.com/debug/
https://kardesler.guzellestir.com/debug/
https://lezzet.guzellestir.com/debug/
```

Her subdomain'den oluşturulan restoranlar, diğer subdomain'lerde ve admin panelinde görünür.

## 🐛 Troubleshooting

### Bridge Yüklenmiyorsa
- Console'da "Storage Bridge initialized" mesajını kontrol edin
- Network sekmesinde `/storage-bridge.html` isteğini kontrol edin
- CORS hatası varsa domain konfigürasyonunu kontrol edin

### Veriler Senkronize Olmuyorsa
- Her iki domain'de de aynı store name kullanıldığından emin olun
- localStorage'da veri olup olmadığını kontrol edin
- Tarayıcı console'unda hata mesajlarını kontrol edin

### Cache Problemi
- Sayfayı yenileyin (F5)
- localStorage'ı manuel temizleyin
- Hard refresh yapın (Ctrl+F5)

## 📝 Notes

### Avantajlar
- ✅ Subdomain'ler arası veri paylaşımı
- ✅ Merkezi localStorage yönetimi
- ✅ Automatic fallback
- ✅ Type-safe implementation

### Dezavantajlar
- ⚠️ Minimal gecikme (postMessage overhead)
- ⚠️ İlk yüklemede initialization gerekli
- ⚠️ Storage Bridge sayfası her subdomain'de yüklenmeliş

### Alternatifler
- Server-side storage (Database)
- Cookie-based storage
- IndexedDB with shared worker

## 🔄 Deployment

### Gereksinimler
1. `storage-bridge.html` ana domain'de erişilebilir olmalı
2. CORS headers doğru ayarlanmalı
3. Tüm subdomain'ler HTTPS kullanmalı (production)

### Deployment Checklist
- [ ] `public/storage-bridge.html` deployed
- [ ] Domain'ler whitelist'e eklendi
- [ ] HTTPS aktif (production)
- [ ] Test edildi

## 📚 Kaynaklar

- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Cross-Domain Storage Pattern](https://blog.guya.net/2015/06/12/sharing-localstorage-between-subdomains/)

---

**Son Güncelleme:** 2025-10-07
**Versiyon:** 1.0.0
**Geliştirici:** XezMet IT Solutions
