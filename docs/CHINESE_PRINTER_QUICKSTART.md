# 🇨🇳 Çince Yazıcı Desteği - Hızlı Başlangıç

## ✅ Yapılan Değişiklikler

### Backend Değişiklikleri

1. **`printerService.js`** - Çok dilli destek eklendi
   - ✅ Çince karakter desteği (GB18030)
   - ✅ İstasyon bazlı dil ayarı
   - ✅ Otomatik çeviri altyapısı
   - ✅ Dile göre fiş formatı

2. **`routes/printers.js`** - Dil parametresi eklendi
   - ✅ PUT endpoint'ine `language` parametresi

3. **`index.js`** - Örnek istasyonlar
   - ✅ Mutfak (厨房) - Çince
   - ✅ Bar - Türkçe
   - ✅ Tatlı - Türkçe

### Frontend Değişiklikleri

1. **`printers/page.tsx`** - Dil seçimi UI
   - ✅ Dil seçim dropdown'u
   - ✅ Station interface'ine `language` field
   - ✅ Dil bilgisi gösterimi

## 🚀 Nasıl Kullanılır?

### Adım 1: Yazıcı Yönetim Sayfasına Gidin

```
Business Panel → Printers (Yazıcı Yönetimi)
```

### Adım 2: İstasyon Yapılandırın

**Çinli Aşçılar için:**

1. "kitchen" istasyonunu seçin
2. **Yapılandır** butonuna tıklayın
3. Ayarları yapın:
   - **IP Adresi**: `192.168.1.100` (yazıcınızın IP'si)
   - **Port**: `9100`
   - **Dil**: 🇨🇳 **中文 (Çince)** seçin
   - **Aktif**: ✅ İşaretleyin
4. **Kaydet**

### Adım 3: Test Yazdırma

1. **"Test Yazdır"** butonuna tıklayın
2. Yazıcıdan Çince test fişi çıkacak:

```
═══════════════════════════════════
         厨房
═══════════════════════════════════

订单号: TEST-1737482588000
桌号: TEST-MASA
时间: 2026-01-21 18:30:45

───────────────────────────────────

产品:

2x 烤肉串
   备注: 不要辣椒

───────────────────────────────────

        请享用!

═══════════════════════════════════
```

## 📋 Çince Fiş İçeriği

| Türkçe | Çince | Açıklama |
|--------|-------|----------|
| Sipariş No | 订单号 | Order Number |
| Masa | 桌号 | Table Number |
| Tarih | 时间 | Time/Date |
| ÜRÜNLER | 产品 | Products |
| NOT | 备注 | Notes |
| AFİYET OLSUN | 请享用 | Enjoy your meal |

## 🔧 Teknik Detaylar

### Desteklenen Character Sets

- **Türkçe**: CP857 (PC857_TURKISH)
- **Çince**: GB18030 (PC936_CHINESE)

### Yazıcı Gereksinimleri

- ✅ ESC/POS protokolü desteği
- ✅ GB18030 code page desteği
- ✅ Network bağlantısı (TCP/IP)
- ✅ Port 9100 açık

### Önerilen Yazıcılar

- EPSON TM-T20II
- EPSON TM-T88V
- STAR TSP100
- STAR TSP650

## 🌐 Ürün Adlarını Çinceye Çevirme

### Yöntem 1: Veritabanında Çince İsim (Önerilen)

Ürünlerinize `nameChinese` alanı ekleyin:

```javascript
{
  name: "Adana Kebap",
  nameChinese: "阿达纳烤肉串",
  price: 120
}
```

### Yöntem 2: Otomatik Çeviri (Gelecekte)

`printerService.js` dosyasındaki `translateProductName` fonksiyonunu bir çeviri API'si ile entegre edebilirsiniz.

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Sadece Çinli Aşçılar

```javascript
// Tüm mutfak yazıcılarını Çince yap
kitchen: language = 'zh'
```

### Senaryo 2: Karma Ekip

```javascript
// Her istasyon kendi dilinde
kitchen: language = 'zh'  // Çinli aşçılar
bar: language = 'tr'      // Türk personel
dessert: language = 'tr'  // Türk personel
```

### Senaryo 3: Çok Lokasyonlu

```javascript
// Şube 1: Çinli ekip
location1_kitchen: language = 'zh'

// Şube 2: Türk ekip
location2_kitchen: language = 'tr'
```

## 🐛 Sorun Giderme

### Problem: Çince karakterler görünmüyor

**Çözüm:**
1. Yazıcınızın GB18030 desteği olduğunu kontrol edin
2. Yazıcı firmware'ini güncelleyin
3. Character set ayarını kontrol edin

### Problem: Yazıcı bağlanamıyor

**Çözüm:**
1. IP adresini ping ile test edin: `ping 192.168.1.100`
2. Port 9100'ün açık olduğunu kontrol edin
3. Yazıcı ve sunucu aynı ağda mı?
4. Firewall ayarlarını kontrol edin

### Problem: Test başarılı ama sipariş yazdırmıyor

**Çözüm:**
1. Backend loglarını kontrol edin
2. İstasyon ID'lerinin eşleştiğinden emin olun
3. Sipariş verirken doğru istasyonu seçin

## 📚 Daha Fazla Bilgi

Detaylı kullanım kılavuzu için:
- 📖 `docs/CHINESE_PRINTER_GUIDE.md`

## 🎯 Sonraki Adımlar

- [ ] Ürünlerinize Çince isimler ekleyin
- [ ] Yazıcı IP adreslerini yapılandırın
- [ ] Test yazdırma yapın
- [ ] Gerçek sipariş ile test edin

---

**Not:** Bu özellik `node-thermal-printer` kütüphanesi kullanılarak geliştirilmiştir.
