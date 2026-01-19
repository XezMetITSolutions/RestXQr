# 🖨️ Bondrucker Çok Dilli Karakter Desteği

## Sorun
ESC/POS termal yazıcılar standart ASCII kodları kullanır ve Türkçe (ğ, ü, ş, ı, ö, ç) ve Çince karakterleri doğrudan desteklemez.

## ✅ Çözümler

### 1. Code Page Kullanımı (ÖNERİLEN)

Her dil için özel kod sayfası (code page) kullanılır:

| Dil | Code Page | Character Set |
|-----|-----------|---------------|
| Türkçe | CP857 / CP1254 | PC857_TURKISH |
| Çince (Basitleştirilmiş) | GB18030 | GB18030 |
| Çince (Geleneksel) | BIG5 | BIG5 |
| Arapça | CP864 | PC864_ARABIC |
| Rusça | CP866 | PC866_CYRILLIC |
| İngilizce | CP437 | PC437_USA |

### 2. Nasıl Çalışır?

#### a) **iconv-lite** ile Encoding
```javascript
const iconv = require('iconv-lite');

// Türkçe metni CP857 ile encode et
const text = 'Çiğ Köfte - Özel Şişli';
const encoded = iconv.encode(text, 'CP857');
```

#### b) **Manuel Karakter Değişimi**
```javascript
// Fallback: Karakterleri doğrudan hex kodlarına çevir
const turkishCharMap = {
  'ç': '\x87',  // CP857'de ç karakteri
  'Ç': '\x80',
  'ğ': '\x98',
  'Ğ': '\xA6',
  'ı': '\x8D',
  'İ': '\x98',
  'ö': '\x94',
  'Ö': '\x99',
  'ş': '\x9E',
  'Ş': '\x9D',
  'ü': '\x81',
  'Ü': '\x9A'
};
```

#### c) **Yazıcıya Code Page Gönderme**
```javascript
// ESC/POS komutu ile code page değiştir
printer.setCharacterSet(CharacterSet.PC857_TURKISH);

// veya ESC t n komutu
// ESC = 0x1B
// t = 0x74
// n = code page numarası (5 = CP857)
```

### 3. Kullanılan Kütüphaneler

#### **iconv-lite** (v0.6.3)
- Karakter encoding/decoding
- 100+ code page desteği
- Node.js için optimize edilmiş

#### **node-thermal-printer** (v4.4.3)
- Character set değiştirme desteği
- ESC/POS komutları
- Network yazıcı desteği

#### **escpos** (v3.0.0)
- Low-level ESC/POS kontrol
- Code page manuel ayarlama

## 📋 Code Page Listesi

### Türkçe İçin:
- **CP857** (IBM PC Turkish) - ✅ Önerilen
- **CP1254** (Windows Turkish)
- **ISO-8859-9** (Latin-5 Turkish)

### Çince İçin:
- **GB18030** (Çin standardı) - ✅ Önerilen Basitleştirilmiş
- **BIG5** (Taiwan, Hong Kong) - ✅ Önerilen Geleneksel
- **GB2312** (Eski format)

### Diğer Diller:
- **CP862** - İbranice
- **CP864** - Arapça
- **CP866** - Rusça/Kiril
- **CP874** - Tay dili
- **CP936** - Çince basit (GBK)

## 🔧 Implementasyon

### Backend Service Güncellemesi

```javascript
class PrinterService {
  constructor() {
    this.stations = {
      kitchen: {
        codePage: 'CP857',           // Türkçe
        characterSet: CharacterSet.PC857_TURKISH
      },
      chinese_station: {
        codePage: 'GB18030',         // Çince
        characterSet: CharacterSet.GB18030
      }
    };
  }

  encodeText(text, codePage = 'CP857') {
    try {
      return iconv.encode(text, codePage);
    } catch (error) {
      // Fallback: Manuel değişim
      return this.convertTurkishChars(text);
    }
  }

  async printOrder(station, orderData) {
    const config = this.stations[station];
    
    // Code page ayarla
    printer.setCharacterSet(config.characterSet);
    
    // Metni encode et
    const encodedText = this.encodeText(orderData.text, config.codePage);
    printer.println(encodedText);
  }
}
```

## 🧪 Test Örnekleri

### Türkçe Test
```javascript
const testOrder = {
  orderNumber: 'TEST-001',
  tableNumber: '5',
  items: [
    { 
      quantity: 1, 
      name: 'Çiğ Köfte - Özel Şişli',
      notes: 'Yoğurtlu ve acılı sos'
    },
    { 
      quantity: 2, 
      name: 'İçli Köfte',
      notes: 'Ekstra bulgur'
    },
    { 
      quantity: 1, 
      name: 'Künefe - Fıstıklı',
      notes: 'Üstüne maraş dondurması'
    }
  ]
};
```

### Çince Test
```javascript
const chineseOrder = {
  orderNumber: 'TEST-002',
  tableNumber: '8',
  items: [
    { 
      quantity: 1, 
      name: '宫保鸡丁',  // Kung Pao Chicken
      notes: '不要辣椒'   // No chili
    }
  ]
};
```

## ⚠️ Önemli Notlar

### 1. Yazıcı Desteği
Tüm yazıcılar tüm code page'leri desteklemez. Yazdırma öncesi test edin.

### 2. Font Desteği
Çince karakterler için yazıcıda uygun font olmalı (genelde EPSON yazıcılarda vardır).

### 3. Fallback Stratejisi
```javascript
// 1. Önce iconv-lite ile dene
// 2. Manuel karakter değişimi yap
// 3. Son çare: Transliteration (ç → c)
```

### 4. Performance
- Code page değişimi her yazdırmada yapılır
- Encoding CPU kullanır ama hızlıdır
- Cache mekanizması eklenebilir

## 📊 Karakter Code Tablosu (CP857 - Türkçe)

| Karakter | Hex | Decimal | ASCII |
|----------|-----|---------|-------|
| ç | 0x87 | 135 | - |
| Ç | 0x80 | 128 | - |
| ğ | 0x98 | 152 | - |
| Ğ | 0xA6 | 166 | - |
| ı | 0x8D | 141 | - |
| İ | 0x98 | 152 | - |
| ö | 0x94 | 148 | - |
| Ö | 0x99 | 153 | - |
| ş | 0x9E | 158 | - |
| Ş | 0x9D | 157 | - |
| ü | 0x81 | 129 | - |
| Ü | 0x9A | 154 | - |

## 🎯 Sonuç

✅ **Türkçe karakter desteği**: CP857 ile tam destek
✅ **Çince karakter desteği**: GB18030 ile tam destek
✅ **Fallback mekanizması**: Her durumda yazdırma garantisi
✅ **Multi-language**: Aynı anda farklı diller için farklı istasyonlar

## 📚 Kaynaklar

- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [iconv-lite Documentation](https://github.com/ashtuchkin/iconv-lite)
- [Code Page Encodings](https://en.wikipedia.org/wiki/Code_page)
- [Character Sets for ESC/POS](https://escpos.readthedocs.io/en/latest/font_a.html)
