# RestXQR - Mutfak Otomasyonu ve Gelişmiş Özellikler Roadmap

## ✅ FAZ 1: Mutfak İstasyonu Altyapısı (TAMAMLANDI)

### Backend
- ✅ MenuItem modeline `kitchenStation` field eklendi
- ✅ Migration dosyası oluşturuldu
- ✅ 4 istasyon tanımlandı: izgara, makarna, soguk, tatli

### Frontend - Business Panel
- ✅ Ürün formuna istasyon dropdown'u eklendi
- ✅ Create/Update işlemlerinde kitchenStation gönderiliyor

### Frontend - Mutfak Paneli
- ✅ İstasyon filtresi dropdown'u eklendi
- ⚠️ **YAPILACAK:** Filtreleme mantığı implement edilmeli (filteredOrders fonksiyonuna stationFilter ekle)
- ⚠️ **YAPILACAK:** Ürün kartlarında istasyon badge'i gösterilmeli

---

## 🔄 FAZ 2: Çoklu İstasyon Ekranları

### Amaç
4 ayrı URL ile her istasyon için özel ekran oluşturmak

### Yapılacaklar

#### 2.1 URL Routes Oluştur
```
/mutfak/izgara    → Izgara istasyonu
/mutfak/makarna   → Makarna istasyonu
/mutfak/soguk     → Soğuk istasyon
/mutfak/tatli     → Tatlı istasyonu
```

#### 2.2 Her İstasyon İçin Sayfa Oluştur
- `frontend/src/app/mutfak/izgara/page.tsx`
- `frontend/src/app/mutfak/makarna/page.tsx`
- `frontend/src/app/mutfak/soguk/page.tsx`
- `frontend/src/app/mutfak/tatli/page.tsx`

#### 2.3 Otomatik Filtreleme
Her sayfa sadece kendi istasyonuna ait siparişleri gösterecek:
```tsx
const stationOrders = orders.filter(order => 
  order.items.some(item => item.kitchenStation === 'izgara')
);
```

#### 2.4 Yazıcı Entegrasyonu (İsteğe Bağlı)
Her istasyon için ayrı yazıcı konfigürasyonu

---

## 🏢 FAZ 3: Multi-Branch (Çoklu Şube) Mimarisi

### Amaç
Tek merkezden birden fazla şube yönetimi

### 3.1 Backend - Database Schema

#### Restaurant Modeli Güncelleme
```javascript
// Mevcut Restaurant modeline eklenecek
parentRestaurantId: {
  type: DataTypes.UUID,
  allowNull: true,
  comment: 'Ana restoran ID (şube ise)'
},
branchName: {
  type: DataTypes.STRING(100),
  allowNull: true,
  comment: 'Şube adı (örn: "Kadıköy Şubesi")'
},
branchCode: {
  type: DataTypes.STRING(20),
  allowNull: true,
  unique: true,
  comment: 'Şube kodu (örn: "KDK-01")'
},
isBranch: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  comment: 'Bu bir şube mi?'
}
```

#### Branch Management Routes
```
POST   /api/restaurants/:id/branches          → Yeni şube ekle
GET    /api/restaurants/:id/branches          → Şubeleri listele
PUT    /api/restaurants/:id/branches/:branchId → Şube güncelle
DELETE /api/restaurants/:id/branches/:branchId → Şube sil
GET    /api/restaurants/:id/branches/stats    → Tüm şubeler istatistik
```

### 3.2 Frontend - Branch Management UI

#### Business Panel'e Şube Yönetimi Sekmesi
- Şube listesi
- Yeni şube ekleme formu
- Şube bazlı raporlama
- Şubeler arası ürün/menü kopyalama

#### Şube Seçici Dropdown
Tüm panellerde (Garson, Mutfak, Kasa) aktif şube seçimi

---

## 📱 FAZ 4: Mobil Yönetici Paneli

### Amaç
İşletme sahibinin mobil cihazdan sistemi takip etmesi

### 4.1 Responsive Design İyileştirmeleri

#### Öncelikli Sayfalar
1. Dashboard (Ana sayfa)
2. Canlı Siparişler
3. Günlük Rapor
4. Menü Yönetimi (Basitleştirilmiş)

#### Mobil Optimizasyonlar
```tsx
// Tailwind breakpoints
sm: 640px   → Küçük telefonlar
md: 768px   → Tabletler
lg: 1024px  → Laptop
xl: 1280px  → Desktop
```

### 4.2 Progressive Web App (PWA)
- Offline çalışma desteği
- Ana ekrana ekleme
- Push notification (sipariş bildirimleri)

