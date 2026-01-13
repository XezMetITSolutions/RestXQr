# Cloudinary Entegrasyonu - Kalıcı Resim Depolama

## Problem
Render.com'da dosyalar geçici (ephemeral) dosya sistemine kaydediliyor. Sunucu yeniden başladığında veya yeni deploy yapıldığında tüm yüklenen resimler siliniyor.

## Çözüm
Cloudinary cloud depolama servisi kullanılarak resimler kalıcı olarak saklanıyor.

---

## 🔧 Kurulum Adımları

### 1. Cloudinary Hesabı Açın
1. https://cloudinary.com adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'a gidin

### 2. API Bilgilerini Alın
Dashboard'da şu bilgileri bulacaksınız:
- **Cloud Name**: `dxxxxxxxxx`
- **API Key**: `1234567890`
- **API Secret**: `aBcDeFgHiJkLmNoPqRsTuVwXyZ`

### 3. Render.com'da Environment Variables Ekleyin

1. https://dashboard.render.com adresine gidin
2. Backend servisinizi seçin (restxqr-backend)
3. **Environment** sekmesine gidin
4. Şu değişkenleri ekleyin:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | `dxxxxxxxxx` (Dashboard'dan alın) |
| `CLOUDINARY_API_KEY` | `1234567890` (Dashboard'dan alın) |
| `CLOUDINARY_API_SECRET` | `aBcDeFgHiJkLmNoPqRsTuVwXyZ` (Dashboard'dan alın) |

5. **Save Changes** butonuna tıklayın
6. Servis otomatik olarak yeniden başlayacak

---

## ✅ Test Etme

Environment variables eklendikten sonra, upload testi yapabilirsiniz:

```bash
# Test endpoint'i
curl https://your-backend-url.onrender.com/api/upload/test
```

Başarılı yanıt:
```json
{
  "success": true,
  "message": "Upload route çalışıyor",
  "storage": "cloudinary",
  "cloudinaryConfigured": true
}
```

---

## 📁 Dosya Yapısı

```
backend/src/
├── lib/
│   └── cloudinary.js      # Cloudinary yapılandırması
├── routes/
│   └── upload.js          # Upload endpoint'leri
└── index.js               # Ana dosya (upload endpoint dahil)
```

---

## 🔗 API Endpoint'leri

### POST /api/upload/image
Tek resim yükleme

**Request:**
```
Content-Type: multipart/form-data
Body: image (file)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/xxx/image/upload/v123/restxqr/products/img_xxx.jpg",
    "publicId": "restxqr/products/img_xxx",
    "width": 800,
    "height": 600
  }
}
```

### POST /api/upload/images
Çoklu resim yükleme (max 10)

### DELETE /api/upload/image/:publicId
Resim silme

---

## 💡 Notlar

- Cloudinary ücretsiz plan: 25 GB depolama, 25 GB bandwidth/ay
- Resimler otomatik olarak optimize ediliyor (800x800 max, WebP format)
- CDN üzerinden hızlı dağıtım
- Resimler asla kaybolmaz!

---

## 🔄 Eski Resimlerin Taşınması

Eğer eski resimleriniz varsa ve taşımak istiyorsanız, yeni bir resim yükleyerek Cloudinary'ye taşıyabilirsiniz. Mevcut ürün resimlerini güncellemek için:

1. Menü yönetim panelinden ürünü düzenleyin
2. Yeni resim yükleyin
3. Kaydedin

Yeni resim Cloudinary'ye kaydedilecek ve kalıcı olacak.
