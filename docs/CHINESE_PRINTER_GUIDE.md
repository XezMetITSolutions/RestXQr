# Çince Yazıcı Desteği - Kullanım Kılavuzu

## 🇨🇳 Aşçılar için Çince Sipariş Fişleri

RestXQR sistemi artık yazıcılardan **Çince** çıktı alabilmenizi destekliyor!

### ✨ Özellikler

- ✅ **Çince Karakter Desteği** - GB18030 encoding ile tam Çince karakter desteği
- ✅ **İstasyon Bazlı Dil Seçimi** - Her yazıcı için ayrı dil ayarı
- ✅ **Otomatik Çeviri Desteği** - Ürün adları otomatik çevrilebilir
- ✅ **Çok Dilli Sipariş Fişleri** - Türkçe ve Çince aynı anda

### 📋 Kurulum Adımları

#### 1. Yazıcı Yönetim Sayfasına Gidin

```
Business Panel → Yazıcı Yönetimi (Printers)
```

#### 2. İstasyon Yapılandırması

Her istasyon (örn: Mutfak, Bar, Tatlı) için:

1. **"Yapılandır"** butonuna tıklayın
2. **IP Adresi** girin (örn: `192.168.1.100`)
3. **Port** ayarlayın (genellikle `9100`)
4. **Dil seçin**:
   - 🇹🇷 **Türkçe** - Türk personel için
   - 🇨🇳 **中文 (Çince)** - Çinli aşçılar için
5. **Aktif** kutusunu işaretleyin
6. **Kaydet** butonuna tıklayın

#### 3. Test Yazdırma

Ayarları kaydettikten sonra:

1. **"Test Yazdır"** butonuna tıklayın
2. Yazıcıdan Çince test fişi çıkacak

### 📝 Çince Fiş Örneği

```
═══════════════════════════════════
         厨房 (MUTFAK)
═══════════════════════════════════

订单号: ORD-2026-001
桌号: 5
时间: 2026-01-21 18:30:45

───────────────────────────────────

产品:

2x 烤肉串
   备注: 不要辣椒

1x 土耳其咖啡
   备注: 加糖

3x 果仁蜜饼

───────────────────────────────────

        请享用!

═══════════════════════════════════
```

### 🔧 Backend Konfigürasyonu

Eğer manuel olarak istasyon eklemek isterseniz:

```javascript
// backend/src/index.js veya başka bir başlangıç dosyasında

const printerService = require('./services/printerService');

// Çinli aşçılar için mutfak yazıcısı
printerService.addOrUpdateStation('kitchen', {
    name: '厨房', // "Mutfak" Çince
    ip: '192.168.1.100',
    port: 9100,
    enabled: true,
    type: 'epson',
    language: 'zh', // Çince
    characterSet: 'PC936_CHINESE',
    codePage: 'GB18030'
});

// Türk personel için bar yazıcısı
printerService.addOrUpdateStation('bar', {
    name: 'Bar',
    ip: '192.168.1.101',
    port: 9100,
    enabled: true,
    type: 'epson',
    language: 'tr', // Türkçe
    characterSet: 'PC857_TURKISH',
    codePage: 'CP857'
});
```

### 🌐 Ürün Adlarını Çinceye Çevirme

#### Yöntem 1: Veritabanında Çince İsim Ekleyin

Ürünlerinize `nameChinese` alanı ekleyin:

```javascript
{
    name: "Adana Kebap",
    nameChinese: "阿达纳烤肉串",
    price: 120,
    category: "Ana Yemek"
}
```

#### Yöntem 2: Otomatik Çeviri (Gelecekte)

`printerService.js` dosyasındaki `translateProductName` fonksiyonunu bir çeviri API'si ile entegre edebilirsiniz:

```javascript
async translateProductName(text, targetLanguage = 'zh') {
    // DeepL API örneği
    const response = await fetch('https://api.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: [text],
            target_lang: targetLanguage === 'zh' ? 'ZH' : 'TR'
        })
    });
    
    const data = await response.json();
    return data.translations[0].text;
}
```

### 🎯 Kullanım Senaryoları

#### Senaryo 1: Çinli Aşçılar için Mutfak

```javascript
// Mutfak yazıcısını Çince olarak ayarlayın
language: 'zh'
```

Sipariş geldiğinde:
- Masa numarası: **桌号: 5**
- Ürünler: **2x 烤肉串**
- Notlar: **备注: 不要辣椒**

#### Senaryo 2: Karma Ekip

- **Mutfak** → Çince (厨房)
- **Bar** → Türkçe
- **Tatlı** → Türkçe

Her istasyon kendi dilinde fiş alır!

### ⚙️ Desteklenen Yazıcılar

- ✅ **EPSON** (TM-T20, TM-T88 serisi)
- ✅ **STAR** (TSP100, TSP650 serisi)
- ✅ **ESC/POS** protokolünü destekleyen tüm yazıcılar

### 🐛 Sorun Giderme

#### Problem: Çince karakterler düzgün görünmüyor

**Çözüm:**
1. Yazıcınızın GB18030 code page'i desteklediğinden emin olun
2. Yazıcı ayarlarında character set'i kontrol edin
3. Firmware güncellemesi gerekebilir

#### Problem: Yazıcı bağlanamıyor

**Çözüm:**
1. IP adresinin doğru olduğundan emin olun
2. Yazıcı ve sunucu aynı ağda mı kontrol edin
3. Port 9100'ün açık olduğundan emin olun
4. Firewall ayarlarını kontrol edin

#### Problem: Test yazdırma başarılı ama sipariş yazdırmıyor

**Çözüm:**
1. Backend loglarını kontrol edin
2. İstasyon ID'lerinin doğru eşleştiğinden emin olun
3. Sipariş verirken doğru istasyonun seçildiğini kontrol edin

### 📞 Destek

Sorun yaşarsanız:
1. Backend loglarını kontrol edin: `console.log` çıktıları
2. Yazıcı durum kontrolü yapın: "Bağlantıyı Test Et" butonu
3. Test yazdırma yapın

### 🚀 Gelecek Özellikler

- [ ] Otomatik çeviri API entegrasyonu (DeepL/Google Translate)
- [ ] Daha fazla dil desteği (Arapça, İngilizce, Almanca)
- [ ] QR kod ile çok dilli menü
- [ ] Müşteri tercihine göre fiş dili

---

**Not:** Bu özellik `node-thermal-printer` kütüphanesi kullanılarak geliştirilmiştir ve GB18030 character set'i ile Çince karakterleri destekler.