### 4.3 Mobil-Özel Özellikler
- Swipe gesture'lar (sipariş kaydırma)
- Hızlı aksiyonlar (floating action button)
- Sesli bildirimler

---

## 🛒 FAZ 5: Online Sipariş Entegrasyonları

### 5.1 Yemeksepeti API Entegrasyonu

#### Gerekli Bilgiler
- Yemeksepeti Restaurant API Key
- Webhook URL konfigürasyonu
- Order sync mekanizması

#### Backend Endpoints
```
POST /api/integrations/yemeksepeti/webhook    → Yemeksepeti'nden sipariş al
GET  /api/integrations/yemeksepeti/orders     → Senkronize siparişler
PUT  /api/integrations/yemeksepeti/status     → Durum güncelleme
```

#### Sipariş Mapping
```javascript
{
  source: 'yemeksepeti',
  externalOrderId: 'YS-123456',
  orderType: 'online',
  // ... diğer alanlar
}
```

### 5.2 Getir API Entegrasyonu

#### Benzer Yapı
- Getir API credentials
- Webhook endpoint
- Order sync

### 5.3 Birleşik Sipariş Yönetimi

#### Order Model Güncelleme
```javascript
orderSource: {
  type: DataTypes.ENUM('dine-in', 'yemeksepeti', 'getir', 'manual'),
  defaultValue: 'dine-in'
},
externalOrderId: {
  type: DataTypes.STRING(100),
  allowNull: true
},
deliveryInfo: {
  type: DataTypes.JSONB,
  allowNull: true,
  comment: 'Teslimat bilgileri (adres, telefon, vb.)'
}
```

#### Mutfak Panelinde Gösterim
Online siparişler özel badge ile işaretlenecek:
```tsx
{order.orderSource === 'yemeksepeti' && (
  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
    🛵 Yemeksepeti
  </span>
)}
```

---

## 🔧 Teknik Gereksinimler

### Backend
- Node.js 18+
- PostgreSQL 14+
- Sequelize ORM
- Express.js

### Frontend
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS

### Deployment
- Frontend: Vercel/Netlify
- Backend: Render/Railway
- Database: Supabase/Neon

---

## 📊 Öncelik Sıralaması

1. **YÜ KSEK ÖNCELİK**
   - ✅ FAZ 1: Mutfak İstasyonu (TAMAMLANDI)
   - 🔄 FAZ 2: Çoklu İstasyon Ekranları
   - 🔄 FAZ 3: Multi-Branch Mimarisi

2. **ORTA ÖNCELİK**
   - FAZ 4: Mobil Yönetici Paneli

3. **DÜŞÜK ÖNCELİK**
   - FAZ 5: Online Entegrasyonlar (API erişimi gerekli)

---

## 🚀 Hızlı Başlangıç - Sonraki Adımlar

### Şimdi Yapılacaklar (FAZ 1 Tamamlama)

1. **Mutfak Paneli Filtreleme Mantığını Tamamla**
```tsx
// frontend/src/app/mutfak/page.tsx
const filteredOrders = (() => {
  const filtered = orders.filter(order => {
    // Durum filtresi
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    
    // İstasyon filtresi - YENİ
    if (stationFilter !== 'all') {
      const hasStationItem = order.items.some(item => 
        item.kitchenStation === stationFilter
      );
      if (!hasStationItem) return false;
    }
    
    // Arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.tableNumber.toString().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // ... rest of the function
})();
```

2. **Ürün Kartlarına İstasyon Badge Ekle**
```tsx
{order.items.map((item, index) => (
  <div key={index} className="flex items-center gap-2">
    <div>{item.quantity}x {item.name}</div>
    {item.kitchenStation && (
      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
        {item.kitchenStation === 'izgara' && '🔥 Izgara'}
        {item.kitchenStation === 'makarna' && '🍝 Makarna'}
        {item.kitchenStation === 'soguk' && '🥗 Soğuk'}
        {item.kitchenStation === 'tatli' && '🍰 Tatlı'}
      </span>
    )}
  </div>
))}
```

3. **Backend Migration Çalıştır**
```bash
cd backend
npm run migrate
# veya
node src/migrations/20250114-add-kitchen-station.js
```

---

## 📝 Notlar

- Çince dil desteği şimdilik gerekli değil (kullanıcı talebi)
- Tüm özellikler sırayla implement edilecek
- Her faz tamamlandıktan sonra test edilecek
- Hatalar sonradan düzeltilecek (kullanıcı talebi)

---

**Son Güncelleme:** 14 Ocak 2025
**Durum:** FAZ 1 Tamamlandı, FAZ 2'ye Geçiliyor
